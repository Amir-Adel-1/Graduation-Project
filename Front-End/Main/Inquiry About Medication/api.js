// API Configuration
const API_KEY = "AIzaSyCzPROI_jnS8pxYDLYqyNRkPFplWpCs2sw";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// DOM Elements
const drugInput = document.getElementById('drugInput');
const drugSendBtn = document.getElementById('drugSendBtn');
const attachDrugBtn = document.getElementById('attachDrugBtn');
const drugFileInput = document.getElementById('drugFileInput');
const drugResult = document.getElementById('drugResult');

// State
let isProcessing = false;
let currentRequestType = null; // 'text' or 'image'

// Initialize the application
function init() {
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Removed duplicate event listeners to prevent conflicts
    // All event handling is now in Inquiry About Medication.js
    return;
}

// Handle send button click
async function handleSendClick() {
    const text = drugInput.value.trim();
    
    if (isProcessing) return;
    
    if (text) {
        currentRequestType = 'text';
        await processMedicationRequest(text);
    } else if (currentRequestType === 'image') {
        // Already processing an image
        return;
    } else {
        // No text and no image selected
        showMessage('الرجاء إدخال اسم الدواء أو رفع صورة', 'error');
    }
}

// Handle file selection
async function handleFileSelect(event) {
    if (isProcessing) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        showMessage('الرجاء رفع صورة صالحة', 'error');
        return;
    }
    
    currentRequestType = 'image';
    updateUIForProcessing(true);
    
    try {
        // Read the image file
        const base64Image = await readFileAsBase64(file);
        await processMedicationRequest(null, base64Image);
    } catch (error) {
        console.error('Error processing image:', error);
        showMessage('حدث خطأ أثناء معالجة الصورة', 'error');
        resetForm();
    }
}

// Process medication request (text or image)
async function processMedicationRequest(text = null, imageBase64 = null) {
    if (isProcessing) return;
    
    isProcessing = true;
    updateUIForProcessing(true);
    
    try {
        let response;
        
        if (text) {
            // Process text input
            response = await getMedicationInfo(text);
        } else if (imageBase64) {
            // Process image input
            // First, we need to extract text from the image using OCR
            const extractedText = await extractTextFromImage(imageBase64);
            if (!extractedText) {
                throw new Error('لم نتمكن من قراءة النص من الصورة');
            }
            response = await getMedicationInfo(extractedText);
        } else {
            throw new Error('لا يوجد إدخال صالح');
        }
        
        // Display the response
        displayMedicationInfo(response);
        updateUIForProcessing(false, true);
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'حدث خطأ أثناء معالجة طلبك', 'error');
        resetForm();
    } finally {
        isProcessing = false;
    }
}

// Get medication information from Gemini API
async function getMedicationInfo(query) {
    try {
        const prompt = `
        ابحث عن المعلومات الطبية للدواء: "${query}"
        
        أجب دائمًا بنفس التنسيق التالي بالضبط:
        
        <div class="medication-info">
            <strong>الاسم التجاري:</strong> [الاسم التجاري]
            <strong>الاسم العلمي:</strong> [الاسم العلمي]
            <strong>الاستخدامات:</strong> [الاستخدامات الطبية]
            <strong>الجرعة:</strong> [الجرعات الموصى بها]
            <strong>الآثار الجانبية:</strong> [الآثار الجانبية الشائعة]
            <strong>التحذيرات:</strong> [التحذيرات الهامة]
            <strong>التفاعلات الدوائية:</strong> [التفاعلات المهمة]
        </div>
        
        ملاحظات مهمة:
        1. لا تكرر اسم الدواء في البداية
        2. لا تستخدم علامات الماركداون مثل ** أو ##
        3. أجب بالعربية الفصحى فقط
        `;
        
        // If this is an image analysis request, use the vision model
        if (query === 'صورة دواء') {
            const extractedText = await extractTextFromImage(query);
            return getMedicationInfo(extractedText || 'دواء');
        }
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'فشل في الحصول على معلومات الدواء');
        }
        
        const data = await response.json();
        let result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم العثور على معلومات لهذا الدواء';
        
        // Clean up any remaining markdown
        result = result
            .replace(/\*\*/g, '')  // Remove **
            .replace(/##/g, '')     // Remove ##
            .replace(/\n\n/g, '<br><br>') // Ensure proper line breaks
            .replace(/\n/g, '<br>');
            
        return result;
    } catch (error) {
        console.error('Error getting medication info:', error);
        return 'عذراً، حدث خطأ أثناء البحث عن معلومات الدواء. يرجى المحاولة مرة أخرى.';
    }
}

