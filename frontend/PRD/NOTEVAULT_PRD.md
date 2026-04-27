# 📚 NoteVault - PRD (Product Requirements Document)

**Tagline:** "Your AI-Powered Study Companion That Learns From Your Notes"

**Target Audience:** College students, competitive exam aspirants (IIT/NEET), professionals upskilling

**Core Problem:** Students waste time switching between notes, ChatGPT, and study materials. No integrated workflow.

---

## 🎯 MVP Features (Hackathon Focus - 48-72 hours)

### Feature 1️⃣: Side-by-Side AI Chat & Editor (HIGH PRIORITY ⭐⭐⭐)

**Why This First?**
- Core differentiator (Notion + ChatGPT mashup)
- Judges dekhenge - "Ohh, design ache se hai!"
- Immediate demo-able

**What It Does:**
- Left Panel: Original note (PDF/Image) rendered with zoom control
- Right Panel: AI Chatbot with context awareness
- Seamless switching, no tab-switching needed

**Wow Factor:**
```
User Flow:
1. Upload PDF/Image → Auto-detects subject
2. AI reads the note context → Ready to answer questions
3. User selects any text → "Explain This" button pops up
4. AI instantly explains in right panel with examples
```

**Technical Stack:**
- Frontend: React + Tailwind CSS
- Split-screen: `react-split-pane` or CSS Grid
- PDF rendering: `pdfjs-dist` (client-side)
- AI Backend: Anthropic API (Claude) with file context

**Key Implementation:**
```jsx
// Pseudo-code structure
<div className="flex h-screen gap-4">
  {/* Left: Note Viewer */}
  <NoteViewer 
    file={uploadedFile}
    onSelectText={(text) => setSelectedText(text)}
  />
  
  {/* Right: Chat */}
  <ChatPanel 
    selectedText={selectedText}
    fileContext={fileContext}
    onHighlight={(text) => explainText(text)}
  />
</div>
```

---

### Feature 2️⃣: Automated Quiz Generator (HIGH PRIORITY ⭐⭐⭐)

**Why This Second?**
- Active Learning angle
- Easy to demo: "Upload notes → Quiz in 5 seconds"
- Judges love "one-click magic"

**What It Does:**
- AI reads notes → Generates MCQs, Short Answer, Conceptual questions
- Difficulty adaptable (Easy/Medium/Hard)
- Instant feedback with explanations

**Wow Factor - Live Demo Script:**
```
1. Scan handwritten notes with camera (blurry + messy)
2. AI extracts text + understands concepts
3. Click "Generate Quiz" 
4. 10 MCQs appear in 3 seconds
5. User solves → "You scored 8/10"
6. AI explains wrong answers
7. Judges go: "Yeh sahi hai!" ✨
```

**Technical Stack:**
- OCR: Tesseract.js (for handwritten notes)
- Quiz Generation: Claude API with structured output (JSON)
- Storage: LocalStorage (privacy angle - "Your data never leaves device")

**Quiz Types to Generate:**
- Multiple Choice (4 options)
- Fill in the blanks
- True/False with explanation
- Short answer with model solution

---

### Feature 3️⃣: Automated Cheat-Sheet Generator (MEDIUM PRIORITY ⭐⭐)

**Why Include This?**
- Visual, shareable output
- 1 page = printable masterpiece
- Students WILL love this

**What It Does:**
- AI condenses 10-page notes into 1-page summary
- Beautifully styled with Tailwind CSS
- Printable + downloadable as PDF

**Wow Factor - Visual Design:**
```
Cheat Sheet Structure:
┌─────────────────────────────────────────┐
│ TOPIC: Thermodynamics (One-Pager)       │
├─────────────────────────────────────────┤
│ 📌 Key Formulas (Highlighted in boxes)  │
│ • ΔG = ΔH - TΔS                         │
│ • Gibbs Free Energy determines...       │
│                                          │
│ 🎯 Core Concepts (3-line bullet)       │
│ • Entropy: measure of disorder          │
│                                          │
│ ⚡ Problem-Solving Tips (Red border)    │
│ • Always check units!                   │
│                                          │
│ 🔗 Concept Links (Colored tags)         │
│ [Entropy] → [Second Law] → [Direction]  │
└─────────────────────────────────────────┘
```

