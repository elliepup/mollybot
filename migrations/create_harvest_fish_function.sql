
DECLARE
    v_fish_rarity VARCHAR;
    v_essence_amount BIGINT;
    v_new_essence BIGINT;
BEGIN
    -- Get fish rarity and verify ownership
    SELECT rarity INTO v_fish_rarity
    FROM caught_fish 
    WHERE catch_id = p_catch_id 
    AND current_owner_id = p_user_id;

    -- If no fish found or not owned
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fish not found or not owned by user';
    END IF;

    -- Calculate essence based on rarity
    v_essence_amount := CASE v_fish_rarity
        WHEN 'common' THEN 1
        WHEN 'uncommon' THEN 3
        WHEN 'rare' THEN 8
        WHEN 'epic' THEN 15
        WHEN 'legendary' THEN 35
        WHEN 'mythical' THEN 50
    END;

    -- Delete the fish
    DELETE FROM caught_fish 
    WHERE catch_id = p_catch_id;

    -- Update user's astral essence
    UPDATE economy_profiles 
    SET astral_essence = astral_essence + v_essence_amount
    WHERE user_id = p_user_id
    RETURNING astral_essence INTO v_new_essence;

    -- Return success response
    RETURN json_build_object(
        'success', true,
        'essence_gained', v_essence_amount,
        'new_total', v_new_essence
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
