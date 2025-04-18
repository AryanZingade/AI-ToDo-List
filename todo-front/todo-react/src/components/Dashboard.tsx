import React, { useEffect, useState } from "react";

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskQuery, setNewTaskQuery] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token"));
  const loggedInUsername = localStorage.getItem("username");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        console.error("User is not logged in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/tasks/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching tasks:", data);
          throw new Error(data.detail || "Failed to fetch tasks");
        }

        console.log("Logged in as:", loggedInUsername);
        console.log("Full task data:", data);

        if (!loggedInUsername) {
          console.error("No username found.");
          return;
        }

        const userTasks = data.filter(
          (task: { username: string }) => task.username === loggedInUsername
        );

        if (userTasks.length > 0) {
          console.log("Setting tasks for:", loggedInUsername);
          setTasks(userTasks);
        } else {
          console.warn(`No tasks found for user: ${loggedInUsername}`);
          setTasks([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching tasks:", error.message);
        } else {
          console.error("Unexpected error fetching tasks:", error);
        }
      }
    };

    fetchTasks();
  }, [token, loggedInUsername]);

  const handleAiCreateTask = async () => {
    if (!newTaskQuery) {
      alert("Please enter a task query.");
      return;
    }

    if (!token) {
      alert("You are not logged in. Please log in first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/tasks/ai-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: newTaskQuery,
          username: loggedInUsername,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prevTasks) => [...prevTasks, data]);
        setNewTaskQuery("");
      } else {
        const errorData = await res.json();
        alert(`Failed to create task: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("An error occurred while creating the task.");
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const response = await fetch(
      `http://localhost:8000/tasks/${taskId}/complete`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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
