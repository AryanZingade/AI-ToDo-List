A minimal full-stack To-Do List app with **FastAPI** (Python) as the backend and **React** (with shadcn/ui) as the frontend.  
Supports **user signup, login (with JWT)**, and basic **task management** (add, view, complete, delete).

Contains:
- User Signup & Login
- JWT Token-based Authentication
- Add, View, Complete, and Delete Tasks
- Protected Routes using JWT
- Modern UI with [shadcn/ui]

Running Backend:

# For Unix/macOS
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload


Running Frontend:

cd todo-front
cd todo-react
npm install
npm run dev

Will be running on: http://localhost:5173



