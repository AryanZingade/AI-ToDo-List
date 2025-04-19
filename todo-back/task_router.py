from fastapi import APIRouter, HTTPException, Request, Depends
from auth import authenticate_user, create_user
import task_service
from dotenv import load_dotenv
import os
import json
from langchain_openai import AzureChatOpenAI
from langchain.schema import HumanMessage
from datetime import datetime, timedelta
import jwt

load_dotenv()

llm = AzureChatOpenAI(
    azure_deployment="gpt-4o-mini",
    azure_endpoint=os.getenv("OPENAI_GPT_ENDPOINT"),
    api_key=os.getenv("OPENAI_GPT_API_KEY"),
    api_version="2024-10-21",
    temperature=0.2
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

SECRET_KEY = "aryan101"

@router.post("/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    try:
        # Attempt to create a new user
        create_user(username, password)
        token = create_jwt_token(username)
        return {"message": "Signup successful", "token": token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    
def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=403, detail="Token is missing")
    
    if token.startswith("Bearer "):
        token = token.split(" ")[1]
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_jwt_token(username: str):
    expiration = datetime.utcnow() + timedelta(days=1)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

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

@router.post("/")
async def add_task(title: str, description: str = "", importance: str = "medium", username: str = Depends(get_current_user)):
    return task_service.add_task(username, title, description, importance)

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
            "Return only a **valid JSON object** with exactly these three fields: 'title', 'description', and 'importance'.\n"
            "Do not add explanations, text, or markdown formatting. Only return raw JSON.\n\n"
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

        if not title:
            raise HTTPException(status_code=500, detail="Missing 'title' in LLM response.")

        return task_service.add_task(username, title, description, importance)

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
