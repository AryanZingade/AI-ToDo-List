from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from task_router import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount your router
app.include_router(router)
