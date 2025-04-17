import React, { useEffect, useState } from "react";

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskQuery, setNewTaskQuery] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskImportance, setTaskImportance] = useState("medium");

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch("http://localhost:8000/tasks/");
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleAiCreateTask = async () => {
    if (!newTaskQuery) {
      alert("Please enter a task query.");
      return;
    }

    const res = await fetch("http://localhost:8000/tasks/ai-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: newTaskQuery,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setTasks((prevTasks) => [...prevTasks, data]);
      setNewTaskQuery("");
    } else {
      const errorData = await res.json();
      alert(`Failed to create task: ${errorData.detail}`);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const response = await fetch(
      `http://localhost:8000/tasks/${taskId}/complete`,
      {
        method: "PUT",
      }
    );

    if (response.ok) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    } else {
      alert("Failed to mark task as complete.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } else {
      alert("Failed to delete task.");
    }
  };

  return (
    <div className="dashboard">
      <h2>Task Dashboard</h2>
      <div className="ai-task-input">
        <h3>Create Task Using AI</h3>
        <textarea
          value={newTaskQuery}
          onChange={(e) => setNewTaskQuery(e.target.value)}
          placeholder="Enter task description (e.g., I need to complete homework by tomorrow night, and it is of high importance)"
        />
        <button onClick={handleAiCreateTask}>Create Task</button>
      </div>

      <div className="task-list">
        <h3>All Tasks</h3>
        {tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-details">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p>
                  <strong>Importance:</strong> {task.importance}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {task.completed ? "Completed" : "Pending"}
                </p>
              </div>
              <div className="task-actions">
                {!task.completed && (
                  <button onClick={() => handleCompleteTask(task.id)}>
                    Mark as Complete
                  </button>
                )}
                <button onClick={() => handleDeleteTask(task.id)}>
                  Delete Task
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
