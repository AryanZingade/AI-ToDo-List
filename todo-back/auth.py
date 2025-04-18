import json
import os

USERS_FILE = "db/users.json"

def authenticate_user(username: str, password: str) -> bool:
    if not os.path.exists(USERS_FILE):
        return False

    with open(USERS_FILE, "r") as f:
        try:
            users = json.load(f)
        except json.JSONDecodeError:
            return False

    for user in users:
        if user.get("username") == username and user.get("password") == password:
            return True

    return False
