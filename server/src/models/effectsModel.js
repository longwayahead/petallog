import pool from "../config/db.js";

export async function getEffects() {
    const [rows] = await pool.execute(
        `SELECT 
            e.id as effectID,
            e.name as effectName,
            e.verb as effectVerb,
            a.id as actionID,
            a.name as actionName,
            a.name_past as actionNamePast,
            a.description as actionDescription,
            a.icon as actionIcon,
            a.colour as actionColour,
            a.background as actionBackground,
            a.flow as actionFlow,
            a.sort as actionSort
        
        FROM effects e
        LEFT JOIN actions_effects ae on e.id = ae.effects_id
        LEFT JOIN actions a on a.id = ae.actions_id
        WHERE e.deleted = 0
        AND a.deleted = 0
        AND ae.actions_id = ae.effects_id
        AND e.id in ('1', '2', '3','7','8')
        ORDER BY a.sort ASC
        `
    );
    return rows;
}