**Technical Stack:**
- HTML-to-PDF: `html2pdf.js` or `jsPDF`
- Design: Tailwind CSS (pre-made components for cheat sheets)
- Layout: CSS Grid (3 columns for dense info)

---

## 🚀 Extended Features (Post-Hackathon or If Time Permits)

### Feature 4️⃣: Concept Mapping & Visual Knowledge Graph (MEDIUM PRIORITY ⭐⭐)

**Why This?**
- Differentiator from other apps
- Visual learners love it
- "Mind Map" = instant credibility

**What It Does:**
- AI reads notes → Generates interactive mind map
- Shows relationships between concepts
- Clickable nodes = drill down for details

**Wow Factor:**
```
Mind Map Example:
         [Photosynthesis]
        /               \
    Light React.        Dark React.
    /    |    \         /    |    \
  H₂O  Chlor. Thyl.  Enzyme  CO₂  Glyc.
```

**Technical Stack:**
- Graph Library: `vis.js` or `cytoscape.js`
- Generation: Claude API (returns JSON structure)

---

### Feature 5️⃣: Collaborative "Group Brain" (OPTIONAL ⭐)

**Why This?**
- Network effect
- Crowdsourced notes = better study material
- "Master Study Guide" sounds premium

**What It Does:**
- Multiple students upload notes for same subject
- AI merges + deduplicates + creates "Master Guide"
- Gaps in one note filled by another

**Wow Factor:**
```
5 friends upload physics notes
→ AI identifies:
  - Student A covered "Kinematics" well
  - Student B has better "Optics" notes
  - Student C missed "Waves" section
→ Creates unified "Master Physics Guide"
→ Everyone gets better study material
```

**Technical Stack:**
- Backend: Node.js/Firebase (for student accounts + note sharing)
- Collaborative edit: CRDTs (Conflict-free Replicated Data Type)

---

### Feature 6️⃣: Gamified "Leveled" Quizzes (OPTIONAL ⭐)

**Why This?**
- Engagement = stickiness
- "Battle Mode" = viral potential
- Judges love gamification

**What It Does:**
- Quiz difficulty increases as user scores
- Leaderboard (optional)
- "Battle Mode": Two friends quiz each other using their notes

**Wow Factor:**
```
User starts Quiz:
Q1 (Easy): "What is photosynthesis?" → ✅ Correct
  
Auto-upgrade difficulty:
Q2 (Medium): "Why is Z-scheme necessary?" → ✅ Correct

Q3 (Hard): "Explain why oxygen evolves from PS-II..." → ❌ Wrong
  
Feedback: "Close! The key is PSI orientation..."
Auto-downgrade:
Q4 (Medium): Next question
```

**Technical Stack:**
- Difficulty Algorithm: ELO rating system (chess-inspired)
- Realtime multiplayer: WebSockets (Socket.io)

---

### Feature 7️⃣: Multi-Modal "Quick Glance" (OPTIONAL ⭐)

**Why This?**
- Passive learning during travel
- Audio = new use case
- "Podcast feature" = Instagram story material

**What It Does:**
- AI generates podcast-style summary (2-3 min)
- Text-to-speech with background music
- Downloadable audio file

**Wow Factor:**
```
User clicks "Listen Instead" 
→ AI script: "Yeh episode mein ham photosynthesis ke..."
→ Background music automatically added
→ User listens while commuting
→ "Studied during travel! 🎧"
```

**Technical Stack:**
- TTS: Google Cloud TTS or ElevenLabs
- Audio mixing: Tone.js
- Storage: AWS S3 (for audio files)

---

### Feature 8️⃣: Code-Execution Sandbox (OPTIONAL ⭐)

