// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const medicalForm = document.getElementById('medical-form');
const responseContainer = document.getElementById('response-container');
const responseContent = document.getElementById('response-content');
const newConsultationBtn = document.getElementById('new-consultation');

// Gemini API configuration
const API_KEY = "AIzaSyAe-UCCfPsaqXK9EalDK2NuscY6J9XtfSw";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

// Store the current image data URL
let currentImageDataUrl = null;

// Medical specialties for validation
const medicalSpecialties = ['جلدية', 'باطنة', 'عظام', 'أعصاب', 'قلب'];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    medicalForm.addEventListener('submit', handleFormSubmit);
    
    // New consultation button
    newConsultationBtn.addEventListener('click', resetForm);
    
    // Add input validation
    setupFormValidation();
    
    // Chat event listeners
    sendBtn.addEventListener('click', sendMessage);
    imageUpload.addEventListener('change', handleImageUpload);
    userInput.addEventListener('keypress', handleKeyPress);
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = medicalForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'جاري المعالجة...';
    submitBtn.disabled = true;
    
    try {
        // Get form data
        const formData = getFormData();
        
        // Prepare prompt for the AI
        const prompt = `أنت طبيب متخصص في الطب العام. يرجى تقديم استشارة طبية مفصلة بناءً على المعلومات التالية:

المعلومات الطبية:
- الوصف: ${formData.description}
- الجنس: ${formData.gender === 'male' ? 'ذكر' : 'أنثى'}
- العمر: ${formData.age} سنة
- الأمراض المزمنة: ${formData.chronicDiseases || 'لا يوجد'}

الرجاء تقديم إرشادات طبية تشمل:
1. التشخيص المحتمل (مع التأكيد على أن هذا تشخيص أولي)
2. النصائح الطبية المنزلية (إن وجدت)
3. الأدوية التي يمكن صرفها بدون وصفة طبية (إن أمكن)
4. متى يجب التوجه للطوارئ
5. النصائح الوقائية

الرجاء تقديم الإجابة بتنسيق منظم وسهل القراءة مع عناوين فرعية.`;

        // Send to Gemini API
        const response = await sendToGemini(prompt);
        
        // Display the AI's response
        displayResponse(response);
    } catch (error) {
        console.error('Error:', error);
        displayResponse('عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Get form data
function getFormData() {
    const formData = new FormData(medicalForm);
    
    return {
        description: formData.get('description'),
        questionType: formData.get('questionType'),
        gender: formData.get('gender'),
        age: formData.get('age'),
        chronicDiseases: formData.get('chronicDiseases')
    };
}

// Validate form
function validateForm() {
    const form = medicalForm;
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, 'هذا الحقل مطلوب');
            isValid = false;
        } else {
            removeError(field);
        }
    });
    
    // Validate age
    const ageField = form.querySelector('#age');
    if (ageField.value) {
        const age = parseInt(ageField.value);
        if (isNaN(age) || age < 1 || age > 120) {
            showError(ageField, 'الرجاء إدخال عمر صحيح بين 1 و 120');
            isValid = false;
        } else {
            removeError(ageField);
        }
    }
    
    return isValid;
}

// Show error message
function showError(field, message) {
    // Remove any existing error
    removeError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e53e3e';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.style.textAlign = 'right';
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Focus on the field
    field.focus();
}

// Remove error message
function removeError(field) {
    // Remove error class
    field.classList.remove('error');
    
    // Remove error message if it exists
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Set up form validation
function setupFormValidation() {
    // Validate on blur
    const inputs = medicalForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                showError(input, 'هذا الحقل مطلوب');
            } else if (input.id === 'age' && input.value) {
                const age = parseInt(input.value);
                if (isNaN(age) || age < 1 || age > 120) {
                    showError(input, 'الرجاء إدخال عمر صحيح بين 1 و 120');
                } else {
                    removeError(input);
                }
            } else {
                removeError(input);
            }
        });
    });
    
    // Prevent form submission on Enter key for textareas
    const textareas = medicalForm.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
            }
        });
    });
}

// Generate response based on form data (kept for backward compatibility)
function generateResponse(formData) {
    return "";
}

