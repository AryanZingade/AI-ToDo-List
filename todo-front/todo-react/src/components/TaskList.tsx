import React, { useEffect, useState } from "react";
import TaskItem from "./TaskItem";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  importance: string;
  deadline: string;
  username: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const username = new URLSearchParams(window.location.search).get("username");

  useEffect(() => {
    if (username) {
      fetch("http://localhost:8000/tasks/")
        .then((res) => res.json())
        .then((data) => {
          // Filter tasks by the username
          const userTasks = data.filter(
            (task: Task) => task.username === username
          );
          setTasks(userTasks);
        });
    }
  }, [username]);

  const handleComplete = async (id: number) => {
    await fetch(`http://localhost:8000/tasks/${id}/complete`, {
      method: "PUT",
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:8000/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;
