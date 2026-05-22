# TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, built and deployed as two independent services on Railway.

**Live Demo:** [balanced-nourishment-production.up.railway.app](https://balanced-nourishment-production.up.railway.app)
**API Docs:** [taskflow-production-4f3c.up.railway.app/api/docs](https://taskflow-production-4f3c.up.railway.app/api/docs)

---

## Tech Stack

**Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, PostgreSQL, JWT (python-jose), bcrypt (passlib)

**Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router v6

**Deployment:** Railway (separate backend + frontend services)

---

## Features

### Authentication & Security
- JWT-based signup and login with 7-day token expiry
- Passwords hashed with bcrypt
- Protected routes with token validation on every request

### Role-Based Access Control
Two independent layers of roles:

| Action | Member | Project Admin | App Admin |
|---|:---:|:---:|:---:|
| View own projects & tasks | ✅ | ✅ | ✅ |
| View ALL projects | ❌ | ❌ | ✅ |
| Create project | ✅ | ✅ | ✅ |
| Delete project | ❌ | Owner only | ✅ |
| Add / remove members | ❌ | ✅ | ✅ |
| Create & update tasks | ✅ | ✅ | ✅ |
| Delete any task | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |

### Projects
- Create, update, and delete projects with custom color labels
- Per-project member management with role assignment
- Progress tracking (task completion %)

### Tasks
- Full CRUD with 4 statuses: Todo → In Progress → In Review → Done
- 4 priority levels, due dates, and assignee support
- Overdue detection with visual indicators
- Kanban board view and list view with filters

### Collaboration
- Threaded comments on tasks
- Assign tasks to project members
- Dashboard with live stats: total tasks, in-progress, overdue counts

---

## REST API

Built with FastAPI — fully documented at `/api/docs` with Swagger UI.

**Auth** — `/api/auth`
- `POST /signup` — register, returns JWT + user
- `POST /login` — login, returns JWT + user
- `GET /me` — current user info
- `PUT /me` — update profile

**Projects** — `/api/projects`
- `GET /` — list own projects (App Admin sees all)
- `POST /` — create project
- `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — project CRUD
- `POST /{id}/members` — add member by email
- `DELETE /{id}/members/{uid}`, `PATCH /{id}/members/{uid}` — manage members

**Tasks** — `/api`
- `GET/POST /projects/{id}/tasks` — list and create tasks
- `GET/PUT/DELETE /tasks/{id}` — task CRUD
- `POST /tasks/{id}/comments`, `DELETE /comments/{id}` — comments
- `GET /dashboard/stats` — aggregated counts
- `GET /dashboard/my-tasks` — tasks assigned to me

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── core/        # config, security, auth dependencies
│   │   ├── db/          # SQLAlchemy engine and session
│   │   ├── models/      # User, Project, Task (ORM models)
│   │   ├── routers/     # auth, users, projects, tasks
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   └── main.py      # FastAPI app, CORS, startup
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/         # Axios client and per-resource helpers
    │   ├── components/  # Layout, TaskCard, Modal, Toast, Forms
    │   ├── context/     # AuthContext (JWT + user state)
    │   └── pages/       # Dashboard, Projects, ProjectDetail, TaskDetail, MyTasks, Profile
    └── package.json
```

---

## Running Locally

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local    # set VITE_API_URL=http://localhost:8000
npm run dev
```