// Display response to the user
function displayResponse(response) {
    // Hide the form
    medicalForm.style.display = 'none';
    
    // Show the response container
    responseContainer.style.display = 'block';
    
    // Add custom CSS for markdown elements
    const markdownStyles = `
        <style>
            .response-content h1, .response-content h2, .response-content h3 {
                color: #2d3748;
                margin: 1.5em 0 0.8em 0;
                line-height: 1.3;
            }
            .response-content h1 { font-size: 1.5em; }
            .response-content h2 { font-size: 1.3em; }
            .response-content h3 { font-size: 1.1em; }
            .response-content p {
                margin: 1em 0;
                line-height: 1.6;
            }
            .response-content ul, .response-content ol {
                margin: 1em 0;
                padding-right: 1.5em;
            }
            .response-content li {
                margin-bottom: 0.5em;
            }
            .response-content strong, .response-content b {
                color: #2d3748;
                font-weight: 600;
            }
            .response-content em, .response-content i {
                font-style: italic;
            }
            .response-content code {
                background-color: #f0f2f5;
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: monospace;
                font-size: 0.9em;
            }
            .response-content pre {
                background-color: #f8f9fa;
                padding: 1em;
                border-radius: 6px;
                overflow-x: auto;
                margin: 1em 0;
            }
            .response-content blockquote {
                border-right: 4px solid #e2e8f0;
                margin: 1em 0;
                padding: 0.5em 1em;
                color: #4a5568;
                background-color: #f8fafc;
                border-radius: 0 4px 4px 0;
            }
        </style>
    `;
    
    // Convert markdown to HTML
    const markdownContent = marked.parse(response);
    
    // Add disclaimer
    const disclaimer = `
        <div class="disclaimer-box" style="
            font-size: 0.875rem; 
            color: #718096; 
            text-align: center; 
            padding: 12px; 
            background-color: #f8fafc; 
            border-radius: 8px; 
            margin-top: 30px;
            border-right: 3px solid #e2e8f0;
        ">
            <p style="margin: 0;">
                <i class="fas fa-exclamation-circle" style="color: #4a5568; margin-left: 5px;"></i>
                هذا المساعد الطبي مصمم للإرشاد العام فقط وليس بديلاً عن الاستشارة الطبية المتخصصة
            </p>
        </div>
    `;
    
    // Combine everything
    responseContent.innerHTML = markdownStyles + markdownContent + disclaimer;
    
    // Add syntax highlighting for code blocks
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
    
    // Scroll to the response
    responseContainer.scrollIntoView({ behavior: 'smooth' });


    const followUpBox = `
    <div id="follow-up-section" style="margin-top:20px; text-align:right;">
        <textarea id="follow-up-input" placeholder="اكتب سؤالك هنا..." style="
            width:100%; 
            height:70px; 
            border:1px solid #ccc; 
            border-radius:8px; 
            padding:10px;
            font-size:1rem;
            resize:none;
            direction:rtl;
        "></textarea>
        <button id="follow-up-send" style="
            margin-top:10px;
            background-color:#3182ce;
            color:white;
            border:none;
            padding:10px 20px;
            border-radius:6px;
            cursor:pointer;
        ">إرسال</button>
    </div>
`;
responseContent.insertAdjacentHTML('beforeend', followUpBox);

// إعداد المتغيرات
const followUpInput = document.getElementById('follow-up-input');
const followUpSend = document.getElementById('follow-up-send');

// لما المستخدم يضغط "إرسال"
followUpSend.addEventListener('click', async () => {
    const userMsg = followUpInput.value.trim();
    if (!userMsg) return;

    // عرض رسالة المستخدم
    const userDiv = document.createElement('div');
    userDiv.className = 'user-followup';
    userDiv.style.marginTop = '15px';
    userDiv.style.padding = '10px';
    userDiv.style.background = '#e2e8f0';
    userDiv.style.borderRadius = '8px';
    userDiv.style.textAlign = 'right';
    userDiv.textContent = userMsg;
    responseContent.appendChild(userDiv);

    followUpInput.value = '';

    // عرض مؤشر الكتابة
    const typingDiv = document.createElement('div');
    typingDiv.textContent = '... جاري الرد';
    typingDiv.style.color = '#718096';
    responseContent.appendChild(typingDiv);

    try {
        // إرسال للسيرفر (نفس دالة الـ AI اللي عندك)
        const aiResponse = await sendToGemini(userMsg);
        typingDiv.remove();

        // عرض رد الـ AI
        const aiDiv = document.createElement('div');
        aiDiv.className = 'bot-followup';
        aiDiv.style.marginTop = '10px';
        aiDiv.style.padding = '10px';
        aiDiv.style.background = '#f8fafc';
        aiDiv.style.borderRadius = '8px';
        aiDiv.style.direction = 'rtl';
        aiDiv.innerHTML = marked.parse(aiResponse);
        responseContent.appendChild(aiDiv);

        responseContainer.scrollTop = responseContainer.scrollHeight;
    } catch (err) {
        typingDiv.textContent = 'حدث خطأ أثناء الاتصال. حاول مرة أخرى.';
    }
});
}

