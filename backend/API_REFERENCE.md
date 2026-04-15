# ScriboAI API Reference

This document describes the HTTP API exposed by the ScriboAI backend.

Base path examples assume the app is running locally.

## Authentication Model

- Authentication is cookie-based
- After login or registration, the backend sets an HTTP-only cookie named `token`
- All routes require authentication unless stated otherwise
- The backend reads the JWT from cookies, not from an `Authorization` header

## Base URL

```text
http://localhost:8080
```

## Common Response Shapes

### Error response

Most handled errors use one of these formats:

```json
{
  "errorCode": "NOT_FOUND",
  "message": "Resource not found"
}
```

or for AI validation failures:

```json
{
  "error": "Message cannot be empty"
}
```

### Paginated response

```json
{
  "content": [],
  "page": 0,
  "pageSize": 9,
  "totalElements": 0,
  "totalPages": 0
}
```

## Auth Endpoints

### `POST /api/auth/register`

Creates a local user account and sets the auth cookie.

Auth required: No

Request body:

```json
{
  "username": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Validation:

- `username` is required
- `email` is required and must be valid
- `password` is required and must be at least 6 characters

Success:

- Status: `201 Created`
- Sets cookie: `token`

Response body:

```json
{
  "message": "Login successful"
}
```

Possible errors:

- `409 Conflict` if email already exists
- `400 Bad Request` on validation failure

### `POST /api/auth/login`

Authenticates a local user and sets the auth cookie.

Auth required: No

Request body:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Validation:

- `email` is required and must be valid
- `password` is required

Success:

- Status: `200 OK`
- Sets cookie: `token`

Response body:

```json
{
  "message": "Login successful"
}
```

Possible errors:

- `401 Unauthorized` for invalid credentials
- `400 Bad Request` on validation failure

### `POST /api/auth/logout`

Clears the auth cookie.

Auth required: Yes

Success:

- Status: `204 No Content`
- Sets `token` cookie with max-age `0`

### `GET /api/auth/me`

Returns the current authenticated user.

Auth required: Yes

Success:

```json
{
  "id": 1,
  "username": "Alice",
  "email": "alice@example.com"
}
```

Notes:

- Implemented as `UserResponse`
- JSON field name will likely serialize as `id` even though the record field is named `Id`

## Document Endpoints

Base path: `/api/docs`

## `POST /api/docs`

Creates a new root-level document.

Auth required: Yes

Success:

- Status: `201 Created`

Response body:

```json
{
  "id": 10,
  "title": "Untitled Document",
  "content": null,
  "createdAt": "2026-04-14T12:00:00",
  "updatedAt": "2026-04-14T12:00:00"
}
```

Notes:

- New documents created here are not placed in a folder

## `GET /api/docs`

Returns paginated root-level documents for the current user.

Auth required: Yes

Query params:

- `page` default `0`
- `pageSize` default `9`

Success:

```json
{
  "content": [
    {
      "id": 10,
      "title": "Untitled Document",
      "content": "Draft text",
      "createdAt": "2026-04-14T12:00:00",
      "updatedAt": "2026-04-14T13:00:00"
    }
  ],
  "page": 0,
  "pageSize": 9,
  "totalElements": 1,
  "totalPages": 1
}
```

Notes:

- Sorted by `updatedAt` descending
- Only returns documents where `folder` is `null`

## `GET /api/docs/{docId}`

Returns a single document owned by the authenticated user.

Auth required: Yes

Possible errors:

- `404 Not Found` if the document does not exist for that user

## `PUT /api/docs/{docId}`

Updates the document content.

Auth required: Yes

Request body:

```json
{
  "content": "Updated body text"
}
```

Success:

```json
{
  "message": "Document saved"
}
```

Possible errors:

- `400 Bad Request` if validation fails
- `500 Internal Server Error` in some access-denied paths because service logic throws generic runtime exceptions

## `PATCH /api/docs/{docId}/title`

Updates the document title.

Auth required: Yes

Request body:

```json
{
  "title": "New title"
}
```

Success:

```json
{
  "message": "Title updated"
}
```

## `DELETE /api/docs/{docId}`

Deletes a document owned by the authenticated user.

Auth required: Yes

Success:

```json
{
  "message": "Document deleted"
}
```

## `GET /api/docs/count`

Returns the total number of documents owned by the current user.

Auth required: Yes

Success:

```json
{
  "count": 12
}
```

Notes:

- Counts all documents, including documents inside folders

## Folder Endpoints

Base path: `/api/f`

## `POST /api/f`

Creates a folder.

Auth required: Yes

Request body:

```json
{
  "name": "Work"
}
```

Success:

- Status: `201 Created`

Response body:

```json
{
  "id": 3,
  "name": "Work",
  "createdAt": "2026-04-14T12:00:00",
  "updatedAt": "2026-04-14T12:00:00"
}
```

Notes:

- Folder names are unique per user at the database level

## `POST /api/f/{folderId}/docs`

Creates a new document directly inside a folder.

Auth required: Yes

Success:

- Status: `201 Created`

Response body:

```json
{
  "id": 15,
  "title": "Untitled Document",
  "content": null,
  "createdAt": "2026-04-14T12:00:00",
  "updatedAt": "2026-04-14T12:00:00"
}
```

Possible errors:

- `404 Not Found` if the folder does not belong to the user

## `GET /api/f`

Returns paginated folders for the current user.

Auth required: Yes

Query params:

- `page` default `0`
- `pageSize` default `9`

Success:

```json
{
  "content": [
    {
      "id": 3,
      "name": "Work",
      "createdAt": "2026-04-14T12:00:00",
      "updatedAt": "2026-04-14T12:00:00"
    }
  ],
  "page": 0,
  "pageSize": 9,
  "totalElements": 1,
  "totalPages": 1
}
```

Notes:

- Sorted by folder `name` ascending

## `GET /api/f/{folderId}`

Returns a folder together with all documents inside it.

Auth required: Yes

Success:

```json
{
  "folder": {
    "id": 3,
    "name": "Work",
    "createdAt": "2026-04-14T12:00:00",
    "updatedAt": "2026-04-14T12:00:00"
  },
  "docs": [
    {
      "id": 15,
      "title": "Untitled Document",
      "content": null,
      "createdAt": "2026-04-14T12:00:00",
      "updatedAt": "2026-04-14T12:00:00"
    }
  ]
}
```

Notes:

- Documents in a folder are sorted by `updatedAt` descending

## `PATCH /api/f/{folderId}`

Renames a folder.

Auth required: Yes

Request body:

```json
{
  "name": "Projects"
}
```

Success:

```json
{
  "message": "Title updated"
}
```

## `DELETE /api/f/{folderId}`

Deletes a folder.

Auth required: Yes

Success:

```json
{
  "message": "Folder deleted"
}
```

Notes:

- Folder deletion cascades to its documents

## `GET /api/f/count`

Returns the total number of folders owned by the current user.

Auth required: Yes

Success:

```json
{
  "count": 4
}
```

## AI Endpoints

Base path: `/api/ai`

All AI routes require authentication.

## `POST /api/ai/action`

Runs a quick action against a piece of text.

Auth required: Yes

Request body:

```json
{
  "action": "summarize",
  "text": "Long text to process"
}
```

Supported actions:

- `summarize`
- `improve`
- `shorten`
- `explain`

Success:

```json
{
  "result": "Processed output from the AI provider"
}
```

Notes:

- This route currently uses the Groq service
- Empty action or text produces an AI validation error

## `POST /api/ai/chat`

Runs a document-aware AI chat request.

Auth required: Yes

Request body:

```json
{
  "provider": "gemini",
  "document": "Current document content",
  "messages": [
    {
      "role": "user",
      "content": "Improve the introduction"
    }
  ]
}
```

Supported providers:

- `gemini`
- `groq`

Success:

```json
{
  "reply": "AI assistant response"
}
```

Behavior:

- Builds a prompt that includes the current document
- If the user asks for a rewrite or content update, the prompt instructs the model to return only the revised content
- If the user asks a normal question, the assistant can respond conversationally
- If the document is empty, the assistant behaves like a general writing assistant

Possible errors:

- `400 Bad Request` if messages are missing
- `400 Bad Request` if provider is invalid

## OAuth Support

The codebase contains an `OAuth2SuccessHandler` that:

- reads Google user info
- creates a user when needed
- sets the JWT cookie
- redirects to `http://localhost:5173/auth/success`

Important note:

- `SecurityConfig` does not currently enable `oauth2Login(...)`, so this flow appears incomplete from an API consumer perspective

## Security Notes

- JWT is read from the `token` cookie
- Expired or invalid JWTs return `401 Unauthorized`
- The JWT filter skips most `/api/auth/*` routes except `/api/auth/me`
- Cookies are currently created with `secure(false)`, which is suitable for local development but not production

## Development Notes

- Database: PostgreSQL
- JPA schema mode: `update`
- Local DB container is defined in `docker-compose.yml`
- The test suite needs PostgreSQL running on `localhost:5432`
