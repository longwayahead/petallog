import pool from "../config/db.js";

export async function findAllPlants() {
  const [rows] = await pool.query(`SELECT * 
    p.*,
    o.url as plantPhoto
    FROM plants p
    LEFT JOIN photos o on o.id = p.photo_id`);
  return rows;
}

export async function findPlant(id) {
  const [rows] = await pool.query(`SELECT 
    p.id as plantId,
    p.friendly_name as plantName,
    p.species,
    p.acquired_at as acquiredAt,
    p.acquired_from as acquiredFrom,
    p.notes as plantNotes,
    t.id as potId,
    t.friendly_name as potName,
    t.location as potLocation,
    o.url as plantPhoto
    FROM plants p
    LEFT JOIN plants_pots pp on p.id = pp.plants_id AND pp.ended_at is null
    LEFT JOIN pots t on pp.pots_id = t.id
    LEFT JOIN photos o on o.id = p.photo_id
    WHERE p.id = ?
    `, [id]);
  return rows[0];
}

export async function findPendingTasks(plantId) {
  const [rows] = await pool.query(
    `SELECT 
  t.plants_id as plantId,
  t.id as taskID,
  t.effect_id as effectID,
  e.name as effectName,
  t.status_id as statusId,
  ts.name as statusName,
  t.due_date as dueDate
FROM tasks t
LEFT JOIN tasks_statuses ts ON ts.id = t.status_id
LEFT JOIN effects e ON e.id = t.effect_id
WHERE t.plants_id = ? AND t.status_id = 1
ORDER BY t.due_date ASC, e.name ASC
    `,
    [plantId]
  );
  return rows;
}

export async function findCarePreferences(plantId) {
  const [rows] = await pool.query(
    `
    SELECT 
      pe.id as plantsEffectsID,
      pe.frequency_days as frequencyDays,
      e.id as effectID,
      e.name as effectName,

      -- pick one "representative" action for display
      a.name as actionName,
      a.name_past as namePast,
      a.description as actionDescription,
      a.icon as actionIcon,
      a.colour as actionColour,
      a.background as actionBackground

    FROM plants_effects pe
    LEFT JOIN effects e ON e.id = pe.effect_id
    -- use actions_effects to get actions tied to that effect
    LEFT JOIN actions_effects ae ON ae.effects_id = e.id
    LEFT JOIN actions a ON a.id = ae.actions_id

    WHERE pe.plant_id = ?
      AND e.deleted = 0
      AND a.deleted = 0
    GROUP BY pe.id, e.id
    ORDER BY e.name ASC
    `,
    [plantId]
  );
  return rows;
}


export async function findInteractions(plantId) {
  const [rows] = await pool.query(
    `SELECT
  i.id AS interactionID,
  i.plant_id AS plantID,
  i.action_id AS actionID,
  a.name AS actionName,
  a.name_past AS actionNamePast,
  a.icon AS actionIcon,
  a.colour AS actionColour,
  a.background AS actionBackground,
  i.note AS interactionNote,
  i.created_at AS createdAt,
  CONCAT(
    '[',
    GROUP_CONCAT(
      JSON_OBJECT(
        'id', p.id,
        'url', p.url,
        'created_at', p.created_at
      )
      ORDER BY p.created_at DESC
    ),
    ']'
  ) AS photos
FROM interactions i
LEFT JOIN actions a ON a.id = i.action_id
LEFT JOIN photos p ON p.interaction_id = i.id
WHERE i.plant_id = ?
  AND a.deleted = 0
  AND i.deleted = 0
GROUP BY i.id
ORDER BY i.created_at DESC
    `,
    [plantId]
  );
  return rows.map(row => ({
  ...row,
  photos: row.photos
    ? JSON.parse(row.photos).filter(p => p && p.id !== null)
    : [],
}));
}

export async function setProfilePhoto(plantId, photoId) {
  const [result] = await pool.query(
    "UPDATE plants SET photo_id = ? WHERE id = ?",
    [photoId, plantId]
  );
  return result.affectedRows > 0;
}

export async function assignPlantPot(plantId, potId) {
    await pool.query(`UPDATE plants_pots SET ended_at = NOW() WHERE plants_id = ? AND ended_at IS NULL`, [plantId]); 

    const assign = await pool.query(`INSERT INTO plants_pots (plants_id, pots_id) VALUES (?, ?)`, [plantId, potId]);
    const newRowId = assign[0].insertId;
    if(assign[0].affectedRows > 0) {
        const pot = await pool.query(`UPDATE pots SET status = 2 WHERE id = ?`, [potId]);
        console.log(pot);
        return pot[0];
    }
    return null;
}