// Reset the form for a new consultation
function resetForm() {
    // Reset the form
    medicalForm.reset();
    
    // Show the form
    medicalForm.style.display = 'block';
    
    // Hide the response container
    responseContainer.style.display = 'none';
    
    // Scroll to the top of the form
    medicalForm.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on the first field
    const firstField = medicalForm.querySelector('input, select, textarea');
    if (firstField) {
        firstField.focus();
    }
}

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #e53e3e !important;
    }
    
    .error:focus {
        box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2) !important;
    }
`;
document.head.appendChild(style);

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageDataUrl = e.target.result;
        
        // Display image preview
        imagePreview.innerHTML = `
            <img src="${currentImageDataUrl}" alt="Preview">
            <button onclick="clearImage()" class="clear-image-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to the clear button
        const clearBtn = imagePreview.querySelector('.clear-image-btn');
        clearBtn.addEventListener('click', clearImage);
    };
    reader.readAsDataURL(file);
}

// Clear the selected image
function clearImage() {
    currentImageDataUrl = null;
    imagePreview.innerHTML = '';
    imageUpload.value = '';
}

// Add a message to the chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (typeof content === 'string') {
        contentDiv.textContent = content;
    } else if (content instanceof Element) {
        contentDiv.appendChild(content);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'typing-indicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.appendChild(typingDiv);
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
        typingElement.remove();
    }
}

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Send message to Gemini API with retry logic
async function sendToGemini(prompt, imageDataUrl = null, retryCount = 0) {
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000; // 1 second
    
    const url = `${API_URL}?key=${API_KEY}`;
    
    // Prepare the request body with the new format
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: []
            }
        ]
    };
    
    // Add text prompt
    if (prompt) {
        requestBody.contents[0].parts.push({
            text: prompt
        });
    }
    
    // Add image if available
    if (imageDataUrl) {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Image = imageDataUrl.split(',')[1];
        
        requestBody.contents[0].parts.push({
            inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
            }
        });
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        // Check for rate limiting or server errors
        if (!response.ok) {
            const errorMessage = data.error?.message || 'Failed to get response from Gemini API';
            
            // If rate limited or server error, retry with exponential backoff
            if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
                const delayMs = INITIAL_DELAY * Math.pow(2, retryCount);
                console.log(`Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                await delay(delayMs);
                return sendToGemini(prompt, imageDataUrl, retryCount + 1);
            }
            
            throw new Error(errorMessage);
        }
        
        // Return the response text or a default message
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 
               "I'm sorry, I couldn't process your request.";
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // If we have retries left and it's a network error, retry
        if (retryCount < MAX_RETRIES && error.name === 'TypeError') {
            const delayMs = INITIAL_DELAY * Math.pow(2, retryCount);
            console.log(`Network error, retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(delayMs);
            return sendToGemini(prompt, imageDataUrl, retryCount + 1);
        }
        
        return `Error: ${error.message || 'Failed to get response from the AI service. Please try again later.'}`;
    }
}

// Handle sending a message
async function sendMessage() {
    const message = userInput.value.trim();
    const hasImage = currentImageDataUrl !== null;
    
    if (!message && !hasImage) return;
    
    // Add user message to chat
    if (message) {
        addMessage(message, true);
    }
    
    // Add image preview to chat if present
    if (hasImage) {
        const img = document.createElement('img');
        img.src = currentImageDataUrl;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.borderRadius = '0.5rem';
        img.style.margin = '0.5rem 0';
        
        const imgContainer = document.createElement('div');
        imgContainer.appendChild(img);
        
        addMessage(imgContainer, true);
    }
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    const typingElement = showTypingIndicator();
    
    try {
        // Send to Gemini API
        const response = await sendToGemini(message, currentImageDataUrl);
        
        // Clear image after successful API call
        clearImage();
        
        // Remove typing indicator
        removeTypingIndicator(typingElement);
        
        // Add bot response
        addMessage(response, false);
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator(typingElement);
        
        // Show error message
        addMessage(`Sorry, I encountered an error: ${error.message}`, false);
    }
}

// Clear image function for global access
window.clearImage = clearImage;
















// حركة إخفاء الناف بار أثناء التمرير
  let lastScrollTop = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 🟢 اخفاء الناف بار عند النزول
    if (currentScroll > lastScrollTop && currentScroll > 100) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    // 🟦 تغيير لون الخلفية بعد التمرير البسيط
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

