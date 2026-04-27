# 🛠️ NoteVault - Implementation & Architecture Guide

**For Hackathon Build (48-72 hours)**

---

## 📁 Project Structure

```
notevault/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── NoteViewer.jsx          # Left panel - PDF/Image display
│   │   ├── ChatPanel.jsx           # Right panel - AI chat
│   │   ├── QuizGenerator.jsx       # Quiz modal
│   │   ├── CheatSheetGenerator.jsx # Cheat-sheet template
│   │   ├── OCRUploader.jsx         # Image → Text
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       └── Modal.jsx
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   └── App.jsx                 # Main app
│   ├── services/
│   │   ├── claudeAPI.js            # Claude integration
│   │   ├── ocrService.js           # Tesseract.js wrapper
│   │   ├── pdfExport.js            # html2pdf wrapper
│   │   └── fileHandler.js          # Upload/processing
│   ├── hooks/
│   │   ├── useOCR.js               # OCR logic
│   │   ├── useChat.js              # Chat state
│   │   └── useQuiz.js              # Quiz logic
│   ├── styles/
│   │   ├── globals.css             # Tailwind + customs
│   │   └── components.css
│   └── utils/
│       ├── constants.js
│       ├── prompts.js              # Claude prompts
│       └── validators.js
├── .env.example
├── package.json
└── tailwind.config.js
```

---

## 🚀 Setup Instructions (Copy-Paste)

### Step 1: Create Project
```bash
npx create-react-app notevault
cd notevault
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Install Dependencies
```bash
# Core dependencies
npm install axios pdfjs-dist tesseract.js html2pdf.js
npm install lucide-react react-split-pane-component
npm install zustand react-query

