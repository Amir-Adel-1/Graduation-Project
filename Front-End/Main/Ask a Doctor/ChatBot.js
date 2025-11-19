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

// Simple markdown parser for typewriter effect
function parseMarkdown(text) {
  return text
    // Headers (###)
    .replace(/### (.*)/g, '<h3>$1</h3>')
    // Bold (***text*** or **text**)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic (*text*)
    .replace(/\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

// Typewriter effect for AI responses with markdown support
function typeWriter(element, text, speed = 8) {
  return new Promise((resolve) => {
    // Parse markdown first
    const parsedText = parseMarkdown(text);
    let i = 0;
    element.innerHTML = '';
    
    function type() {
      if (i < parsedText.length) {
        // Add characters one by one
        element.innerHTML = parsedText.substring(0, i + 1);
        i++;
        
        // Scroll to bottom as new content appears
        const chatBody = document.getElementById('chatBody');
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Vary the speed slightly for more natural effect
        const delay = speed + (Math.random() * 10 - 5);
        setTimeout(type, delay);
      } else {
        // Mark as complete to hide cursor
        element.classList.add('typing-complete');
        resolve();
      }
    }
    
    type();
  });
}

// Add message to chat with typewriter effect for bot messages
async function addMessageToChat(text, sender = 'bot') {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  
  const messageContent = document.createElement('p');
  messageDiv.appendChild(messageContent);
  chatBody.appendChild(messageDiv);

  if (sender === 'bot') {
    // Apply typewriter effect for bot messages
    await typeWriter(messageContent, text);
  } else {
    // User messages appear instantly
    messageContent.textContent = text;
  }

  // Scroll to bottom after message is complete
  chatBody.scrollTop = chatBody.scrollHeight;
  
  // Save to chat history
  saveMessage(text, sender);
}

// Save message to localStorage (optional - for chat history)
function saveMessage(text, sender) {
  // This is a placeholder - you can implement localStorage saving here if needed
  // For now, we'll just log it
  console.log(`Message saved: ${sender}: ${text}`);
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

  await addMessageToChat(text, 'user');
  userInput.value = '';

  const typingIndicator = showTypingIndicator();

  const response = await generateResponse(text);

  typingIndicator.remove();

  await addMessageToChat(response, 'bot');
}

// Initialize chat
async function initChat() {
  const sendBtn = document.getElementById('sendBtn');
  const userInput = document.getElementById('userInput');

  sendBtn.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
  
  // Add initial welcome message with typewriter effect
  const chatBody = document.getElementById('chatBody');
  if (chatBody && chatBody.children.length === 0) {
    await addMessageToChat('مرحباً! أنا مساعدك الطبي. كيف يمكنني مساعدتك اليوم؟', 'bot');
  }
}

document.addEventListener('DOMContentLoaded', initChat);
