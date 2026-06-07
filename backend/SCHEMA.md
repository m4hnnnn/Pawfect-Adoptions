# Pawfect Adoptions — Database Schema

## Database: SQLite (via better-sqlite3)

---

## Table: `users`
Stores all registered user accounts.

| Column       | Type    | Constraints              | Description                        |
|--------------|---------|--------------------------|------------------------------------|
| id           | INTEGER | PRIMARY KEY AUTOINCREMENT| Unique user ID                     |
| name         | TEXT    | NOT NULL                 | Display name                       |
| email        | TEXT    | NOT NULL UNIQUE          | Login email (stored lowercase)     |
| password     | TEXT    | NOT NULL                 | bcrypt hash (never plain text)     |
| created_at   | TEXT    | DEFAULT datetime('now')  | Account creation timestamp         |
| last_login   | TEXT    |                          | Last successful login timestamp    |
| is_active    | INTEGER | DEFAULT 1                | 0 = soft-deleted / banned          |

---

## Table: `favorites`
Many-to-many link between users and cat IDs.

| Column    | Type    | Constraints                        | Description              |
|-----------|---------|------------------------------------|--------------------------|
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT          | Row ID                   |
| user_id   | INTEGER | REFERENCES users(id) CASCADE       | Which user saved it      |
| cat_id    | INTEGER | NOT NULL                           | Which cat was saved      |
| saved_at  | TEXT    | DEFAULT datetime('now')            | When it was saved        |
|           |         | UNIQUE(user_id, cat_id)            | No duplicate saves       |

---

## Table: `applications`
Stores adoption inquiry form submissions.

| Column       | Type    | Constraints                       | Description                   |
|--------------|---------|-----------------------------------|-------------------------------|
| id           | INTEGER | PRIMARY KEY AUTOINCREMENT         | Row ID                        |
| user_id      | INTEGER | REFERENCES users(id) SET NULL     | Linked account (optional)     |
| cat_id       | INTEGER | NOT NULL                          | Which cat they want           |
| name         | TEXT    | NOT NULL                          | Applicant name                |
| email        | TEXT    | NOT NULL                          | Applicant email               |
| message      | TEXT    | NOT NULL                          | Their message                 |
| status       | TEXT    | DEFAULT 'pending'                 | pending / approved / rejected |
| submitted_at | TEXT    | DEFAULT datetime('now')           | Submission timestamp          |

---

## API Endpoints

### Auth
| Method | Endpoint              | Auth? | Description              |
|--------|-----------------------|-------|--------------------------|
| POST   | /api/auth/signup      | No    | Create account           |
| POST   | /api/auth/login       | No    | Sign in, get JWT token   |
| GET    | /api/auth/me          | Yes   | Get current user profile |
| DELETE | /api/auth/account     | Yes   | Delete own account       |

### Favorites
| Method | Endpoint                  | Auth? | Description       |
|--------|---------------------------|-------|-------------------|
| GET    | /api/favorites            | Yes   | List saved cats   |
| POST   | /api/favorites/:catId     | Yes   | Save a cat        |
| DELETE | /api/favorites/:catId     | Yes   | Unsave a cat      |

### Applications
| Method | Endpoint                  | Auth? | Description             |
|--------|---------------------------|-------|-------------------------|
| POST   | /api/applications         | No    | Submit application      |
| GET    | /api/applications/mine    | Yes   | Get own applications    |

---

## Security Notes
- Passwords are hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- Auth uses **JWT tokens** (expire after 7 days)
- Foreign keys are enforced with `PRAGMA foreign_keys = ON`
- WAL mode enabled for concurrent read performance