// Extract text from image using Gemini's vision capabilities
async function extractTextFromImage(base64Image) {
    try {
        // Ensure we have valid base64 data
        let imageData = base64Image;
        if (typeof base64Image === 'string' && base64Image.startsWith('data:')) {
            // Extract just the base64 part if it's a data URL
            imageData = base64Image.split(',')[1];
        }

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "اقرأ النص الموجود في صورة الدواء. أعد كتابة أسماء الأدوية أو المكونات النشطة فقط، من فضلك لا تقدم أي تفسيرات أو نصوص إضافية." },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageData
                            }
                        }
                    ]
                }]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error('فشل في قراءة النص من الصورة');
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        let extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (!extractedText) {
            throw new Error('لم يتم العثور على نص في الصورة');
        }
        
        // Clean up the extracted text
        extractedText = extractedText
            .replace(/^['"\s]+|['"\s]+$/g, '') // Remove surrounding quotes and whitespace
            .replace(/\n/g, ' ')                 // Replace newlines with spaces
            .replace(/\s+/g, ' ')                // Collapse multiple spaces
            .trim();
            
        if (!extractedText) {
            throw new Error('النص المستخرج فارغ');
        }
            
        return extractedText;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('فشل في معالجة الصورة: ' + (error.message || 'حدث خطأ غير معروف'));
    }
}

// Display medication information in the result area
function displayMedicationInfo(info) {
    if (!info) return;
    
    // Check if the response indicates it's not a medication
    if (info.includes('هذا ليس دواءً معروفًا') || info.includes('ليس دواء')) {
        showMessage('هذا ليس دواءً معروفًا. يرجى التحقق من الاسم والمحاولة مرة أخرى.', 'error');
        return;
    }
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(info);
    
    // Display the result
    drugResult.innerHTML = `
        <div class="medication-info">
            <div class="medication-content">${htmlContent}</div>
        </div>
    `;
}

// Show a message to the user
function showMessage(message, type = 'info') {
    drugResult.innerHTML = `
        <div class="message ${type}">
            <p>${message}</p>
        </div>
    `;
}

// Update UI based on processing state
function updateUIForProcessing(isProcessing, isComplete = false) {
    if (isProcessing) {
        drugSendBtn.disabled = true;
        drugInput.disabled = true;
        attachDrugBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        drugResult.innerHTML = '<div class="loading">جاري البحث عن معلومات الدواء...</div>';
    } else if (isComplete) {
        // Processing complete, show retry button
        attachDrugBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        attachDrugBtn.title = 'إعادة المحاولة';
        drugInput.value = '';
        drugInput.placeholder = 'يمكنك البحث عن دواء آخر...';
        drugSendBtn.disabled = false;
        drugInput.disabled = false;
    } else {
        // Reset to initial state
        resetForm();
    }
}

// Reset the form to its initial state
function resetForm() {
    drugInput.value = '';
    drugInput.placeholder = '💊 اكتب اسم الدواء هنا...';
    drugFileInput.value = '';
    attachDrugBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    attachDrugBtn.title = 'إضافة مرفق';
    drugSendBtn.disabled = false;
    drugInput.disabled = false;
    currentRequestType = null;
    isProcessing = false;
    
    // Reset the file input to allow selecting the same file again
    drugFileInput.type = '';
    drugFileInput.type = 'file';
}

