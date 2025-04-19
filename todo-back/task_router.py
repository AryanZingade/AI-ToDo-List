from fastapi import APIRouter, HTTPException, Request, Depends
from helper import get_current_user, create_jwt_token
from auth import authenticate_user, create_user
import task_service
from dotenv import load_dotenv
import os
import json
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage

load_dotenv()

llm = AzureChatOpenAI(
    azure_deployment="gpt-4o-mini",
    azure_endpoint=os.getenv("OPENAI_GPT_ENDPOINT"),
    api_key=os.getenv("OPENAI_GPT_API_KEY"),
    api_version="2024-10-21",
    temperature=0.2
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    try:
        create_user(username, password)
        token = create_jwt_token(username)
        return {"message": "Signup successful", "token": token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if authenticate_user(username, password):
        token = create_jwt_token(username)
        return {"message": "Login successful", "token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")

@router.get("/")
async def get_tasks(username: str = Depends(get_current_user)):
    return task_service.get_user_tasks(username)

@router.put("/{task_id}/complete")
async def complete_task(task_id: int, username: str = Depends(get_current_user)):
    task = task_service.complete_task(username, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, username: str = Depends(get_current_user)):
    success = task_service.delete_task(username, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@router.post("/ai-create")
async def ai_create_task(request: Request):
    try:
        body = await request.json()
        query = body.get("query")
        username = body.get("username")

        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        if not username:
            raise HTTPException(status_code=401, detail="Username is required")

        prompt = (
            "You are an assistant that extracts structured task information from a natural language query.\n"
            "Return only a valid JSON object with exactly these four fields: 'title', 'description', 'importance', and 'deadline'.\n"
            "The 'deadline' must be in the format YYYY-MM-DD if mentioned, otherwise return null.\n"
            "Do not include any explanations, markdown, or extra text. Only return raw JSON.\n\n"
            f"Query: {query}\n"
            "Output:"
        )

        response = llm.invoke([HumanMessage(content=prompt)])
        response_text = response.content.strip()

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {response_text}")

        title = parsed.get("title")
        description = parsed.get("description", "")
        importance = parsed.get("importance", "medium")
        deadline = parsed.get("deadline") or "No deadline"

        if not title:
            raise HTTPException(status_code=500, detail="Missing 'title' in LLM response.")

        return task_service.add_task(username, title, description, importance, deadline)

    except HTTPException as http_err:
        raise http_err
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
