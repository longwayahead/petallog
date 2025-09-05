import pool from "../config/db.js";

export async function getActions() {
    const [rows] = await pool.execute(
        `SELECT 
        id as actionID,
        name as actionName,
        name_past as actionNamePast,
        description as actionDescription,
        flow as actionFlow,
        icon as actionIcon,
        colour as actionColour,
        background as actionBackground,
        sort as actionSort
        FROM actions
        WHERE deleted = 0
        ORDER BY sort ASC
        `
    );
    return rows;

}

