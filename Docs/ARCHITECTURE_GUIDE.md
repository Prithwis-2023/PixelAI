# Authentication & Auth API Architecture Guide

This document explains the architecture of the authentication and user sign-up features in the PixelAI backend. It is intended for developers who need to understand the project structure, how the logic is separated, and how to define or modify API endpoints.

---

## 🏗️ 1. Project Structure (Separation of Concerns)

Our backend follows a generic layered architecture to ensure code is clean, testable, and maintainable. The logic is divided into **Routers (Controllers)**, **Services**, **Schemas (DTOs)**, and **Models (Entities)**.

### Directory Overview
```text
app/
├── api/
│   ├── v1/
│   │   ├── auth.py     # Router: Login & Token endpoints
│   │   └── users.py    # Router: Signup & User info endpoints
│   └── dependencies.py # Shared utilities (e.g., token verification, DB session)
├── core/
│   ├── config.py       # Environment variables & constants
│   └── security.py     # Password hashing & JWT generation
├── models/
│   └── user.py         # SQLAlchemy Database models (DB schema)
├── schemas/
│   └── user.py         # Pydantic models (Data validation & API payload structure)
└── services/
    ├── user_service.py   # Business logic: User creation, authentication
    └── github_service.py # Business logic: Github repo allocation
```

---

## 🧩 2. Role of Each Component

### A. Routers (`app/api/v1/*.py`)
- **Role:** The entry point for HTTP requests. They define the URL paths (endpoints), HTTP methods (GET, POST), and what data goes in and out. 
- **Rule:** Routers should **NOT** contain complex business logic or direct database queries. Their job is simply to receive the request, hand the data to the `Service` layer, and return the result to the client.
- **Files:** `auth.py` (handles `/login/access-token`), `users.py` (handles `/signup`, `/me`, `/{user_id}`).

### B. Services (`app/services/*.py`)
- **Role:** The brain of the application. All core business logic lives here.
- **Rule:** Services take data from the Router, interact with the Database (via Models) or external APIs (like Github), process the data, and return it.
- **Files:** 
  - `user_service.py`: Checks if a user exists, hashes passwords, and saves new users to the DB.
  - `github_service.py`: Dedicated service for allocating Github repository URLs.

### C. Schemas (`app/schemas/*.py`)
- **Role:** Data Transfer Objects (DTOs). They define the exact shape of the JSON that the frontend sends (Request) and receives (Response).
- **Rule:** Validates incoming data using Pydantic. For example, ensuring a password is provided during signup, but stripping it out before sending the user data back to the frontend.
- **Files:** `user.py` (contains `UserCreate`, `UserResponse`), `token.py` (contains `Token`).

### D. Models (`app/models/*.py`)
- **Role:** Represents the actual tables in the PostgreSQL/Supabase database using SQLAlchemy ORM.
- **Files:** `user.py` (Maps python objects to the `users` table: `user_login_id`, `password_hash`, etc.).

---

## 🛠️ 3. How to Modify API Endpoints

If you need to change the names of the API endpoints (URLs), you must edit the **Router** files.

### 📍 Changing the Signup Endpoint
1. Open `app/api/v1/users.py`
2. Find the `@router.post(...)` decorator above the `create_user` function.
3. Change the string inside the decorator.

**Example: Changing `/signup` to `/register`**
```python
# In app/api/v1/users.py

# Old:
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(...):

# New (Modified):
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(...):
```

### 📍 Changing the Login Endpoint
1. Open `app/api/v1/auth.py`
2. Find the `@router.post(...)` decorator above the `login_access_token` function.

**Example: Changing `/login/access-token` to `/login`**
```python
# In app/api/v1/auth.py

# Old:
@router.post("/login/access-token", response_model=Token)
def login_access_token(...):

# New (Modified):
@router.post("/login", response_model=Token)
def login_access_token(...):
```
> **⚠️ Important Note for Login Endpoint:** 
> If you change the login endpoint URL (e.g., to `/api/v1/auth/login`), you **MUST** also update the `tokenUrl` parameter in `app/api/dependencies.py` so that the Swagger UI and dependency injection know where to look for the token:
> ```python
> # In app/api/dependencies.py
> oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # Must match the new full path
> ```

---

## 🔄 Example Workflow (Signup)
To understand how these files work together, follow the data flow during a User Signup:

1. **Client** sends POST request to `/signup` with JSON body.
2. **Router (`users.py`)** receives it. It uses **Schema (`schemas.user.UserCreate`)** to validate that `user_login_id` and `password` exist.
3. The Router calls **Service (`user_service.py -> create_user`)** passing the validated data.
4. The **Service** checks the database for duplicates, hashes the password using `security.py`, and asks `github_service.py` for a new repo URL.
5. The **Service** packages this data into a **Model (`models.user.User`)** and saves it to the DB.
6. The **Service** returns the DB object to the **Router**.
7. The **Router** filters the object through the **Schema (`schemas.user.UserResponse`)** (removing the password hash) and sends a 201 Created JSON response back to the Client.
