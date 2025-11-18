// API Configuration
const API_KEY = "AIzaSyCzPROI_jnS8pxYDLYqyNRkPFplWpCs2sw";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// Rate limiting variables
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 2000; // 2 seconds
let isProcessing = false;

// Function to call Gemini API with rate limiting + auto retry
async function generateResponse(userPrompt) {
  try {
    // Prevent double requests
    if (isProcessing) {
      return 'الرجاء الانتظار قليلاً قبل إرسال رسالة أخرى...';
    }

    // Rate limit
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      const wait = Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000);
      return `الرجاء الانتظار ${wait} ثانية قبل إرسال رسالة أخرى...`;
    }

    isProcessing = true;
    lastRequestTime = now;

    if (!userPrompt.trim()) {
      isProcessing = false;
      return 'عذراً، يرجى إدخال رسالة صالحة.';
    }

    // Loading indicator
    const chatBody = document.getElementById('chatBody');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'message bot loading';
    loadingIndicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    chatBody.appendChild(loadingIndicator);

    // Request body for Gemini
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    };

    // Fetch API with auto retry on overload
    let response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // Retry if model overloaded (503)
    if (response.status === 503) {
      console.warn("Model overloaded. Retrying...");
      await new Promise((res) => setTimeout(res, 1500));
      response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
    }

    // Remove loading indicator
    loadingIndicator.remove();

    // Response error
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);

      isProcessing = false;

      const errorMessage = document.createElement('div');
      errorMessage.className = 'message bot error-message';
      errorMessage.innerHTML = `
        <p>عذراً، حدث خطأ في الاتصال بالخادم.</p>
        <p>${errorData.error?.message || 'يرجى المحاولة لاحقاً'}</p>
      `;
      chatBody.appendChild(errorMessage);

      return 'حدث خطأ أثناء تنفيذ الطلب.';
    }

    // Success
    const data = await response.json();
    console.log("API Response:", data);

    let responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.text ||
      data.text ||
      "عذراً، لم أتمكن من فهم طلبك.";

    isProcessing = false;
    return responseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    isProcessing = false;
    return "عذراً، حدث خطأ أثناء معالجة طلبك.";
  }
}

// Add message to chat with markdown support
function addMessageToChat(text, sender = 'bot') {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  
  // Convert markdown to HTML using marked
  try {
    // First, clean up common markdown artifacts
    let cleanText = text
      .replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '**$1**')  // Convert ****bold**** to **bold**
      .replace(/###\s*/g, '### ')  // Ensure proper spacing after ###
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')  // Clean up bold markers
      .replace(/\*([^*]+)\*/g, '*$1*');  // Clean up italic markers
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(cleanText);
    msg.innerHTML = htmlContent;
  } catch (e) {
    console.error('Error parsing markdown:', e);
    // Fallback to plain text if markdown parsing fails
    msg.innerHTML = `<p>${text}</p>`;
  }

  // Add to chat and scroll to bottom
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
  const chatBody = document.getElementById('chatBody');

  const indicator = document.createElement('div');
  indicator.className = 'message bot typing-indicator';
  indicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';

  chatBody.appendChild(indicator);
  chatBody.scrollTop = chatBody.scrollHeight;

  return indicator;
}

// Send message handler
async function handleSendMessage() {
  const userInput = document.getElementById('userInput');
  const text = userInput.value.trim();
  if (!text) return;

  addMessageToChat(text, 'user');
  userInput.value = '';

  const typingIndicator = showTypingIndicator();

  const response = await generateResponse(text);

  typingIndicator.remove();

  addMessageToChat(response, 'bot');
}

// Initialize chat
function initChat() {
  const sendBtn = document.getElementById('sendBtn');
  const userInput = document.getElementById('userInput');

  sendBtn.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
}

document.addEventListener('DOMContentLoaded', initChat);
