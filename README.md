# ScriboAI

ScriboAI is a full-stack AI-assisted writing workspace built with a React frontend and a Spring Boot backend. It lets users authenticate, create and organize documents, edit content in a rich text editor, and use AI tools to summarize, improve, shorten, explain, or chat about their writing.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Documentation](#documentation)
- [Security Notes](#security-notes)
- [Current Status](#current-status)

## Overview

This repository is organized as a small monorepo with two applications:

- `frontend` - React + Vite client for authentication, dashboard, folders, and document editing
- `backend` - Spring Boot API for auth, document management, folder management, and AI integrations

The frontend communicates with the backend over HTTP and relies on cookie-based authentication. The backend stores user, folder, and document data in PostgreSQL.

## Features

- User registration and login with JWT stored in an HTTP-only cookie
- Create, rename, update, count, and delete documents
- Organize documents inside folders
- Rich text editing with Tiptap and auto-save
- AI actions for summarize, improve, shorten, and explain
- Document-aware AI chat using `gemini` or `groq`
- Redux-based auth state with persistence

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Redux Toolkit
- Redux Persist
- Tailwind CSS
- Tiptap editor

### Backend

- Java 21
- Spring Boot 3.5.10
- Spring Web
- Spring Data JPA
- Spring Security
- Spring OAuth2 Client
- PostgreSQL
- Maven

## Project Structure

```text
ScriboAI/
|-- backend/
|   |-- src/main/java/com/example/scriboai/
|   |   |-- ai/
|   |   |-- auth/
|   |   |-- common/
|   |   |-- config/
|   |   |-- document/
|   |   |-- folder/
|   |   |-- security/
|   |   `-- user/
|   |-- src/main/resources/
|   |-- README.md
|   |-- docker-compose.yml
|   |-- pom.xml
|   `-- API_REFERENCE.md
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- store/
|   |-- README.md
|   |-- package.json
|   |-- tailwind.config.js
|   `-- vite.config.js
`-- README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- Java 21
- Node.js 18 or newer
- npm
- PostgreSQL 15 or Docker Desktop

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ScriboAI
```

### 2. Start PostgreSQL

You can use the Docker setup already included in the backend:

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL with the local database name `scriboai` on port `5432`.

### 3. Configure the backend

Copy the example config and create your local backend config file:

```bash
cp backend/src/main/resources/application-example.properties backend/src/main/resources/application.properties
```

On Windows PowerShell:

```powershell
Copy-Item backend\src\main\resources\application-example.properties backend\src\main\resources\application.properties
```

Then review `backend/src/main/resources/application.properties` before running the server.

At minimum, make sure these settings match your local setup:

- PostgreSQL database URL
- PostgreSQL username and password
- JWT secret
- Google OAuth client credentials, if you plan to use OAuth later
- AI provider keys for Gemini and Groq

### 4. Run the backend

From the `backend` directory:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs by default at:

```text
http://localhost:8080
```

### 5. Configure the frontend

The frontend expects a `.env` file in `frontend/` with the backend base URL:

```env
VITE_BACKEND_URL=http://localhost:8080/api
```

### 6. Install frontend dependencies

From the `frontend` directory:

```bash
npm install
```

### 7. Run the frontend

```bash
npm run dev
```

The Vite development server usually starts at:

```text
http://localhost:5173
```

## Environment Configuration

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Yes | Base URL used by the React app for backend API requests |

### Backend

The backend currently reads configuration from `backend/src/main/resources/application.properties`.

Use `backend/src/main/resources/application-example.properties` as the setup template for new environments.

Important settings include:

| Setting | Purpose |
| --- | --- |
| `spring.datasource.url` | PostgreSQL connection URL |
| `spring.datasource.username` | PostgreSQL username |
| `spring.datasource.password` | PostgreSQL password |
| `spring.jpa.hibernate.ddl-auto` | JPA schema strategy |
| `jwt.secret` | Secret used to sign JWTs |
| `spring.security.oauth2.client.registration.google.*` | Google OAuth client settings |
| `ai.gemini.api-key` | Gemini API key |
| `ai.groq.api-key` | Groq API key |

Configuration guidance:

- `spring.datasource.*` is required
- `jwt.secret` is required
- `ai.gemini.api-key` and `ai.groq.api-key` are needed for AI features
- Google OAuth settings are optional unless you complete Google login wiring

For production, these values should be externalized through environment variables or a secure secrets manager instead of being committed in source control.

## Documentation

- Root README: full-project overview and local setup
- Backend guide: [backend/README.md](backend/README.md)
- Backend API reference: [backend/API_REFERENCE.md](backend/API_REFERENCE.md)
- Frontend guide: [frontend/README.md](frontend/README.md)

## Security Notes

- Keep `backend/src/main/resources/application.properties` local and untracked.
- Use `backend/src/main/resources/application-example.properties` as the committed template for contributors.
- Real credentials and API keys should never be committed to version control.
- Cookies are currently created with `secure(false)`, which is acceptable for local development but not for production.
- The backend allows CORS for `http://localhost:5173` and `http://localhost:4173` by default.
- Google OAuth-related code exists, but the full login flow is not completely wired in the current Spring Security configuration.

## Current Status

ScriboAI already has the core building blocks of an AI writing platform: authentication, document and folder management, a rich editor, and AI-assisted workflows. The main production-readiness improvements still needed are secure configuration handling, more complete automated testing, and finishing the OAuth flow.
  
