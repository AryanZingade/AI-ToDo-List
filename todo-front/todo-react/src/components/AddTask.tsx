import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleAdd = async () => {
    await fetch("http://localhost:8000/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    navigate("/tasks");
  };

  return (
    <div>
      <h2>Add Task</h2>
      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default AddTask;
