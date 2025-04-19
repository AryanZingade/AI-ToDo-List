import React from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  importance: string;
  completed: boolean;
  deadline: string;
}

interface Props {
  task: Task;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<Props> = ({ task, onComplete, onDelete }) => {
  console.log("Rendering task:", task);

  return (
    <div className="border p-4 my-2 rounded shadow">
      <h3 className="text-lg font-bold">{task.title}</h3>
      <p>{task.description}</p>
      <p>
        <strong>Importance:</strong> {task.importance}
      </p>
      <p>
        <strong>Deadline:</strong> {task.deadline}
      </p>
      <p>
        <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
      </p>
      {!task.completed && (
        <button
          onClick={() => onComplete(task.id)}
          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
        >
          Mark as Complete
        </button>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskItem;