**Why This?**
- Niche audience but VERY engaged (engineering students)
- Judges: "Wow, technical depth!"
- Differentiation angle

**What It Does:**
- Detects code snippets in notes
- "Run" button executes inline
- No need to switch to IDE/terminal

**Wow Factor:**
```
Notes contain:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

User clicks "Run" button
→ Interactive output: "Enter n: 5"
→ Output: 5
```

**Technical Stack:**
- Sandboxed Execution: Docker container / Piston API
- Languages: Python, JavaScript, Java (start with 3)
- Security: Timeouts + memory limits

---

## 📊 Feature Priority Matrix (For Hackathon)

```
┌─────────────────────────────────────────┐
│  MUST-HAVE (MVP - 48 hours)             │
├─────────────────────────────────────────┤
│ ✅ Side-by-Side Chat & Editor           │
│ ✅ Automated Quiz Generator             │
│ ✅ Cheat-Sheet Generator                │
│ ✅ Highlight to Explain Feature         │
│ ✅ OCR for images/handwritten notes     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NICE-TO-HAVE (If Time Permits)         │
├─────────────────────────────────────────┤
│ ⭐ Concept Mapping / Knowledge Graph    │
│ ⭐ Gamified Quiz Levels                 │
│ ⭐ Audio Summaries                      │
│ ⭐ Collaborative Group Features         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  POST-HACKATHON (Future Roadmap)        │
├─────────────────────────────────────────┤
│ 🚀 Code Execution Sandbox               │
│ 🚀 Mobile App Native                    │
│ 🚀 Real-time Collaboration              │
│ 🚀 AI Tutoring Mode (Video)             │
└─────────────────────────────────────────┘
```

---

## 🎨 UI/UX Mockup (Text Version)

```
┌─────────────────────────────────────────────────────────────────┐
│  NoteVault                                  [Upload] [Settings]   │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                        │
│    [Note Preview]        │  💬 Chat with Your Notes             │
│                          │  ┌────────────────────────────────┐  │
│    📄 Physics.pdf        │  │ Hi! I'm your study buddy.      │  │
│    Page 1/10             │  │ Upload notes & ask away! 🎓    │  │
│                          │  └────────────────────────────────┘  │
│    [Image of formula]    │                                        │
│                          │  👤 You:                             │
│    📌 Text Selected:     │  What is photosynthesis?            │
│    "Photosynthesis is"   │                                        │
│                          │  🤖 NoteVault:                      │
│    [Explain This]        │  Photosynthesis is a biological      │
│                          │  process where plants convert light  │
│                          │  into chemical energy...             │
│                          │  [Show Diagram] [Ask Follow-up]     │
│                          │                                        │
│    [Quiz] [Cheatsheet]   │  ┌────────────────────────────────┐  │
│    [Mind Map]            │  │ You: [Type message...]        │  │
│                          │  └────────────────────────────────┘  │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 🔒 Privacy & Security

**Key Angle for Marketing:**
- "Your data never leaves your device" (for MVP)
- LocalStorage for uploaded files (encrypted optional)
- No cloud storage in first version = privacy advantage

**Privacy Commitments:**
- ✅ Notes stored locally (browser)
- ✅ No account creation required (optional)
- ✅ AI processing can be client-side (Claude API called but data isn't stored)
- ✅ Clear data deletion: "Delete all notes"

---

## 📈 Metrics to Track

```
User Engagement:
- Quiz completion rate
- Avg time spent in chat
- Cheat-sheet downloads
- Features used (heatmap)

Performance:
- Note upload time
- Quiz generation time
- Chat response latency
- OCR accuracy rate

Business Metrics (Post-hackathon):
- Daily active users
- Feature adoption rate
- Sharing rate (group brain)
- Conversion rate (if freemium model)
```

---

## 🎯 Hackathon Demo Script (5 Minutes)

**Setup:** Have pre-loaded messy physics notes screenshot ready

```
Demo Flow:

1. "Yeh dekho, student ke paas hain ek page jo bilkul gandi handwriting mein likha hai"
   [Show image of messy notes]

