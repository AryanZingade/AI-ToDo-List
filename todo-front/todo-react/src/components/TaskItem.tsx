import React from "react";

interface TaskItemProps {
  task: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
  };
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>{task.completed ? "Completed" : "Pending"}</p>
      {!task.completed && (
        <button onClick={() => onComplete(task.id)}>Complete</button>
      )}
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
};

export default TaskItem;
