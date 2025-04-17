import json
import os

# Load users from the JSON file
def load_users():
    file_path = os.path.join("db", "users.json")  # Adjust path as needed
    with open(file_path, "r") as file:
        return json.load(file)

# Authenticate by checking if username/password match any entry
def authenticate_user(username: str, password: str) -> bool:
    users = load_users()
    for user in users:
        print(f"Checking {user['username']} == {username} and {user['password']} == {password}")
        if user["username"] == username and user["password"] == password:
            return True
    return False

