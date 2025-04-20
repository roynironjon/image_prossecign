// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('document-upload');
    const textInput = document.getElementById('text-input');
    const convertBtn = document.getElementById('convert-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultSection = document.getElementById('result-section');
    const originalTextDiv = document.getElementById('original-text');
    const translatedTextDiv = document.getElementById('translated-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    const loadingMessage = document.getElementById('loading-message');
    const progressBar = document.getElementById('conversion-progress');
    const targetLanguage = document.getElementById('target-language');

    // Supported languages
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'bn', name: 'Bengali' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ru', name: 'Russian' }
    ];

    // Populate source language dropdown
    const sourceLanguage = document.getElementById('source-language');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        sourceLanguage.appendChild(option);
    });

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('drag-over');
    }

    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Handle file processing
    function handleFiles(files) {
        if (!files.length) return;
        
        const file = files[0];
        if (!isSupportedFile(file)) {
            showAlert('Unsupported file type. Please upload a PDF, DOC, DOCX, TXT, ODT, or RTF file.', 'danger');
            return;
        }

        loadingMessage.textContent = `Extracting text from ${file.name}...`;
        loadingModal.show();
        progressBar.style.width = '30%';

        extractTextFromFile(file)
            .then(text => {
                progressBar.style.width = '70%';
                loadingMessage.textContent = 'Text extracted successfully!';
                textInput.value = text;
                originalTextDiv.textContent = text;
                progressBar.style.width = '100%';
                setTimeout(() => loadingModal.hide(), 500);
            })
            .catch(error => {
                console.error('Error extracting text:', error);
                loadingModal.hide();
                showAlert('Failed to extract text from the document. Please try another file.', 'danger');
            });
    }

    function isSupportedFile(file) {
        const supportedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.oasis.opendocument.text',
            'application/rtf'
        ];
        return supportedTypes.includes(file.type) || 
               file.name.endsWith('.pdf') || 
               file.name.endsWith('.doc') || 
               file.name.endsWith('.docx') || 
               file.name.endsWith('.txt') || 
               file.name.endsWith('.odt') || 
               file.name.endsWith('.rtf');
    }

    async function extractTextFromFile(file) {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            return await extractTextFromPDF(file);
        } else if (file.type.includes('msword') || file.type.includes('wordprocessingml') || 
                   file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            return await extractTextFromWord(file);
        } else {
            return await readTextFile(file);
        }
    }

    async function extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const text = textContent.items.map(item => item.str).join(' ');
                        fullText += text + '\n\n';
                    }
                    
                    resolve(fullText.trim());
                } catch (error) {
                    reject(error);
                }
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    }

    async function extractTextFromWord(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = function() {
                const arrayBuffer = this.result;
                mammoth.extractRawText({ arrayBuffer })
                    .then(result => resolve(result.value))
                    .catch(error => reject(error));
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    }

    async function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = function() {
                resolve(this.result);
            };
            fileReader.onerror = reject;
            fileReader.readAsText(file);
        });
    }

    // Convert button click handler
    convertBtn.addEventListener('click', async function() {
        const text = textInput.value.trim();
        if (!text) {
            showAlert('Please upload a document or paste some text to convert.', 'warning');
            return;
        }

        const targetLang = targetLanguage.value;
        loadingMessage.textContent = 'Translating text...';
        progressBar.style.width = '30%';
        loadingModal.show();

        try {
            const translatedText = await translateText(text, targetLang);
            translatedTextDiv.textContent = translatedText;
            progressBar.style.width = '100%';
            loadingMessage.textContent = 'Translation complete!';
            
            setTimeout(() => {
                loadingModal.hide();
                resultSection.classList.remove('d-none');
                resultSection.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } catch (error) {
            loadingModal.hide();
            showAlert('Translation failed. Please try again later.', 'danger');
        }
    });

    // Actual translation function using LibreTranslate API
    async function translateText(text, targetLang) {
        const apiUrl = 'https://libretranslate.de/translate';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: 'auto',
                target: targetLang
            }),
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Translation failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.translatedText;
    }

    // Reset button click handler
    resetBtn.addEventListener('click', function() {
        fileInput.value = '';
        textInput.value = '';
        originalTextDiv.textContent = '';
        translatedTextDiv.textContent = '';
        resultSection.classList.add('d-none');
        targetLanguage.value = 'en';
    });

    // Copy button click handler
    copyBtn.addEventListener('click', function() {
        const textToCopy = translatedTextDiv.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showAlert('Text copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showAlert('Failed to copy text to clipboard', 'danger');
            });
    });

    // Download button click handler
    downloadBtn.addEventListener('click', function() {
        const textToDownload = translatedTextDiv.textContent;
        const targetLang = targetLanguage.options[targetLanguage.selectedIndex].text;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translated_text_${targetLang}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Helper function to show alerts
    function showAlert(message, type) {
        // Remove any existing alerts first
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
});