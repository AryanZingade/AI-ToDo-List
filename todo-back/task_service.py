import json
import os

TASK_FILE = "db/tasks.json" 

tasks = []
next_id = 1

def load_tasks():
    global tasks, next_id
    if os.path.exists(TASK_FILE):
        with open(TASK_FILE, "r") as f:
            tasks = json.load(f)
            if tasks:
                next_id = max(task['id'] for task in tasks) + 1 

def save_tasks():
    with open(TASK_FILE, "w") as f:
        json.dump(tasks, f, indent=2) 

def get_all_tasks(sort_by_importance=False):
    if sort_by_importance:
        importance_order = {"high": 0, "medium": 1, "low": 2}
        
        for task in tasks:
            if "importance" not in task:
                task["importance"] = "medium"
        
        return sorted(tasks, key=lambda t: importance_order.get(t["importance"], 1))
    
    return tasks


def add_task(title, description, importance):
    global next_id
    task = {
        "id": next_id,
        "title": title,
        "description": description,
        "importance": importance,
        "completed": False
    }
    tasks.append(task)
    next_id += 1
    save_tasks()
    return task

def complete_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = True
            save_tasks()
            return task
    return None

def delete_task(task_id):
    global tasks
    updated = [t for t in tasks if t["id"] != task_id]
    if len(updated) == len(tasks):
        return False
    tasks = updated
    save_tasks()
    return True

load_tasks()
