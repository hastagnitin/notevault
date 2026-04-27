# Ollama Setup Guide

## Installing Ollama

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
```bash
brew install ollama
```

### Windows
Download from [ollama.com](https://ollama.com) and run the installer.

## Setting Up Gemma 2B Model

1. **Start Ollama Server**
   ```bash
   ollama serve
   ```

2. **Pull the Model**
   ```bash
   ollama pull gemma:2b
   ```

3. **Test the Installation**
   ```bash
   ollama run gemma:2b "Hello, how are you?"
   ```

## Configuration for NoteVault AI

### Environment Variables

Add to `backend/.env`:
```env
OLLAMA_BASE_URL=http://localhost:11434
```

### Optimizing for 6GB RAM

Create a Modelfile for optimized settings:

```dockerfile
FROM gemma:2b

PARAMETER num_ctx 2048
PARAMETER temperature 0.7
PARAMETER top_p 0.9
```

Build optimized model:
```bash
ollama create notevault-gemma -f ./Modelfile
```

## Verifying Connection

The backend will automatically check Ollama on startup. Look for:
```
✅ Ollama connected (gemma:2b)
```

## Troubleshooting

### Connection Refused
- Ensure Ollama server is running: `ollama serve`
- Check port 11434 is not blocked by firewall

### Model Not Found
- Pull the model: `ollama pull gemma:2b`
- Verify model list: `ollama list`

### Out of Memory
- Close other applications
- Use smaller context window (1024 instead of 2048)
- Restart Ollama: `ollama serve`

## Usage Modes

- **Fast (Local)**: Always uses Ollama
- **Smart (Cloud)**: Uses NVIDIA API with Ollama fallback
- **Auto**: Automatically routes based on query complexity
