import * as Task from "../models/tasksModel.js";

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

export async function completeTaskByPlantAction(req, res, next) {
  try {
    const { plantId, actionId } = req.params;
    const result = await Task.markCompleteByPlantAction(plantId, actionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}