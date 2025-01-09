CREATE OR REPLACE FUNCTION process_rod_pulls(
    p_user_id VARCHAR,
    p_cost BIGINT,
    p_rod_types VARCHAR[],
    p_rod_ids VARCHAR[]
) RETURNS json AS $$
DECLARE
    v_new_balance BIGINT;
    v_new_rods VARCHAR[] := '{}';
    v_rod_type VARCHAR;
    v_rod_id VARCHAR;
    i INT;
BEGIN
    -- First deduct the essence cost
    UPDATE economy_profiles 
    SET astral_essence = astral_essence - p_cost
    WHERE user_id = p_user_id
    RETURNING astral_essence INTO v_new_balance;

    -- Process each rod
    FOR i IN 1..array_length(p_rod_types, 1)
    LOOP
        v_rod_type := p_rod_types[i];
        v_rod_id := p_rod_ids[i];

        -- Insert new rod with provided ID
        INSERT INTO fishing_rods (rod_id, user_id, rod_type)
        VALUES (v_rod_id, p_user_id, v_rod_type);

        -- Check if this is the user's first rod of this type
        IF (
            SELECT COUNT(*) = 1 
            FROM fishing_rods 
            WHERE user_id = p_user_id AND rod_type = v_rod_type
        ) THEN
            v_new_rods := array_append(v_new_rods, v_rod_type);
        END IF;
    END LOOP;

    -- Return success response
    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'new_rods', v_new_rods
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;