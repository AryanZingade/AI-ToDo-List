from fastapi import APIRouter, HTTPException, Request
from auth import authenticate_user
import task_service
from dotenv import load_dotenv
import os
import json
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage

load_dotenv()

# Setup Langchain with Azure OpenAI
llm = AzureChatOpenAI(
    azure_deployment="gpt-4o-mini",
    azure_endpoint=os.getenv("OPENAI_GPT_ENDPOINT"),
    api_key=os.getenv("OPENAI_GPT_API_KEY"),
    api_version="2024-10-21",
    temperature=0.2
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    if authenticate_user(username, password):
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.post("/")
async def add_task(title: str, description: str = "", importance: str = "medium"):
    task = task_service.add_task(title, description, importance)
    return task

@router.get("/")
async def get_tasks(sorted: bool = False):
    return task_service.get_all_tasks(sort_by_importance=sorted)

@router.put("/{task_id}/complete")
async def complete_task(task_id: int):
    task = task_service.complete_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int):
    success = task_service.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ✅ AI-powered Task Creation
@router.post("/ai-create")
async def ai_create_task(request: Request):
    body = await request.json()
    query = body.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    prompt = (
        "You are an assistant that extracts structured task info from natural language queries. "
        "Strictly return a JSON object with three fields: title, description, and importance.\n\n"
        f"Query: {query}\n"
        "Output:"
    )

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        response_text = response.content.strip()

        # Ensure we only try to parse valid JSON
        parsed = json.loads(response_text)

        title = parsed.get("title")
        description = parsed.get("description", "")
        importance = parsed.get("importance", "medium")

        task = task_service.add_task(title, description, importance)
        return task
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse JSON: {response_text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
