import cron from "node-cron";
import pool from "../config/db.js";

const LOOKAHEAD_DAYS = 1; // configurable: how many days ahead to create tasks
const SNOOZE_INTERVAL_DAYS = 1; // configurable: how many days to push snoozed tasks

export async function generateDailyTasks() {
  const connection = await pool.getConnection();
  try {
    console.log("Running daily plant tasks cron...");

    // 1. Get all plant_effect rules
    const [rules] = await connection.query(`
      SELECT pe.plant_id, pe.effect_id, pe.frequency_days, pe.flexible,
             p.created_at AS plant_created_at
      FROM plants_effects pe
      JOIN plants p ON p.id = pe.plant_id
      WHERE p.alive = 1
    `);

    // 2. For each rule, check last completion OR plant.created_at
    for (const rule of rules) {
      const { plant_id, effect_id, frequency_days, plant_created_at } = rule;

      // last completed for this plant/effect
      const [[lastCompletion]] = await connection.query(
        `SELECT MAX(completed) AS last_completed
         FROM plants_effects_complete
         WHERE plant_id = ? AND effect_id = ?`,
        [plant_id, effect_id]
      );

      const [[lastTask]] = await connection.query(
        `SELECT MAX(due_date) AS last_task
         FROM tasks
         WHERE plants_id = ? AND effect_id = ?`,
        [plant_id, effect_id]
      );

      const baseline = lastCompletion?.last_completed || plant_created_at;
      const lastDue = lastTask?.last_task || baseline;

      const dueDate = new Date(lastDue);
      dueDate.setDate(dueDate.getDate() + frequency_days);

      const today = new Date();
      const cutoff = new Date();
      cutoff.setDate(today.getDate() + LOOKAHEAD_DAYS);

      // 3. Insert new task only if due in range & no pending task
      if (dueDate <= cutoff) {
        const [[exists]] = await connection.query(
          `SELECT id FROM tasks
           WHERE plants_id = ? AND effect_id = ? AND status_id = 1
           LIMIT 1`,
          [plant_id, effect_id]
        );

        if (!exists) {
          await connection.query(
            `INSERT INTO tasks (plants_id, effect_id, status_id, due_date, created_at, updated_at)
             VALUES (?, ?, 1, ?, NOW(), NOW())`,
            [plant_id, effect_id, dueDate]
          );
          console.log(`Task created for plant ${plant_id}, effect ${effect_id}, due ${dueDate.toISOString().slice(0,10)}`);
        }
      }
    }

    // 4. Reschedule snoozed tasks
    await connection.query(
      `UPDATE tasks
       SET due_date = DATE_ADD(CURDATE(), INTERVAL ? DAY), updated_at = NOW()
       WHERE status_id = 3`,
      [SNOOZE_INTERVAL_DAYS]
    );

    console.log("Daily cron finished.");
  } catch (err) {
    console.error("Cron error:", err);
  } finally {
    connection.release();
  }
}

// Schedule for 4 AM daily
cron.schedule("0 4 * * *", generateDailyTasks);

export default generateDailyTasks;
