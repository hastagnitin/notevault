# NoteVault AI Setup Guide

## Prerequisites

- Node.js 18+
- Ollama installed
- Supabase account
- NVIDIA API key (optional, for cloud AI features)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd notevault-ai
```

### 2. Install Ollama & Model
Follow [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) to install Ollama and pull gemma:2b model.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
NVIDIA_API_KEY=your_nvidia_key
NVIDIA_API_BASE=https://integrate.api.nvidia.com/v1
OLLAMA_BASE_URL=http://localhost:11434
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:5173
```

Create uploads directory:
```bash
mkdir uploads
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Database Setup

1. Create Supabase project
2. Go to SQL Editor
3. Run the SQL schema from `backend/schema.sql`
4. Create storage bucket "note-files" with public access

### 6. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Ollama:**
```bash
ollama serve
```

Visit http://localhost:5173

## Features

### AI Modes
- **Fast (Local)**: Uses local Ollama (gemma:2b)
- **Smart (Cloud)**: Uses NVIDIA API
- **Auto**: Intelligently routes based on query complexity

### Upload Types
- **Images**: OCR text extraction with Tesseract.js
- **PDFs**: Text extraction with pdf-parse
- **Camera**: Real-time capture with OCR

### Search
- **Semantic Search**: Vector-based similarity using pgvector
- **Keyword Search**: Full-text search on titles and content

## Testing

Run through this checklist:

- [ ] User signup/login works
- [ ] Create text note
- [ ] Upload image with OCR
- [ ] Upload PDF with extraction
- [ ] Camera capture works
- [ ] Chat with local AI
- [ ] Chat with NVIDIA API
- [ ] Auto mode routing works
- [ ] Semantic search returns relevant notes
- [ ] Quiz generation works
- [ ] Cheat sheet generation works
- [ ] Delete note works

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Environment Variables
Update production URLs in:
- `backend/.env` - CORS origins
- `frontend/.env.production` - API URL

### Database
- Enable Row Level Security (RLS)
- Set up proper indexes for performance
- Configure backup policies

## Troubleshooting

### 500 Errors
- Check backend logs for specific errors
- Verify Supabase connection
- Ensure Ollama is running

### OCR Not Working
- Verify Tesseract.js installation
- Check image quality (too blurry = poor OCR)
- Try image compression settings

### AI Not Responding
- Check Ollama: `ollama list`
- Verify NVIDIA API key if using cloud mode
- Check routing decisions in backend logs

## Support

For issues, check:
1. Backend logs
2. Browser console
3. Ollama logs
4. Supabase logs
