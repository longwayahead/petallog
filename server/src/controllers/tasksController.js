import * as Task from "../models/tasksModel.js";
import * as Logger from "../cron/logger.js";
const LOOKAHEAD_DAYS = 1;
const SNOOZE_INTERVAL_DAYS = 3;

export async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.getTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function completeTask(req, res, next) {
  try {
    const result = await Task.markTaskComplete(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// export async function completeTaskByPlantAction(req, res, next) {
//   try {
//     const { plantId, actionId } = req.params;
//     const result = await Task.markCompleteByPlantAction(plantId, actionId);
//     res.json(result);
//   } catch (err) {
//     next(err);
//   }
// }

export async function snoozeTask(req, res, next) {
  try {
    const id = req.params.id;
    const result = await Task.snoozeTask(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateDailyTasks(req, res, next) {
  try {
    Logger.log("Running daily plant tasks cron...");

    const rules = await Task.getPlantEffectRules();

    for (const rule of rules) {
      const { plant_id, effect_id, frequency_days, plant_created_at } = rule;

      const lastCompleted = await Task.getLastCompletion(plant_id, effect_id);
      const lastTask = await Task.getLastTask(plant_id, effect_id);

      let baseline = plant_created_at;

      if (lastCompleted && new Date(lastCompleted) > new Date(baseline)) {
        baseline = lastCompleted;
      }

      if (lastTask && new Date(lastTask) > new Date(baseline)) {
        baseline = lastTask;
      }

      const dueDate = new Date(baseline);
      dueDate.setDate(dueDate.getDate() + frequency_days);

      const today = new Date();
      const cutoff = new Date();
      cutoff.setDate(today.getDate() + LOOKAHEAD_DAYS);

      if (dueDate <= cutoff) {
        const exists = await Task.taskExists(plant_id, effect_id);

        if (!exists) {
          await Task.insertTask(plant_id, effect_id, dueDate);
          Logger.log(`Task created for plant ${plant_id}, effect ${effect_id}, due ${dueDate.toISOString().slice(0, 10)}`);
        }
      }
    }

    const updated = await Task.rescheduleSnoozedTasks(SNOOZE_INTERVAL_DAYS);
    if (updated > 0) {
      Logger.log(`Rescheduled ${updated} snoozed task(s) by ${SNOOZE_INTERVAL_DAYS} day(s).`);
    }

    Logger.log("Daily cron finished.");
    res?.json?.({ message: "Daily tasks generated" });
  } catch (err) {
    Logger.logError(err);
    next?.(err);
  }
}