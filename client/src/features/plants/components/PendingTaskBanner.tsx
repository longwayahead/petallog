import type { Task } from "../../../types";
import { formatDueDate } from "../../../utils/date";

interface PendingTasksProps {
  tasks: Task[];
}

export default function PendingTaskBanner({ tasks }: PendingTasksProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      {tasks
        .filter((task) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          return dueDate <= today; // only overdue or today
        })
        .map((task) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          const isOverdue = dueDate < today;

          const style = isOverdue
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800";

          const status = isOverdue ? "Overdue" : "Due today";

          return (
            <div
              key={task.taskID}
              className={`mb-2 p-3 rounded-lg flex items-center gap-2 ${style}`}
            >
              <i className="fas fa-exclamation-circle" />
              <span>
                Task {status.toLowerCase()}: {task.effectName} (
                {formatDueDate(String(dueDate))})
              </span>
            </div>
          );
        })}
    </div>
  );
}