// Helper function to read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);







// ==========================================================
// 📌  الجزء الثالث: نظام الدردشة مع typewriter effect
// ==========================================================

// Simple markdown parser for typewriter effect
function parseMarkdown(text) {
  if (!text) return '';
  
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
          const chatBody = document.getElementById('drugChatBody');
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
    const chatBody = document.getElementById('drugChatBody');
    if (!chatBody) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const messageContent = document.createElement('p');
    messageDiv.appendChild(messageContent);
    
    chatBody.appendChild(messageDiv);
    
    if (sender === 'bot') {
      await typeWriter(messageContent, text);
    } else {
      if (text.includes('<img')) {
        messageContent.innerHTML = text;
      } else {
        messageContent.textContent = text;
      }
    }
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Lock chat UI and show retry button
function lockChatUI() {
  const sendBtn = document.getElementById('drugSendBtn');
  const userInput = document.getElementById('drugInput');
  const attachBtn = document.getElementById('attachDrugBtn');
  
  // Lock input and attach button
  userInput.disabled = true;
  attachBtn.disabled = true;
  userInput.style.opacity = '0.5';
  attachBtn.style.opacity = '0.5';
  
  // Change send button to retry icon and make it look clickable
  sendBtn.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i>';
  sendBtn.classList.add('retry-btn');
  sendBtn.style.opacity = '1'; // Reset opacity
  sendBtn.style.cursor = 'pointer'; // Make cursor look clickable
  
  // Set up retry functionality to simply reload the page
  sendBtn.onclick = function() {
    window.location.reload();
  };
}

// Lock chat UI immediately after user sends message
function lockChatUIImmediate() {
  const sendBtn = document.getElementById('drugSendBtn');
  const userInput = document.getElementById('drugInput');
  const attachBtn = document.getElementById('attachDrugBtn');
  
  // Lock input and attach button immediately
  userInput.disabled = true;
  attachBtn.disabled = true;
  userInput.style.opacity = '0.5';
  attachBtn.style.opacity = '0.5';
  
  // Change send button to loading state (keep send icon but don't disable)
  sendBtn.style.opacity = '0.7';
  sendBtn.style.cursor = 'not-allowed';
  // Temporarily change onclick to prevent clicks during processing
  sendBtn.onclick = null;
}

// Start a new chat session
function startNewChat() {
  const chatBody = document.getElementById('drugChatBody');
  const sendBtn = document.getElementById('drugSendBtn');
  const userInput = document.getElementById('drugInput');
  const attachBtn = document.getElementById('attachDrugBtn');
  
  // Clear chat
  chatBody.innerHTML = '';
  
  // Unlock UI
  userInput.disabled = false;
  attachBtn.disabled = false;
  userInput.style.opacity = '1';
  attachBtn.style.opacity = '1';
  
  // Reset send button to original send icon
  sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  sendBtn.classList.remove('retry-btn');
  sendBtn.onclick = handleSendMessage;
  
  // Focus input
  userInput.focus();
}

// Typing indicator
function showTypingIndicator() {
    const chatBody = document.getElementById('drugChatBody');
  
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  
    chatBody.appendChild(indicator);
    chatBody.scrollTop = chatBody.scrollHeight;
  
    return indicator;
  }
  
  // Generate AI response - this is now just a wrapper for the API call
  async function generateResponse(userPrompt) {
    try {
      // Delegate to the API function
      return await getMedicationInfo(userPrompt);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.';
    }
  }
  
  // Send message handler
async function handleSendMessage() {
  const userInput = document.getElementById('drugInput');
  const message = userInput.value.trim();
  
  if (message === '') return;
  
  // Lock UI immediately after sending
  lockChatUIImmediate();
  
  // Add user message to chat
  await addMessageToChat(message, 'user');
  
  // Clear input
  userInput.value = '';
  
  // Show typing indicator
  const typingIndicator = showTypingIndicator();
  
  try {
    // Generate and display AI response
    const response = await generateResponse(message);
    typingIndicator.remove();
    await addMessageToChat(response, 'bot');
    // Change to retry button after AI response
    lockChatUI();
  } catch (error) {
    typingIndicator.remove();
    await addMessageToChat('عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.', 'bot');
    // Change to retry button even on error
    lockChatUI();
  }
}

// Global flag to prevent multiple file dialogs
let isProcessingFile = false;

// File input change handler
async function handleFileChange(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  if (!file) return;
  
  // Lock UI immediately after file selection
  lockChatUIImmediate();
  
  try {
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size + ' bytes');
    
    // 1️⃣ Show the image in the chat first
    const imageUrl = URL.createObjectURL(file);
    const imageMessage = `<img src="${imageUrl}" style="max-width: 200px; border-radius: 10px; margin: 10px 0; display: block;">`;
    await addMessageToChat(imageMessage, 'user');
    
    // 2️⃣ After adding the image → Show loading indicator
    const typingIndicator = showTypingIndicator();
    
    try {
      // Read the file as Base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('File successfully read as base64, length:', reader.result.length);
          resolve(reader.result);
        };
        reader.onerror = error => {
          console.error('Error reading file:', error);
          reject(new Error('فشل في قراءة ملف الصورة'));
        };
        reader.readAsDataURL(file);
      });
      
      console.log('Extracting text from image...');
      // Extract text from image using OCR
      const extractedText = await extractTextFromImage(base64Image);
      console.log('Extracted text:', extractedText);
      
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('لم يتم العثور على نص في الصورة');
      }
      
      console.log('Getting medication info for:', extractedText);
      // Get medication information based on the extracted text
      const medicationInfo = await getMedicationInfo(extractedText);
      
      // Remove loading indicator
      typingIndicator.remove();
      
      // Show AI response
      await addMessageToChat(medicationInfo, 'bot');
      // Change to retry button after AI response
      lockChatUI();
      
    } catch (error) {
      console.error('Error in image processing:', error);
      typingIndicator.remove();
      await addMessageToChat(`عذراً، ${error.message || 'حدث خطأ أثناء معالجة الصورة'}.`, 'bot');
      // Change to retry button even on error
      lockChatUI();
    }
    
  } catch (error) {
    await addMessageToChat('حدث خطأ غير متوقع.', 'bot');
    // Change to retry button even on error
    lockChatUI();
  } finally {
    const fileInput = document.getElementById('drugFileInput');
    fileInput.value = '';
    isProcessingFile = false;
  }
}

