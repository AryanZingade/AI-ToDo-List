import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

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
        console.log("Fetching tasks for the user...");
        const response = await fetch("http://localhost:8000/tasks/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("Response data:", data);

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

        data.forEach((task: { deadline: string }) => {
          console.log("Task deadline:", task.deadline);
        });

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
    <div className="dashboard p-4">
      <h2 className="text-2xl font-semibold mb-4">Task Dashboard</h2>

      <div className="ai-task-input mb-6">
        <h3 className="text-xl mb-2">Create Task Using AI</h3>
        <Textarea
          value={newTaskQuery}
          onChange={(e) => setNewTaskQuery(e.target.value)}
          placeholder="Enter task description (e.g., I need to complete homework by tomorrow night, and it is of high importance)"
          className="w-full mb-4"
        />
        <Button onClick={handleAiCreateTask} className="w-full">
          Create Task
        </Button>
      </div>

      <div className="task-list">
        <h3 className="text-xl mb-4">All Tasks</h3>
        {tasks.length === 0 ? (
          <p>No tasks available</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="task-item flex justify-between items-center bg-gray-100 p-4 rounded-md mb-2"
            >
              <div className="task-details">
                <h4 className="text-lg font-medium">{task.title}</h4>
                <p>{task.description}</p>
                <p>
                  <strong>Importance:</strong> {task.importance}
                </p>
                <p>
                  <strong>Deadline:</strong> {task.deadline}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {task.completed ? "Completed" : "Pending"}
                </p>
              </div>

              <div className="task-actions flex space-x-2">
                {!task.completed && (
                  <Button
                    onClick={() => handleCompleteTask(task.id)}
                    className="bg-green-500 text-white"
                  >
                    Mark as Complete
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-500 text-white"
                >
                  Delete Task
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
