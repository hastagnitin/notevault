# NoteVault Server

Express.js backend for the NoteVault Smart Learning System with Supabase integration.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Express 4 |
| AI | Anthropic Claude Sonnet 4 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Authentication (JWT verification) |
| File Upload | Multer (in-memory) |
| PDF Parsing | pdf-parse |
| OCR | Tesseract.js |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |

---

## Quick Start

### 1. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

ANTHROPIC_API_KEY=sk-ant-api03-...

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project dashboard:
- Project URL: https://supabase.com/dashboard/project/YOUR-PROJECT/settings/api
- Service Role Key: For backend operations (keep secret!)
- Anon Key: For frontend operations

### 2. Set up Supabase Database

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'image', 'text')),
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  questions JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Rooms table
CREATE TABLE study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id),
  room_name TEXT,
  participants UUID[],
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_chats_note ON chats(note_id);
CREATE INDEX idx_quizzes_note ON quizzes(note_id);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (see full setup guide)
```

### 3. Install and run

```bash
npm install
npm run dev        # development (nodemon)
npm start          # production
```

Server starts at `http://localhost:5000`.  
Health check: `GET http://localhost:5000/health`

---

## API Reference

All routes (except `/health` and `/api/auth/*`) require a Supabase JWT token:

```
Authorization: Bearer <supabase-jwt-token>
```

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create new user account |
| `POST` | `/api/auth/login` | Sign in with email/password |
| `POST` | `/api/auth/logout` | Sign out user |

**Signup/Login body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "jwt-token", "expires_in": 3600 }
}
```

### Notes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/notes/upload` | Upload PDF / image / TXT, extract text |
| `GET` | `/api/notes` | List all notes for authenticated user |
| `GET` | `/api/notes/:id` | Get specific note details |
| `DELETE` | `/api/notes/:id` | Delete a note |

**Upload body** - `multipart/form-data`:
- `file` - the file (PDF, JPG, PNG, TXT - max 10 MB)
- `title` *(optional)* - custom title

**Upload response:**
```json
{
  "id": "uuid",
  "title": "...",
  "fileType": "pdf|image|text",
  "fileUrl": "https://...",
  "content": "extracted text...",
  "metadata": { "pageCount": 5, "wordCount": 1200 },
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

### Chat

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat/ask` | Ask a question about a note |
| `GET` | `/api/chat/:noteId/history` | Fetch conversation history |

**Ask body:**
```json
{ "noteId": "uuid", "question": "What is photosynthesis?" }
```

---

### Explain

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/explain` | Explain a selected text passage |

**Body:**
```json
{ "noteId": "uuid", "selectedText": "..." }
```

---

### Quiz

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/quiz/generate` | Generate 10 MCQs from a note |
| `GET` | `/api/quiz/:quizId` | Fetch a generated quiz |
| `GET` | `/api/quiz/note/:noteId` | Get all quizzes for a note |

**Generate body:**
```json
{ "noteId": "uuid" }
```

**Generated quiz shape:**
```json
{
  "id": "uuid",
  "questions": [
    {
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ],
  "generatedAt": "2024-01-01T00:00:00Z"
}
```

---

### Cheat Sheet

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/cheatsheet/generate` | Generate a structured cheat sheet |

**Body:**
```json
{ "noteId": "uuid" }
```

Returns markdown-formatted cheat sheet string.

---

### Study Room

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/studyroom/create` | Create a study room |
| `POST` | `/api/studyroom/:roomId/message` | Send a message (AI replies to questions) |
| `GET` | `/api/studyroom/:roomId` | Get room details and messages |
| `GET` | `/api/studyroom/user/:userId` | Get user's study rooms |

**Create body:**
```json
{ 
  "noteId": "uuid", 
  "roomName": "Study Session 1",
  "participants": ["userId1", "userId2"] 
}
```

**Message body:**
```json
{ "message": "Can you explain the second law of thermodynamics?" }
```

---

## Project Structure

```
server/
|-- src/
|   |-- index.js                  # Express app entry point
|   |-- config/
|   |   |-- supabase.js           # Supabase client init
|   |   |-- claude.js             # Anthropic client + callClaude()
|   |   `-- multer.js             # File upload config & validation
|   |-- middleware/
|   |   |-- authenticate.js       # Supabase JWT verification
|   |   |-- aiRateLimiter.js      # Per-user AI rate limiter
|   |   `-- errorHandler.js       # Centralized error handler
|   |-- routes/
|   |   |-- auth.js               # User authentication
|   |   |-- notes.js              # Upload + list notes
|   |   |-- chat.js               # Q&A + history
|   |   |-- explain.js            # Text explanation
|   |   |-- quiz.js               # MCQ generation
|   |   |-- cheatsheet.js         # Cheat sheet generation
|   |   `-- studyroom.js          # Collaborative study rooms
|   `-- services/
|       |-- textExtractor.js      # PDF + OCR + plain text
|       `-- storageService.js     # Supabase Storage upload/delete
|-- .env.example
|-- .gitignore
`-- package.json
```

## Database Schema

| Table | Description |
|---|---|
| `users` | User profiles (handled by Supabase Auth) |
| `notes` | Uploaded notes + extracted content |
| `chats` | Per-note Q&A conversation history |
| `quizzes` | Generated MCQ quizzes |
| `study_rooms` | Collaborative study sessions |

## Rate Limits

| Scope | Limit |
|---|---|
| Global | 100 requests / 15 min per IP |
| AI endpoints | 20 requests / 1 min per user |

Both limits are configurable via `.env`.

## Features

- **File Upload**: PDF, JPG, PNG, TXT support with automatic text extraction
- **AI Chat**: Claude-powered Q&A based on note content
- **Quiz Generation**: Automatic MCQ creation from study material
- **Cheat Sheets**: AI-generated summary documents
- **Study Rooms**: Collaborative learning spaces with AI assistance
- **Security**: Row-level security, JWT authentication, rate limiting
- **Scalable**: Supabase PostgreSQL backend with automatic scaling

## Deployment

### Environment Variables Required:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key for backend
- `ANTHROPIC_API_KEY`: Claude API key
- `PORT`: Server port (default: 5000)
- `CLIENT_ORIGIN`: Frontend URL for CORS

### Production Setup:
1. Set up Supabase project with proper RLS policies
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start server: `npm start`

## License

MIT License - see LICENSE file for details.
