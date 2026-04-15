# ScriboAI Frontend

ScriboAI Frontend is a React + Vite client for the ScriboAI writing workspace. It handles authentication screens, dashboard navigation, folder and document browsing, rich text editing, and AI-assisted writing interactions.

## Features

- Email/password authentication with optional Google OAuth redirect
- Persistent auth state using Redux Toolkit + Redux Persist
- Dashboard for browsing documents and folders
- Folder-based document organization
- Rich text editing with Tiptap
- Auto-save for document content
- AI actions on selected text
- AI chat panel with provider switching
- User profile page with document and folder counts
- Toast notifications for success and error feedback

## Tech Stack

- React 19
- Vite
- React Router DOM
- Redux Toolkit
- Redux Persist
- Tailwind CSS
- Tiptap editor
- Lucide React icons
- React Toastify

## Responsibilities

This frontend is responsible for:

- routing between auth, dashboard, editor, folder, and profile pages
- storing auth state in Redux
- calling the backend with `credentials: "include"`
- rendering the Tiptap-based editor
- sending AI action and AI chat requests
- displaying loading, success, and error states

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A running ScriboAI backend API

### Installation

```bash
npm install
```

### Environment Variables

Create or update `.env`:

```env
VITE_BACKEND_URL=http://localhost:8080/api
```

The frontend makes authenticated requests with `credentials: "include"`, so the backend must be configured to:

- allow CORS for the frontend origin
- accept cookies/credentials
- expose the expected `/api` routes

### Run Locally

```bash
npm run dev
```

Open the app at the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Main Routes

- `/auth` - sign in / sign up page
- `/auth/success` - post-login success handler
- `/` - home dashboard with documents and folders
- `/doc/:docId` - document editor
- `/f/:folderId` - folder detail page
- `/profile` - user profile

## Project Structure

```text
frontend/
|-- src/
|   |-- components/
|   |   |-- AIPanel.jsx
|   |   |-- CreateFolder.jsx
|   |   `-- DeleteModal.jsx
|   |-- pages/
|   |   |-- Auth.jsx
|   |   |-- AuthSuccess.jsx
|   |   |-- DocumentEditor.jsx
|   |   |-- FolderPage.jsx
|   |   |-- Home.jsx
|   |   `-- Profile.jsx
|   |-- store/
|   |   |-- authSlice.js
|   |   `-- store.js
|   |-- App.jsx
|   |-- Routes.jsx
|   `-- main.jsx
|-- package.json
`-- README.md
```

## How It Works

### Authentication

- Users can register or sign in with email and password
- Google login redirects to the backend OAuth endpoint
- Auth state is stored in Redux and persisted in browser storage

### Documents

- Users can create documents from the home page or inside a folder
- Document content is edited with Tiptap
- Changes are auto-saved to the backend
- Titles can be updated inline

### AI Tools

- Selected text can be sent for AI actions
- The side panel supports AI chat against the current document
- The UI supports switching between `gemini` and `groq` providers

## Backend Contract

This frontend expects a backend that:

- runs on the URL provided in `VITE_BACKEND_URL`
- supports cookie-based auth
- allows credentials in CORS
- exposes the expected `/api` routes

Main endpoint groups used by the frontend:

- `/api/auth/*`
- `/api/docs/*`
- `/api/f/*`
- `/api/ai/*`

## Deployment

This project includes `vercel.json` with a rewrite rule so client-side routes resolve correctly when deployed on Vercel.

## Notes

- `node_modules/` is already present in this workspace, but `npm install` is still the standard setup step on a fresh clone.
- There is also an unused `src/pages/doc.jsx` file in the repository that is not currently wired into routing.

## Related Docs

- Project overview: [../README.md](../README.md)
- Backend guide: [../backend/README.md](../backend/README.md)
