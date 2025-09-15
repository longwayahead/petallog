// src/context/TaskContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface Task {
  id: string;
  plantId: string;
  actions: string[];
  due: string;
  status: "pending" | "done" | "snoozed";
}

interface TaskContextType {
  tasks: Task[];
  pendingCount: number;
  refresh: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

const loadTasks = async () => {
  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) {
      console.error("Failed to fetch tasks", res.status, res.statusText);
      return setTasks([]);
    }
    const raw = await res.json();
    
    const mapped: Task[] = raw.map((t: any) => {
      const dueRaw = t.taskDueDate ? new Date(t.taskDueDate) : new Date();
      const due = dueRaw.toISOString().slice(0, 10);
      // console.log("Mapping task", t.taskID, "due", t.taskDueDate, "->", due);
      return {
        id: String(t.taskID),
        plantId: String(t.plantID),
        actions: t.actions?.map((a: any) => a.actionName) || [],
        due,
        status: t.statusName.toLowerCase() === "pending" ? "pending" : "done",
      };
    });

    setTasks(mapped);
  } catch (e) {
    console.error("Failed to fetch tasks", e);
    setTasks([]);
  }
};


  useEffect(() => {
    loadTasks();

    // 🔄 optional: poll every 30s
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);
const today = new Date().toISOString().slice(0, 10);

const pendingCount = tasks.filter(
  (t) => t.status === "pending" && t.due <= today
).length;

  return (
    <TaskContext.Provider value={{ tasks, pendingCount, refresh: loadTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside <TaskProvider>");
  return ctx;
}
