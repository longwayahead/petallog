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

export async function getFeed(limit = 20, offset = 0) {
  const [rows] = await pool.execute(
    `
    SELECT
      i.id AS interactionID,
      i.plant_id AS plantID,
      pl.friendly_name AS plantName,
      pl.species AS plantSpecies,
      pl.alive AS plantAlive,
      n.id AS plantPhotoID,
      n.url AS plantPhotoURL,
      n.thumbnail_url AS plantPhotoThumbnailURL,
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
        COALESCE(
          GROUP_CONCAT(
            CASE 
              WHEN p.id IS NOT NULL THEN JSON_OBJECT(
                'id', p.id,
                'url', p.url,
                'thumbnail_url', p.thumbnail_url,
                'created_at', p.created_at
              )
            END
            ORDER BY p.created_at DESC
          ),
          ''
        ),
        ']'
      ) AS photos
    FROM interactions i
    LEFT JOIN plants pl ON pl.id = i.plant_id
    LEFT JOIN actions a ON a.id = i.action_id
    LEFT JOIN photos p ON p.interaction_id = i.id
    LEFT JOIN photos n ON n.id = pl.photo_id
    WHERE a.deleted = 0
      AND i.deleted = 0
    GROUP BY i.id
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  return rows.map((row) => ({
    ...row,
    photos: row.photos ? JSON.parse(row.photos).filter((p) => p) : [],
  }));
}
