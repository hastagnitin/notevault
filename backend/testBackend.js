const axios = require('axios');

async function testEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  let successCount = 0;
  let totalTests = 6;
  let noteId = null;

  console.log("=== NoteVault Full Integration Test ===");

  try {
    console.log(`\n▶ 0. Testing POST /upload/camera (Creating test note)...`);
    const uploadRes = await axios.post(`${baseURL}/upload/camera`, {
      title: "Backend Test Note",
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH..."
    });
    
    if (uploadRes.data.success && uploadRes.data.note?.id) {
       noteId = uploadRes.data.note.id;
       console.log(`[+] Created NoteID: ${noteId}`);
       successCount++;
    } else {
       console.log(`[!] Upload failed. Aborting.`);
       return;
    }
  } catch (e) {
    console.log(`[!] Failed /upload/camera: ${e.message}`);
    return;
  }

  try {
    // 1. Chat Ask
    console.log(`\n▶ 1. Testing POST /chat/ask...`);
    const chatRes = await axios.post(`${baseURL}/chat/ask`, {
      noteId: noteId,
      question: "Summarize this note in 1 sentence."
    });
    console.log(`[+] Status: ${chatRes.status} | Success: ${chatRes.data.success}`);
    if (chatRes.data.success) {
      console.log(`    Response: ${chatRes.data.answer?.substring(0, 50)}...`);
      successCount++;
    }
  } catch (e) {
    console.log(`[!] Failed /chat/ask: ${e.message}`);
  }

  try {
    // 2. Explain
    console.log(`\n▶ 2. Testing POST /explain...`);
    const explainRes = await axios.post(`${baseURL}/explain`, {
      noteId: noteId,
      selectedText: "Camera capture"
    });
    console.log(`[+] Status: ${explainRes.status} | Success: ${explainRes.data.success}`);
    if (explainRes.data.success) successCount++;
  } catch (e) {
    console.log(`[!] Failed /explain: ${e.message}`);
  }

  try {
    console.log(`\n▶ 3. Testing Complex Generators (Quiz, Cheatsheet, Graph)...`);
    const [quizRes, sheetRes, graphRes] = await Promise.allSettled([
      axios.post(`${baseURL}/quiz/generate`, { noteId: noteId, questionCount: 2 }),
      axios.post(`${baseURL}/cheatsheet/generate`, { noteId: noteId }),
      axios.post(`${baseURL}/graph/generate`, { noteId: noteId })
    ]);

    if (quizRes.status === 'fulfilled' && quizRes.value.data.success) {
      console.log(`[+] Quiz Generator: SUCCESS (${quizRes.value.data.questions?.length} questions)`);
      successCount++;
    } else {
      console.log(`[!] Quiz Failed.`);
    }

    if (sheetRes.status === 'fulfilled' && sheetRes.value.data.success) {
      console.log(`[+] Cheatsheet Generator: SUCCESS (content length: ${sheetRes.value.data.cheatsheet?.length})`);
      successCount++;
    } else {
       console.log(`[!] Cheatsheet Failed.`);
    }
    
    if (graphRes.status === 'fulfilled' && graphRes.value.data.success) {
       console.log(`[+] Graph Generator: SUCCESS (${graphRes.value.data.graph?.nodes?.length || 0} nodes)`);
       successCount++;
    } else {
       console.log(`[!] Graph Failed.`);
    }
  } catch(e) {
     console.log("Error during parallel generation: ", e);
  }

  console.log(`\n=== Test Complete: ${successCount}/${totalTests} Passed ===\n`);
}

testEndpoints();
