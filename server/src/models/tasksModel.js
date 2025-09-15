import pool from "../config/db.js";

export async function getTasks() {
  const [rows] = await pool.query(`
    SELECT 
      t.id AS taskID,
      p.id AS plantID,
      p.friendly_name AS plantName,
      o.thumbnail_url as plantPhoto,
      ts.name AS statusName,
      ts.sort AS statusSort,
      e.name AS effectName,
      CONCAT(
        '[',
        GROUP_CONCAT(
          JSON_OBJECT(
            'actionID', a.id,
            'actionName', a.name,
            'actionIcon', a.icon,
            'actionColour', a.colour,
            'actionBackground', a.background
          )
        ),
        ']'
      ) AS actions
    FROM tasks t
    LEFT JOIN plants p ON t.plants_id = p.id
    LEFT JOIN photos o ON o.id = p.photo_id
    LEFT JOIN effects e ON t.effect_id = e.id
    LEFT JOIN tasks_statuses ts ON t.status_id = ts.id
    LEFT JOIN actions_effects ae ON ae.effects_id = e.id
    LEFT JOIN actions a ON a.id = ae.actions_id
    WHERE t.status_id = 1
    GROUP BY t.id, p.id, ts.id, e.id
  `);

  return rows.map((row) => ({
    ...row,
    actions: row.actions ? JSON.parse(row.actions) : [], // 🔹 parse here
  }));
}


export async function markTaskComplete(id) {
  await pool.query("UPDATE tasks SET status = 2, completed_at = NOW() WHERE id = ? AND completed_at IS NULL", [id]);
  return { id, status: "done" };
}

export async function markCompleteByPlantEffect(plantId, effectId) {
  const [result] = await pool.execute(
    `UPDATE tasks t
SET t.completed_at = NOW(), t.status_id = 2
WHERE t.plants_id = ?
  AND t.effect_id = ?
  AND t.completed_at IS NULL`,
    [plantId, effectId]
  );
  return result;
}

export async function snoozeTask(id) {
  await pool.query("UPDATE tasks SET status = 3 WHERE id = ?", [id]);
  return { id, status: "snoozed" };
}