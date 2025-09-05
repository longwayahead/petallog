import pool from "../config/db.js";

export async function createInteraction(plantId, actionId, note=null) {
    const [result] = await pool.execute(
        `INSERT INTO interactions (plant_id, action_id, note)   VALUES (?, ?, ?)`,
        [plantId, actionId, note]
    );
    
    const [rows] = await pool.execute(
        `SELECT 
        i.id as interactionID,
        i.plant_id as plantID,
        i.action_id as actionID,
        a.name as actionName,
        a.name_past as actionNamePast,
        a.icon as actionIcon,
        a.colour as actionColour,
        a.background as actionBackground,
        p.foods_id as plantFoodsID,
        f.resets_watering as foodResetsWatering,
        i.note as interactionNote,
        i.created_at as createdAt

        FROM interactions i

        LEFT JOIN actions a on a.id = i.action_id
        LEFT JOIN plants p on p.id = i.plant_id
        LEFT JOIN foods f on f.id = p.foods_id

        WHERE i.id = ?`,
        [result.insertId]
    );
    return rows[0];
}

export async function findEffects(actionId) {
  const [rows] = await pool.execute(
    `
    SELECT 
      e.id   AS effectID,
      e.name AS effectName
    FROM effects e
    INNER JOIN actions_effects ae 
      ON ae.effects_id = e.id
    WHERE ae.actions_id = ?
      AND ae.deleted = 0
    `,
    [actionId]
  );

  return rows; // return ALL effects, not just the first one
}

export async function recordEffectCompletion(plantId, effectId, interactionId) {
  const [result] = await pool.execute(
    `INSERT INTO plants_effects_complete (plant_id, effect_id, interaction_id)
     VALUES (?, ?, ?)`,
    [plantId, effectId, interactionId]
  );
  return result;
}


export async function updateInteractionNote(id, note) {
    const [result] = await pool.query(
                `UPDATE interactions SET note = ? WHERE id = ?`,
                [note, id]
            );
    return result;
}

export async function deleteInteraction(id) {
    const [result] = await pool.query(
        `UPDATE interactions SET deleted = 1 WHERE id = ?`,
        [id]
    );
    return result;
}