2. "NoteVault mein upload karte hain"
   [Upload → OCR processes → Shows extracted text]
   
3. "Ab left mein note hai, right mein AI chat"
   [Ask AI: "Explain entropy in simple terms"]
   [AI responds instantly with example]
   
4. "Ab ek click mein quiz generate karte hain"
   [Click "Generate Quiz" → 10 questions appear in 2 sec]
   
5. "User solve karta hai 8/10 score"
   [Show feedback for wrong answer]
   
6. "Ab dekho cheat sheet - pure 10 pages ek page mein"
   [Show beautiful one-pager with formulas, diagrams, tips]
   
7. "Students ka exam se 1 hour pehle goldmine hai yeh!"
   
Judges reaction: "Wow, design acha hai, features relevant hain, real use-case!"
```

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Next.js |
| PDF/Image | pdfjs-dist, Tesseract.js (OCR) |
| AI Backend | Claude API (Anthropic) |
| Chat | React Query, WebSockets (optional) |
| Quiz Logic | JSON parsing, ELO algorithm |
| PDF Export | html2pdf, jsPDF |
| Graphs | vis.js or cytoscape.js (optional) |
| Storage | LocalStorage (MVP) / Firebase (future) |
| Hosting | Vercel, Netlify |

---

## 📝 MVP Development Timeline (Hackathon)

```
Hour 0-6: Setup + Core UI
├─ React project setup
├─ Split-screen layout (HTML/CSS)
├─ PDF viewer integration

Hour 6-12: Note Processing
├─ File upload handler
├─ OCR implementation (Tesseract.js)
├─ Text extraction logic

Hour 12-24: AI Chat Integration
├─ Claude API connection
├─ Context-aware prompts
├─ Chat UI + streaming

Hour 24-36: Quiz Generator
├─ Quiz generation prompt engineering
├─ Quiz UI component
├─ Scoring + feedback logic

Hour 36-48: Cheat Sheet + Polish
├─ Cheat sheet template design
├─ PDF export
├─ Bug fixes + testing
├─ Final demo prep

Hour 48-72: Extended Features (If energy left)
├─ Mind Map generation
├─ Gamified quiz levels
├─ Audio summary (basic)
```

---

## 🚀 Post-Hackathon Roadmap

**Phase 1 (Month 1):**
- User authentication (Google/GitHub)
- Cloud storage (notes backup)
- Multiplayer quiz mode

**Phase 2 (Month 2):**
- Mobile app (React Native)
- Advanced mind maps
- Study schedule AI

**Phase 3 (Month 3):**
- Live tutoring mode (video + AI)
- Integration with textbooks
- Monetization (Premium: unlimited quizzes, custom tutors)

---

## 💡 Why This Works for Hackathon

| Criteria | NoteVault | Score |
|----------|-----------|-------|
| **Novelty** | Chat + Notes + Quiz combo | ⭐⭐⭐⭐⭐ |
| **Demo-ability** | Works in 5 min demo | ⭐⭐⭐⭐⭐ |
| **Real Problem** | Students actually need this | ⭐⭐⭐⭐⭐ |
| **Design Quality** | Clean, modern UI | ⭐⭐⭐⭐ |
| **Technical Depth** | OCR + API + PDF export | ⭐⭐⭐⭐⭐ |
| **Viability** | Easy monetization path | ⭐⭐⭐⭐ |
| **Scaling** | Works from 1 user → millions | ⭐⭐⭐⭐ |

---

## 🎓 Competitive Advantage

```
vs ChatGPT           → We have context from notes + visual split-screen
vs Notion            → We have AI + quiz generation + cheat sheets
vs Quizlet           → Automatic generation from notes + gamification
vs Evernote          → Active learning (quizzes) vs passive storage
vs YouTube tutors    → Personalized to student's notes + instant
```

---

**Last Updated:** Hackathon 2024  
**Status:** MVP Ready for Development  
**Owner:** Your Team

