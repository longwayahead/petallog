import pool from "../config/db.js";

export async function getTasks() {
  const [rows] = await pool.query(`
    SELECT 
      t.id AS taskID,
      t.due_date AS taskDueDate,
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
    actions: row.actions ? JSON.parse(row.actions) : [],
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
  await pool.query("UPDATE tasks SET status_id = 3 WHERE id = ?", [id]);
  return { id, status: "snoozed" };
}

export async function getPlantEffectRules() {
  const [rows] = await pool.query(`
    SELECT pe.plant_id, pe.effect_id, pe.frequency_days, pe.flexible,
           p.created_at AS plant_created_at
    FROM plants_effects pe
    JOIN plants p ON p.id = pe.plant_id
    WHERE p.alive = 1
  `);
  return rows;
}

export async function getLastCompletion(plantId, effectId) {
  const [[row]] = await pool.query(
    `SELECT MAX(completed) AS last_completed
     FROM plants_effects_complete
     WHERE plant_id = ? AND effect_id = ?`,
    [plantId, effectId]
  );
  return row?.last_completed;
}

export async function getLastTask(plantId, effectId) {
  const [[row]] = await pool.query(
    `SELECT MAX(due_date) AS last_task
     FROM tasks
     WHERE plants_id = ? AND effect_id = ?`,
    [plantId, effectId]
  );
  return row?.last_task;
}

export async function taskExists(plantId, effectId) {
  const [[row]] = await pool.query(
    `SELECT id FROM tasks
     WHERE plants_id = ? AND effect_id = ? AND status_id = 1
     LIMIT 1`,
    [plantId, effectId]
  );
  return !!row;
}

export async function insertTask(plantId, effectId, dueDate) {
  await pool.query(
    `INSERT INTO tasks (plants_id, effect_id, status_id, due_date, created_at, updated_at)
     VALUES (?, ?, 1, ?, NOW(), NOW())`,
    [plantId, effectId, dueDate]
  );
}

export async function rescheduleSnoozedTasks(days) {
  const [res] = await pool.query(
    `UPDATE tasks
     SET due_date = DATE_ADD(CURDATE(), INTERVAL ? DAY), updated_at = NOW(), status_id = 1
     WHERE status_id = 3`,
    [days]
  );
  return res.affectedRows;
}