// Initialize chat
function initChat() {
  const sendBtn = document.getElementById('drugSendBtn');
  const userInput = document.getElementById('drugInput');
  const attachBtn = document.getElementById('attachDrugBtn');
  const fileInput = document.getElementById('drugFileInput');
  
  // Remove any existing event listeners to prevent duplicates
  const newSendBtn = sendBtn.cloneNode(true);
  const newAttachBtn = attachBtn.cloneNode(true);
  const newFileInput = fileInput.cloneNode(true);
  
  // Replace elements to remove all event listeners
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  attachBtn.parentNode.replaceChild(newAttachBtn, attachBtn);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);
  
  // Update references to the new elements
  const updatedSendBtn = document.getElementById('drugSendBtn');
  const updatedAttachBtn = document.getElementById('attachDrugBtn');
  const updatedFileInput = document.getElementById('drugFileInput');
  
  // Set up event listeners
  updatedSendBtn.addEventListener('click', handleSendMessage);
  
  // File upload button click handler
  updatedAttachBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isProcessingFile) {
      isProcessingFile = true;
      updatedFileInput.click();
    }
  });
  
  // File input change event
  updatedFileInput.addEventListener('change', handleFileChange);
  
  // Handle Enter key in input
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });
}

// Start the chat system
initChat();