from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from task_router import router

app = FastAPI()

# 👇 Add this to allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],  # or ["*"] for dev only (unsafe for prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount your router
app.include_router(router)
