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

def create_user(username: str, password: str) -> dict:
    # Ensure the users file exists
    if not os.path.exists(USERS_FILE):
        users = []
    else:
        with open(USERS_FILE, "r") as f:
            try:
                users = json.load(f)
            except json.JSONDecodeError:
                users = []

    # Check if the user already exists
    if any(user.get("username") == username for user in users):
        raise ValueError("Username already exists")

    # Create new user entry
    new_user = {"username": username, "password": password}
    users.append(new_user)

    # Save users to the file
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

    return {"message": "User created successfully"}
