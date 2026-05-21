# DevPulse Issue Tracker API

A RESTful issue tracking API built with Express, TypeScript, PostgreSQL, and JWT authentication. The API supports user registration/login, public issue browsing, authenticated issue creation, role-based issue updates, and maintainer-only issue deletion.

## Live URL

```text
https://express-js-jwts-ql.vercel.app
```

Local development URL:

```text
http://localhost:7000
```

## Features

- User registration with contributor/maintainer roles
- JWT-based login authentication
- Public issue listing with sorting and filtering
- Public single issue details
- Authenticated issue creation
- Role-based issue update rules:
  - Maintainers can update any issue
  - Contributors can update only their own open issues
- Maintainer-only issue deletion
- Consistent API response formatting
- Typed PostgreSQL query helper
- Centralized HTTP-aware error handling

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- http-status-codes
- tsx

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=7000
DB_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your_jwt_secret
```

3. Start the development server:

```bash
npm run dev
```

4. The database tables are initialized automatically when the server starts.

## Deploy to Vercel

1. Push the project to GitHub.

2. Create a PostgreSQL database on a hosted provider such as Neon, Supabase, or Railway.

3. Import the GitHub repository into Vercel.

4. Add these environment variables in Vercel project settings:

```env
DB_URL=your_hosted_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

`PORT` is not required on Vercel because Vercel manages the serverless runtime.

5. Deploy the project.

The Vercel serverless entrypoint is:

```text
api/index.ts
```

The routing configuration is stored in:

```text
vercel.json
```

After deployment, replace the "Live URL" section above with your Vercel production URL.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive a JWT token |

### Issues

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues |
| GET | `/api/issues/:id` | Public | Get a single issue by ID |
| PATCH | `/api/issues/:id` | Maintainer or issue owner | Update issue title, description, or type |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for `GET /api/issues`

| Parameter | Allowed Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

Example:

```http
GET /api/issues?sort=oldest&type=bug&status=open
```

## Request Examples

### Register

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

### Create Issue

```http
POST /api/issues
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

### Update Issue

```http
PATCH /api/issues/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Database connection timeout during peak traffic"
}
```

## Database Schema Summary

### `users`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | SERIAL | Primary key |
| `name` | VARCHAR(255) | Required |
| `email` | VARCHAR(255) | Required, unique |
| `password` | TEXT | Required, hashed |
| `role` | VARCHAR(50) | Required, default `contributor`, allowed: `contributor`, `maintainer` |
| `created_at` | TIMESTAMP | Default `NOW()` |
| `updated_at` | TIMESTAMP | Default `NOW()` |

### `issues`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | SERIAL | Primary key |
| `title` | VARCHAR(150) | Required |
| `description` | TEXT | Required, minimum 20 characters |
| `type` | VARCHAR(20) | Required, allowed: `bug`, `feature_request` |
| `status` | VARCHAR(20) | Required, default `open`, allowed: `open`, `in_progress`, `resolved` |
| `reporter_id` | INTEGER | Required, user ID from JWT |
| `created_at` | TIMESTAMP | Default `NOW()` |
| `updated_at` | TIMESTAMP | Default `NOW()` |

## Status Codes

| Code | Usage |
| --- | --- |
| 200 | Successful GET, PATCH, DELETE with response body |
| 201 | Successful resource creation |
| 400 | Invalid input or validation error |
| 401 | Missing, invalid, or expired JWT |
| 403 | Valid JWT but insufficient permission |
| 404 | Resource not found |
| 409 | Business logic conflict |
| 500 | Unexpected server or database error |
