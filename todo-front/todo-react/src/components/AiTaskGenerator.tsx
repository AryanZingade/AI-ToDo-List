import React, { useState } from "react";

const AiTaskGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const token = localStorage.getItem("token");

  const generateTask = async () => {
    const res = await fetch("http://localhost:8000/tasks/ai-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse(`${data.title} - ${data.description}`);
    } else {
      setResponse(`Error: ${data.detail}`);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>AI Task Generator</h2>
      <input
        type="text"
        placeholder="Enter prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", marginRight: "10px" }}
      />
      <button onClick={generateTask}>Generate</button>
      {response && <p>{response}</p>}
    </div>
  );
};

export default AiTaskGenerator;
