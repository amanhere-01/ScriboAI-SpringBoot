# ScriboAI Backend

ScriboAI Backend is a Spring Boot API for authentication, document and folder management, and AI-powered writing assistance. It serves the React frontend in the root project and uses PostgreSQL for persistence.

## Responsibilities

This backend is responsible for:

- user registration and login
- cookie-based JWT authentication
- document CRUD operations
- folder CRUD operations
- document and folder counts
- AI text actions
- document-aware AI chat

There is also partial Google OAuth support in the codebase, although the Spring Security configuration does not currently enable the OAuth login flow.

## Tech Stack

- Java 21
- Spring Boot 3.5.10
- Spring Web
- Spring Data JPA
- Spring Security
- Spring OAuth2 Client
- PostgreSQL
- Lombok
- Maven
- WebClient for AI provider calls

## Package Structure

- `auth` - registration, login, logout, and current-user lookup
- `security` - JWT handling, auth filter, user details service, OAuth success handler
- `user` - user entity and repository
- `document` - controllers, services, entities, DTOs, mappers, and repository for documents
- `folder` - controllers, services, entities, DTOs, mappers, and repository for folders
- `ai` - AI controllers, DTOs, prompt handling, and provider integrations
- `common` - paginated response model and global exception handling
- `config` - Spring Security and application configuration

## Data Model

User:
- `id`
- `username`
- `email`
- `password`
- `googleId`
- `authProvider` (`LOCAL` or `GOOGLE`)
- `createdAt`

Folder:
- `id`
- `name`
- `createdAt`
- `updatedAt`
- `owner`
- `documents`

- Folder name is unique per user
- Folder belongs to exactly one owner

Document:
- `id`
- `title`
- `content`
- `createdAt`
- `updatedAt`
- `owner`
- `folder` (nullable)

- A document may exist at the root level or inside a folder
- Every document belongs to exactly one owner

## Getting Started

### Prerequisites

- Java 21
- PostgreSQL 15 or Docker Desktop

### 1. Create local configuration

Copy the committed example file and create your local config:

```bash
cp src/main/resources/application-example.properties src/main/resources/application.properties
```

On Windows PowerShell:

```powershell
Copy-Item src\main\resources\application-example.properties src\main\resources\application.properties
```

Then fill in the required values in `src/main/resources/application.properties`.

### 2. Start PostgreSQL

You can use the included Docker setup:

```bash
docker compose up -d
```

Default local database values expected by the example file:

- host: `localhost`
- port: `5432`
- database: `scriboai`
- username: your local PostgreSQL username
- password: your local PostgreSQL password

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs by default at `http://localhost:8080`.

## Configuration Reference

Use [src/main/resources/application-example.properties](src/main/resources/application-example.properties) as the setup template.

Required for local development:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `jwt.secret`

Needed for AI features:

- `ai.gemini.api-key`
- `ai.groq.api-key`

Optional unless you finish Google login wiring:

- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`
- `spring.security.oauth2.client.registration.google.scope`

## Authentication Model

- Authentication is cookie-based
- The backend sets an HTTP-only cookie named `token`
- JWTs include the user email as subject and a `userId` claim
- Passwords are hashed with BCrypt
- Most routes require authentication
- CORS is currently configured for `http://localhost:5173` and `http://localhost:4173`

## Main API Areas

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Documents

- `POST /api/docs`
- `GET /api/docs`
- `GET /api/docs/{docId}`
- `PUT /api/docs/{docId}`
- `PATCH /api/docs/{docId}/title`
- `DELETE /api/docs/{docId}`
- `GET /api/docs/count`

### Folders

- `POST /api/f`
- `GET /api/f`
- `GET /api/f/{folderId}`
- `PATCH /api/f/{folderId}`
- `DELETE /api/f/{folderId}`
- `POST /api/f/{folderId}/docs`
- `GET /api/f/count`

### AI

- `POST /api/ai/action`
- `POST /api/ai/chat`

## Scripts

| Command | Description |
| --- | --- |
| `./mvnw spring-boot:run` | Start the backend |
| `./mvnw test` | Run tests |
| `docker compose up -d` | Start PostgreSQL locally |

On Windows, use `.\mvnw.cmd` instead of `./mvnw`.

## API Docs

Full endpoint documentation is available in [API_REFERENCE.md](./API_REFERENCE.md).

## Current Gaps and Risks
- Real secrets should eventually move to environment variables or a secrets manager.
- Google OAuth handler exists, but OAuth login is not currently enabled in `SecurityConfig`.
- Tests are minimal. The repository currently contains only a basic Spring context load test.
- The test suite requires PostgreSQL to be running locally.
- The document count endpoint counts all user documents, while the root document listing only returns documents not inside folders.

## Related Docs

- Project overview: [../README.md](../README.md)
- Frontend guide: [../frontend/README.md](../frontend/README.md)
