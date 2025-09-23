import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Task } from "../../../types";
import PageHeader from "../../../ui/TopNav";
import { formatDueDate } from "../../../utils/date.ts";
import {useTasks } from "../../../context/TaskContext.tsx";

import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

// --- Normalize dates to midnight ---
function normalize(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// --- Group tasks into Today / This Week / Earlier ---
function groupTasksForFeed(tasks: Task[]) {
  const today = normalize(new Date());
  const weekAhead = normalize(new Date());
  weekAhead.setDate(today.getDate() + 7);

  return {
    today: tasks.filter((t) => {
      const dueDate = normalize(new Date(t.due));
      return dueDate.getTime() === today.getTime() && t.status === "pending";
    }),
    thisWeek: tasks.filter((t) => {
      const dueDate = normalize(new Date(t.due));
      return dueDate > today && dueDate <= weekAhead && t.status === "pending";
    }),
    earlier: tasks.filter((t) => {
      const dueDate = normalize(new Date(t.due));
      return (
        (dueDate < today && t.status === "pending") || // overdue
        dueDate > weekAhead // future
      );
    }),
  };
}

// --- Sorting helper ---
function sortTasks(tasks: Task[], mode: "default" | "plant" | "action") {
  if (mode === "plant") {
    return [...tasks].sort((a, b) => a.plantName.localeCompare(b.plantName));
  }
  if (mode === "action") {
    return [...tasks].sort((a, b) => a.effectName.localeCompare(b.effectName));
  }
  // default: sort by taskDueDate
  return [...tasks].sort(
    (a, b) =>
      new Date(a.due).setHours(0, 0, 0, 0) -
      new Date(b.due).setHours(0, 0, 0, 0)
  );
}

export default function NotificationsPage() {
  const { refresh } = useTasks();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<"default" | "plant" | "action">(
    "default"
  );
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
  potCode: t.potCode ?? "",
  plantPhoto:
    t.plantPhoto ||
    `https://placehold.co/100x100/green/white?text=${encodeURIComponent(
      t.plantName
    )}`,
  due: t.taskDueDate,    
  dueDate: t.taskDueDate,     
  effect: t.effectName?.toLowerCase() || "care",
  effectName: t.effectName || "Care",
  status: "pending",
  statusName: t.statusName,
  statusId: t.statusSort ?? 0,
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

  const sortedTasks = sortTasks(tasks, sortMode);
  const groups = groupTasksForFeed(sortedTasks);

  const handleTap = (task: Task) => {
    navigate(`/plants/${task.plantId}`);
  };

  async function snoozeTask(task: Task) {
    try {
      const res = await fetch(`/api/tasks/${task.taskID}/snooze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to snooze task");

      // Remove from local state so it disappears immediately
      setTasks((prev) => prev.filter((t) => t.taskID !== task.taskID));
      refresh();
    } catch (err) {
      console.error("Error snoozing task", err);
    }
  }

  const stanleyLabel = (
    <>
      srt by{" "}
      <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>a</span>
      ctn
    </>
  );

  return (
    <div className="mx-auto max-w-md bg-white text-gray-800 min-h-screen">
      <PageHeader
        title="Tasks"
        showBackButton={false}
        menuItems={[
          { label: "srt by dt", onClick: () => setSortMode("default") },
          { label: "srt by plnt", onClick: () => setSortMode("plant") },
          { label: stanleyLabel, onClick: () => setSortMode("action") },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-60px-56px)]">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          All the plants are snug 🦈
        </div>
      ) : (
        <div className="divide-y divide-gray-200 pb-16">
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

                <SwipeableList>
                  {list.map((task) => (
                    <SwipeableListItem
                      key={task.taskID}
                      trailingActions={ // swipe left
                        <TrailingActions>
                          <SwipeAction onClick={() => snoozeTask(task)}>
                            <div className="flex items-center justify-center h-full bg-yellow-400 text-white font-semibold">
                              <i className="pr-4 fas fa-clock" />
                            </div>
                          </SwipeAction>
                        </TrailingActions>
                      }
                    >
<li
  className="flex items-center justify-between w-full px-4 py-3 cursor-pointer hover:bg-gray-50"
  onClick={() => handleTap(task)}
>
  {/* Left: Avatar + Text */}
  <div className="flex items-center min-w-0">
    <img
      src={task.plantPhoto}
      alt={task.plantName}
      className="w-12 h-12 rounded-full object-cover border"
    />
    <div className="ml-3 min-w-0 flex-1">
      <div className="font-medium truncate">
        {task.plantName} needs {task.effectName}
      </div>
      <div className="text-xs text-gray-500">
        {formatDueDate(new Date(task.due).toISOString())}
      </div>
    </div>
  </div>

  {/* Right: Chevron */}
  <i className="fas fa-chevron-right text-gray-400 shrink-0 ml-2" />
</li>




                    </SwipeableListItem>
                  ))}
                </SwipeableList>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
