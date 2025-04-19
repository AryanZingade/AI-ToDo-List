import json
import os

TASK_FILE = "db/tasks.json"
tasks = []
next_id = 1

def load_tasks():
    global tasks, next_id

    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, "r") as f:
            try:
                data = f.read().strip()
                if not data:
                    tasks = []
                    next_id = 1
                    return

                tasks = json.loads(data)

                # Patch missing usernames just in case
                for task in tasks:
                    if "username" not in task:
                        task["username"] = "unknown"

                all_task_ids = [task["id"] for task in tasks]
                next_id = max(all_task_ids, default=0) + 1

            except json.JSONDecodeError:
                print("⚠️ tasks.json is not valid JSON. Initializing with an empty task list.")
                tasks = []
                next_id = 1
    else:
        tasks = []
        next_id = 1

def save_tasks():
    with open(TASK_FILE, "w") as f:
        json.dump(tasks, f, indent=2)

def get_user_tasks(username):
    load_tasks()
    return [task for task in tasks if task["username"] == username]

def add_task(username, title, description, importance, deadline):
    global next_id
    load_tasks()

    new_task = {
        "id": next_id,
        "username": username,
        "title": title,
        "description": description,
        "importance": importance,
        "deadline": deadline,
        "completed": False
    }

    tasks.append(new_task)
    next_id += 1
    save_tasks()
    return new_task

def complete_task(username: str, task_id: int):
    load_tasks()
    for task in tasks:
        if task["id"] == task_id and task["username"] == username:
            task["completed"] = True
            save_tasks()
            return task
    return None

def delete_task(username: str, task_id: int):
    load_tasks()
    for task in tasks:
        if task["id"] == task_id and task["username"] == username:
            tasks.remove(task)
            save_tasks()
            return True
    return False

load_tasks()