# Dev dependencies
npm install -D tailwindcss autoprefixer postcss
```

### Step 3: Environment Setup
```bash
# Create .env file
echo "REACT_APP_CLAUDE_API_KEY=your_api_key_here" > .env
```

---

## 🔑 Key Component Implementations

### 1️⃣ Main App Layout (Split-Screen)

```jsx
// src/pages/App.jsx
import React, { useState } from 'react';
import NoteViewer from '../components/NoteViewer';
import ChatPanel from '../components/ChatPanel';
import OCRUploader from '../components/OCRUploader';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContext, setFileContext] = useState('');
  const [selectedText, setSelectedText] = useState('');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">📚 NoteVault</h1>
          <OCRUploader 
            onFileUpload={(file, text) => {
              setUploadedFile(file);
              setFileContext(text);
            }}
          />
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Note Viewer */}
        <div className="w-1/2 border-r border-gray-200 overflow-hidden bg-white">
          {uploadedFile ? (
            <NoteViewer 
              file={uploadedFile}
              onSelectText={setSelectedText}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-center">
                📄 Upload notes to start<br />
                (PDF or Image)
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Chat */}
        <div className="w-1/2 flex flex-col bg-gradient-to-b from-blue-50 to-indigo-50">
          {uploadedFile ? (
            <ChatPanel 
              fileContext={fileContext}
              selectedText={selectedText}
              onSelectText={setSelectedText}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Upload notes to chat 💬</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 2️⃣ OCR Uploader (Image → Text)

```jsx
// src/components/OCRUploader.jsx
import React, { useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Upload } from 'lucide-react';

export default function OCRUploader({ onFileUpload }) {
  const fileInput = useRef(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // For PDFs, extract first page as image
      // For images, use directly
      if (file.type === 'application/pdf') {
        // Using pdfjs for PDF handling
        const pdfData = await file.arrayBuffer();
        // Convert first page to image, then OCR
        console.log('PDF selected - need pdfjs integration');
      } else {
        // Direct image OCR
        const { data: { text } } = await Tesseract.recognize(
          file,
          'eng',
          { logger: m => console.log(m) }
        );
        
        onFileUpload(file, text);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error processing file. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        onChange={handleFileSelect}
        hidden
      />
      
      <button
        onClick={() => fileInput.current.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
      >
        <Upload size={18} />
        {loading ? 'Processing...' : 'Upload Notes'}
      </button>
    </div>
  );
}
```

---

### 3️⃣ Note Viewer (PDF/Image Display)

```jsx
// src/components/NoteViewer.jsx
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ZoomIn, ZoomOut } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function NoteViewer({ file, onSelectText }) {
  const [zoom, setZoom] = useState(100);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = () => {
    const selected = window.getSelection().toString();
    if (selected) {
      setSelectedText(selected);
      onSelectText(selected);
    }
  };

  const isImage = file.type.startsWith('image/');

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex gap-2 p-4 bg-gray-100 border-b">
        <button 
          onClick={() => setZoom(z => Math.max(50, z - 10))}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <ZoomOut size={18} />
        </button>
        <span className="px-4 py-2 bg-white rounded">{zoom}%</span>
        <button 
          onClick={() => setZoom(z => Math.min(200, z + 10))}
          className="p-2 hover:bg-gray-200 rounded"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-auto p-4 bg-gray-50"
        onMouseUp={handleTextSelection}
      >
        {isImage ? (
          <img 
            src={URL.createObjectURL(file)} 
            alt="Note"
            style={{ maxWidth: `${zoom}%` }}
            className="mx-auto shadow-lg rounded-lg cursor-text"
          />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            {/* PDF rendering via pdfjs */}
            <p className="text-gray-500">PDF view (implement with pdfjs)</p>
          </div>
        )}

        {/* Show selected text */}
        {selectedText && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-gray-700">Selected:</p>
            <p className="text-gray-900">"{selectedText}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 4️⃣ Chat Panel (AI Integration)

```jsx
// src/components/ChatPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { callClaude } from '../services/claudeAPI';

export default function ChatPanel({ fileContext, selectedText }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I've read your notes. Ask me anything about them!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: input
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // If text is selected, include it in context
      const contextPrompt = selectedText 
        ? `User selected this text: "${selectedText}". `
        : '';

      const systemPrompt = `You are a helpful study assistant. 
      You have access to student notes. Be concise but thorough.
      Current notes context: ${fileContext}`;

      const response = await callClaude(
        contextPrompt + input,
        systemPrompt
      );

      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: response
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: '❌ Error processing request. Try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 shadow border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-lg shadow border border-gray-200">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your notes..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Quick actions */}
        {selectedText && (
          <button
            type="button"
            onClick={() => setInput(`Explain this: "${selectedText}"`)}
            className="mt-2 text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition flex items-center gap-1"
          >
            <Sparkles size={14} />
            Explain Selected Text
          </button>
        )}
      </form>
    </div>
  );
}
```

---

### 5️⃣ Claude API Service

```js
// src/services/claudeAPI.js
const API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;

export async function callClaude(userMessage, systemPrompt = '') {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

// Generate quiz questions
export async function generateQuiz(notes, numberOfQuestions = 10) {
  const prompt = `Generate ${numberOfQuestions} MCQ questions from these notes:
  
${notes}

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ]
}`;

  const response = await callClaude(prompt, 
    'You are a quiz generator. Return only valid JSON.');
  
  try {
    return JSON.parse(response);
  } catch (e) {
    console.error('Failed to parse quiz JSON:', e);
    return null;
  }
}

// Generate cheat sheet summary
export async function generateCheatSheet(notes) {
  const prompt = `Create a condensed one-page summary from these notes:

${notes}

Format as HTML that will be styled with Tailwind CSS. Include:
- Key formulas (in boxes)
- Main concepts (3-4 lines each)
- Pro tips (in red/orange boxes)
- Concept links

Return ONLY the HTML content, no markdown, no backticks.`;

  return await callClaude(prompt,
    'You are a study guide creator. Return clean HTML.');
}
```

---

### 6️⃣ Quiz Generator Component

```jsx
// src/components/QuizGenerator.jsx
import React, { useState } from 'react';
import { generateQuiz } from '../services/claudeAPI';
import { CheckCircle, XCircle } from 'lucide-react';

export default function QuizGenerator({ notes, onClose }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState({});
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quizData = await generateQuiz(notes, 10);
        setQuiz(quizData);
      } catch (error) {
        console.error('Quiz generation failed:', error);
        alert('Failed to generate quiz');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [notes, onClose]);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin">⏳</div> Generating quiz...
    </div>
  );

  if (!quiz) return null;

  const q = quiz.questions[currentQuestion];
  const isAnswered = currentQuestion in answered;
  const isCorrect = answered[currentQuestion] === q.correct;

  const handleAnswer = (optionIndex) => {
    setAnswered(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelected(null);
    }
  };

  const score = Object.entries(answered).filter(
    ([idx, ans]) => ans === quiz.questions[idx].correct
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Quiz</h2>
            <span className="text-sm">{currentQuestion + 1}/{quiz.questions.length}</span>
          </div>
          <div className="mt-3 bg-white bg-opacity-20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{q.question}</h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((option, idx) => {
              const isSelected = answered[currentQuestion] === idx;
              const showResult = isAnswered && !isCorrect;
              
              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && handleAnswer(idx)}
                  className={`w-full p-3 border-2 rounded-lg text-left transition ${
                    isSelected && isAnswered
                      ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      : isAnswered && idx === q.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{String.fromCharCode(65 + idx)})</span>
                    <span className="flex-1">{option}</span>
                    {isAnswered && (
                      idx === q.correct ? (
                        <CheckCircle className="text-green-600" />
                      ) : isSelected ? (
                        <XCircle className="text-red-600" />
                      ) : null
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-1">💡 Explanation:</p>
              <p className="text-sm text-blue-800">{q.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Close
            </button>
            
            {isAnswered ? (
              <button
                onClick={handleNext}
                disabled={currentQuestion === quiz.questions.length - 1}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            ) : (
              <p className="text-sm text-gray-500">Select an answer to continue</p>
            )}
          </div>

          {/* Final Score */}
          {currentQuestion === quiz.questions.length - 1 && isAnswered && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-indigo-600 mb-2">{score}/{quiz.questions.length}</p>
              <p className="text-gray-700">
                {score === quiz.questions.length ? '🎉 Perfect!' : 
                 score >= (quiz.questions.length * 0.7) ? '✨ Great!' : 
                 '📚 Keep learning!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 7️⃣ Cheat Sheet Generator

```jsx
// src/components/CheatSheetGenerator.jsx
import React, { useState } from 'react';
import { generateCheatSheet } from '../services/claudeAPI';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function CheatSheetGenerator({ notes, onClose }) {
  const [cheatSheet, setCheatSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadCheatSheet = async () => {
      try {
        const html = await generateCheatSheet(notes);
        setCheatSheet(html);
      } catch (error) {
        console.error('Cheat sheet generation failed:', error);
        alert('Failed to generate cheat sheet');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    loadCheatSheet();
  }, [notes, onClose]);

  const downloadPDF = () => {
    const element = document.getElementById('cheatsheet-content');
    const opt = {
      margin: 10,
      filename: 'notevault-cheatsheet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">📋 Cheat Sheet</h2>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin">⏳</div> Generating cheat sheet...
            </div>
          ) : (
            <div
              id="cheatsheet-content"
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: cheatSheet }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      animation: {
        'bounce': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
```

---

## 🚀 Deployment (Vercel - 2 clicks)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# REACT_APP_CLAUDE_API_KEY=your_key
```

---

## 📱 Testing Checklist

```
□ Upload PDF works
□ Upload Image works
□ OCR extracts text correctly
□ Chat responds to questions
□ Selected text highlights
□ "Explain This" button works
□ Quiz generates with valid JSON
□ Quiz scoring works
□ Cheat sheet HTML renders
□ PDF export works
□ Mobile responsive
□ No console errors
□ API key not exposed in client code
□ Handles large files gracefully
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Tesseract.js slow** | Use web workers, show progress bar |
| **PDF.js memory leak** | Cleanup after unmounting |
| **Claude API timeout** | Implement request timeout + retry |
| **OCR accuracy bad** | Preprocess image (contrast, deskew) |
| **Chat context too long** | Summarize notes before sending |
| **PDF export blank** | Wait for images to load first |
| **CORS issues** | Claude API should handle it; check key |

---

## 📈 Performance Tips

```
1. Lazy load components
   const QuizGenerator = React.lazy(() => import('...'));

2. Optimize images before OCR
   Compress, normalize lighting

3. Stream Claude responses
   Use streaming API for faster UX

4. Cache OCR results
   localStorage for extracted text

5. Debounce chat input
   Prevent rapid API calls
```

---

**Now you're ready to build! 🚀**

Good luck with your hackathon! 

Questions? Check Anthropic docs:
https://docs.anthropic.com/

