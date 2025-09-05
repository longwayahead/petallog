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
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
      setTasks([]); // fallback
    }
  };

  useEffect(() => {
    loadTasks();

    // 🔄 optional: poll every 30s
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = tasks.filter((t) => t.status === "pending").length;

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
