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
    // Send button click handler
    drugSendBtn.addEventListener('click', handleSendClick);
    
    // Enter key in input field
    drugInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    });
    
    // File input change handler
    drugFileInput.addEventListener('change', handleFileSelect);
    
    // Attach button click handler
    attachDrugBtn.addEventListener('click', () => {
        if (currentRequestType === null) {
            // First click - open file dialog
            drugFileInput.click();
        } else {
            // Subsequent clicks - reset the form
            resetForm();
        }
    });
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
        
        إذا كان دواءً معروفًا، أجب بتنسيق Markdown كالتالي:
        # ${query}
        
         **الاسم التجاري:** [الاسم التجاري]
        **الاسم العلمي:** [الاسم العلمي]
        **الاستخدامات:** [الاستخدامات الطبية]
        **الجرعة:** [الجرعات الموصى بها]
        **الآثار الجانبية:** [الآثار الجانبية الشائعة]
        **التحذيرات:** [التحذيرات الهامة]
        **التفاعلات الدوائية:** [التفاعلات المهمة]

        ملاحظة: لا تقدم أي نص آخر غير المعلومات المطلوبة.
        `;
        
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
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم العثور على معلومات لهذا الدواء';
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('حدث خطأ أثناء الاتصال بخدمة معلومات الأدوية');
    }
}

// Extract text from image using Gemini's vision capabilities
async function extractTextFromImage(base64Image) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "ما هو النص الموجود في هذه الصورة؟ أعد كتابة النص فقط." },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64Image.split(',')[1] // Remove the data URL prefix
                            }
                        }
                    ]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error('فشل في قراءة النص من الصورة');
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('فشل في معالجة الصورة');
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