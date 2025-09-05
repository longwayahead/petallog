import React from "react";
import {type Task} from "../../../types";

export type TaskVariant = "default" | "overdue" | "today" | "completed";

export default function TaskCard({
  task,
  onClick,
  variant = "default",
}: {
  task: Task;
  onClick: () => void;
  variant?: TaskVariant;
}) {
  let baseClasses =
    "interaction-card cursor-pointer hover:shadow-md transition";
  let variantClasses = "";

  if (variant === "overdue") {
    variantClasses = "bg-red-50 border border-red-200 text-red-700";
  } else if (variant === "today") {
    variantClasses = "bg-yellow-50 border border-yellow-200 text-yellow-700";
  } else if (variant === "completed") {
    variantClasses = "bg-gray-100 opacity-70 hover:opacity-90";
  } else {
    variantClasses = "bg-[#f9fafb]";
  }

  return (
    <div onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center gap-3">
        <img
          src={task.photo}
          alt={task.plantName}
          className="w-14 h-14 rounded-full object-cover border border-gray-200"
        />
        <div className="flex-1">
          <div className="font-semibold">
            {task.plantName} • {task.potCode}
          </div>
          <div className="text-sm text-gray-500">
            needs {task.effect}
          </div>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {variant === "completed"
            ? task.completedAt
              ? `done ${new Date(task.completedAt).toLocaleDateString()}`
              : "done"
            : `due ${task.due}`}
        </div>
      </div>
    </div>
  );
}
