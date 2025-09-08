import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Task } from "../../../types";
import PageHeader from "../../../ui/TopNav";
import { fuzzyDate } from "../../../utils/date.ts";

// --- Helper: group tasks like Instagram notifications ---
function groupTasksForFeed(tasks: Task[]) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);

  return {
    today: tasks.filter((t) => t.due === today && t.status === "pending"),
    thisWeek: tasks.filter((t) => {
      const dueDate = new Date(t.due);
      return t.due > today && dueDate <= weekAhead && t.status === "pending";
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
          taskID: String(t.taskID),
          plantId: String(t.plantID),
          plantName: t.plantName,
          potCode: t.potCode,
          plantPhoto:
            t.plantPhoto ||
            `https://placehold.co/100x100/green/white?text=${encodeURIComponent(
              t.plantName
            )}`,
          due: t.due_date || new Date().toISOString().slice(0, 10),
          effect: t.effectName?.toLowerCase() || "care",
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

  console.log("Tasks loaded:", tasks);

  const groups = groupTasksForFeed(tasks);

  const handleTap = (task: Task) => {
    navigate(`/plants/${task.plantId}`);
  };

  return (
    <div className="mx-auto max-w-md bg-white text-gray-800 min-h-screen">
      <PageHeader
        title="Tasks"
        // menuItems={[
        //   { label: "Mark all as done", onClick: () => console.log("done!") },
        // ]}
        showBackButton={false}  
      />

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-60px-56px)]">
  <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
</div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          All the plants are snug 🦈
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {(["today", "thisWeek", "earlier"] as const).map((section) => {
            const list = groups[section];
            if (!list.length) return null;

            return (
              <section key={section}>
                <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                  {section === "thisWeek"
                    ? "This Week"
                    : section === "today"
                    ? "Today"
                    : "Earlier"}
                </h2>

                <ul className="divide-y divide-gray-200">
                  {list.map((task) => (
                    <li
                      key={task.taskID}
                      className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleTap(task)}
                    >
                      {/* Avatar */}
                      <img
                        src={task.plantPhoto}
                        alt={task.plantName}
                        className="w-12 h-12 rounded-full object-cover border"
                      />

                      {/* Text */}
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {task.plantName} needs {task.effect}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fuzzyDate(new Date(task.due).toISOString())}
                        </div>
                      </div>

                      {/* Status or chevron */}
                      {task.status === "pending" ? (
                        <span className="text-emerald-600 text-xs font-semibold mr-2">
                          Pending
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs mr-2">Done</span>
                      )}

                      {/* Chevron */}
                      <i className="fas fa-chevron-right text-gray-400" />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
