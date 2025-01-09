CREATE OR REPLACE FUNCTION sell_fish(
    p_user_id VARCHAR,
    p_catch_id VARCHAR,
    p_fish_value BIGINT
) RETURNS json AS $$
DECLARE
    v_new_balance BIGINT;
BEGIN
    -- Delete the fish first
    DELETE FROM caught_fish 
    WHERE catch_id = p_catch_id 
    AND current_owner_id = p_user_id;

    -- If no rows were deleted, fish doesn't exist or user doesn't own it
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fish not found or not owned by user';
    END IF;

    -- Update user's wallet balance and get new balance
    UPDATE economy_profiles 
    SET wallet_balance = wallet_balance + p_fish_value
    WHERE user_id = p_user_id
    RETURNING wallet_balance INTO v_new_balance;

    -- If no rows were updated, user profile doesn't exist
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Return success response with new balance
    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Return error response
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;