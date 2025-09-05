import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Task } from "../../../types";
import {NotificationsHeader} from "../components/Header";

// --- Helper: group tasks like Instagram notifications ---
function groupTasksForFeed(tasks: Task[]) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);

  return {
    today: tasks.filter((t) => t.due === today && t.status === "pending"),
    thisWeek: tasks.filter((t) => {
      const dueDate = new Date(t.due);
      return (
        t.due > today &&
        dueDate <= weekAhead &&
        t.status === "pending"
      );
    }),
    earlier: tasks.filter((t) => {
      const dueDate = new Date(t.due);
      return (
        (t.due < today && t.status === "pending") || // overdue
        t.status === "done" || // completed
        dueDate > weekAhead // beyond a week
      );
    }),
  };
}

export default function NotificationsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- Live fetch from API ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();

        const mapped: Task[] = data.map((t: any) => ({
          id: String(t.taskID),
          plantId: String(t.plantID),
          plantName: t.plantName,
          potCode: t.potCode || "1",
          photo:
            t.photo ||
            `https://placehold.co/100x100/green/white?text=${encodeURIComponent(
              t.plantName
            )}`,
          due: t.due_date || new Date().toISOString().slice(0, 10),
          effect: t.effectName?.toLowerCase() || "care", // 👈 use effectName lowercase
          status: t.statusName.toLowerCase() === "pending" ? "pending" : "done",
          completedAt: t.completed_at || null,
        }));

        setTasks(mapped);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
    interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const groups = groupTasksForFeed(tasks);

  const handleTap = (task: Task) => {
    navigate(`/plants/${task.plantId}`);
  };

  return (
  <div className="mx-auto max-w-md bg-white text-gray-800 min-h-screen">
    <NotificationsHeader />

    <div className="divide-y divide-gray-100">
      {loading ? (
        <div className="p-4 text-gray-500">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          All the plants are snug 🦈
        </div>
      ) : (
        <>
          {(["today", "thisWeek", "earlier"] as const).map((section) => {
            const list = groups[section];
            if (!list.length) return null;
            return (
              <section key={section}>
                <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                  {section === "thisWeek" ? "This Week" : section}
                </h2>
                {list.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTap(task)}
                  >
                    <img
                      src={task.photo}
                      alt={task.plantName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{task.plantName}</span>{" "}
                      needs {task.effect}
                      <div className="text-xs text-gray-500">
                        Due {new Date(task.due).toLocaleDateString()}
                      </div>
                    </div>
                    {task.status === "pending" ? (
                      <span className="text-emerald-600 text-xs font-semibold">
                        Pending
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Done</span>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
        </>
      )}
    </div>
  </div>
);
}