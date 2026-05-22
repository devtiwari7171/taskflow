# 🚀 TaskFlow — Team Task Manager

A full-stack team task management app with **role-based access control**, built with **FastAPI + React + PostgreSQL**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT signup/login, bcrypt password hashing, 7-day tokens |
| 👥 RBAC | App-level Admin/Member + per-project Admin/Member roles |
| 📁 Projects | Create, update, delete; color-coded; progress tracking |
| ✅ Tasks | Full CRUD, 4 statuses, 4 priorities, due dates, assignees |
| 💬 Comments | Thread comments on tasks, delete own or (admin) any |
| 📊 Dashboard | Live stats — total, in-progress, overdue, completion % |
| 📋 Kanban | Board view grouped by status; list view with filters |
| 📱 Responsive | Mobile-first sidebar + top-nav |

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP | Axios |
| Routing | React Router v6 |
| Deployment | Railway |

---

## 📂 Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── core/        # config.py · security.py · deps.py
│   │   ├── db/          # database.py (engine + session)
│   │   ├── models/      # user · project · task (SQLAlchemy)
│   │   ├── routers/     # auth · users · projects · tasks
│   │   ├── schemas/     # Pydantic I/O schemas
│   │   └── main.py      # FastAPI app + CORS + startup
│   ├── requirements.txt
│   └── railway.json
└── frontend/
    ├── src/
    │   ├── api/         # axios client + per-resource helpers
    │   ├── components/  # Layout · Avatar · TaskCard · Modal · Toast · TaskForm
    │   ├── context/     # AuthContext (JWT + user state)
    │   └── pages/       # Dashboard · Projects · ProjectDetail · TaskDetail · MyTasks · Profile
    ├── package.json
    └── railway.json
```

---

## 🌐 REST API Reference

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register, returns JWT + user |
| POST | `/login` | Login, returns JWT + user |
| GET | `/me` | Current user info |
| PUT | `/me` | Update name / avatar color |

### Projects — `/api/projects`
| Method | Path | Access |
|---|---|---|
| GET | `/` | Own projects (Admin: all) |
| POST | `/` | Any authenticated user |
| GET | `/{id}` | Project members |
| PUT | `/{id}` | Project admin |
| DELETE | `/{id}` | Owner or App admin |
| POST | `/{id}/members` | Project admin |
| DELETE | `/{id}/members/{uid}` | Project admin |
| PATCH | `/{id}/members/{uid}` | Project admin |

### Tasks — `/api`
| Method | Path | Description |
|---|---|---|
| GET | `/projects/{id}/tasks` | List (filterable by status, assignee) |
| POST | `/projects/{id}/tasks` | Create task |
| GET | `/tasks/{id}` | Task detail + comments |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/comments` | Add comment |
| DELETE | `/comments/{id}` | Delete comment |
| GET | `/dashboard/stats` | Aggregated counts |
| GET | `/dashboard/my-tasks` | Tasks assigned to me |

> **Interactive docs:** `https://your-api.railway.app/api/docs`

---

## 🔒 Role-Based Access Control Matrix

| Action | Member | Project Admin | App Admin |
|---|:---:|:---:|:---:|
| View own projects/tasks | ✅ | ✅ | ✅ |
| View ALL projects | ❌ | ❌ | ✅ |
| Create project | ✅ | ✅ | ✅ |
| Delete project | ❌ | Owner only | ✅ |
| Add / remove members | ❌ | ✅ | ✅ |
| Create / update tasks | ✅ | ✅ | ✅ |
| Delete any task | ❌ | ✅ | ✅ |
| Delete own task | ✅ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |

---

## 🏃 Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL + SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local    # set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 🚀 Deploy to Railway (Step-by-Step)

### 1 — Push to GitHub
```bash
git init && git add . && git commit -m "TaskFlow initial commit"
git remote add origin https://github.com/YOU/YOUR-REPO.git
git push -u origin main
```

### 2 — Backend service
1. Railway → **New Project** → **Deploy from GitHub** → select repo
2. **Root Directory** → `backend`
3. **+ New** → **Database** → **PostgreSQL** (auto-sets `DATABASE_URL`)
4. Add env vars:
   ```
   SECRET_KEY=<run: openssl rand -hex 32>
   FRONTEND_URL=https://PLACEHOLDER   ← update after step 3
   ```
5. Verify: `https://your-api.railway.app/health` → `{"status":"healthy"}`

### 3 — Frontend service
1. Same project → **+ New** → **GitHub Repo** (same repo)
2. **Root Directory** → `frontend`
3. Add env var:
   ```
   VITE_API_URL=https://your-api.railway.app
   ```
4. Build: `npm install && npm run build` | Start: `npx serve -s dist -l $PORT`

### 4 — Link CORS
Back in backend service → update `FRONTEND_URL=https://your-frontend.railway.app` → redeploy.

---

## 🎥 Demo Video Script (2–5 min)

1. Open live URL → show Login/Signup pages
2. Sign up as **Admin** → tour Dashboard (stats cards, progress bar)
3. Create a project with color picker
4. Switch to Kanban board → create 3 tasks (different priorities/due dates)
5. Open a task → change status, add comment
6. Add a second user via **Add Member** → show member list
7. Assign a task to the member
8. Sign in as **Member** → show restricted view (no admin controls)
9. Open **My Tasks** → show overdue grouping
10. Back to **Dashboard** → show real-time stats

---

## 📦 Submission Checklist

- [ ] Live URL (frontend)
- [ ] Live API URL + `/api/docs`
- [ ] GitHub repo link
- [ ] README (this file)
- [ ] 2–5 min demo video
