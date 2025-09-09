import type {Task} from "../../../types";

interface PendingTasksProps {
  tasks: Task[];
}

export default function PendingTaskBanner({ tasks }: PendingTasksProps) {
  if (!tasks || tasks.length === 0) return null;

  function formatDueDate(dueDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize
    const diffMs = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === -1) return "yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 1) return "tomorrow";
    return `in ${diffDays} days`;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const isOverdue = dueDate < today;
        const status = isOverdue ? "Overdue" : task.statusName;

        let style = "bg-gray-100 text-gray-800";
        if (task.statusId == 1) style = "bg-red-100 text-red-800";
        else if (dueDate.getTime() === today.getTime())
          style = "bg-yellow-100 text-yellow-800";

        return (
          <div
            key={task.taskID}
            className={`mb-2 p-3 rounded-lg flex items-center gap-2 ${style}`}
          >
            <i className="fas fa-exclamation-circle" />
            <span>
              Task {status?.toLowerCase()}: {task.effectName} (
              {formatDueDate(dueDate)})
            </span>
          </div>
        );
      })}
    </div>
  );
}
