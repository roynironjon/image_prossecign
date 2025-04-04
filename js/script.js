// DOM Elements
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadArea = document.getElementById('uploadArea');
const originalPreview = document.getElementById('originalPreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const originalFormat = document.getElementById('originalFormat');
const originalDimensions = document.getElementById('originalDimensions');
const originalSize = document.getElementById('originalSize');

// Tool buttons
const convertBtn = document.getElementById('convertBtn');
const extractTextBtn = document.getElementById('extractTextBtn');
const removeBgBtn = document.getElementById('removeBgBtn');
const resizeBtn = document.getElementById('resizeBtn');
const compressBtn = document.getElementById('compressBtn');

// Conversion elements
const convertSection = document.getElementById('convertSection');
const formatSelect = document.getElementById('formatSelect');
const startConvertBtn = document.getElementById('startConvertBtn');
const convertProgress = document.getElementById('convertProgress');
const convertStatus = document.getElementById('convertStatus');
const convertPercent = document.getElementById('convertPercent');
const convertedPreview = document.getElementById('convertedPreview');
const convertedResult = document.getElementById('convertedResult');
const newFormat = document.getElementById('newFormat');
const newSize = document.getElementById('newSize');
const downloadConverted = document.getElementById('downloadConverted');

// Text extraction elements
const extractSection = document.getElementById('extractSection');
const languageSelect = document.getElementById('languageSelect');
const startExtractBtn = document.getElementById('startExtractBtn');
const extractProgress = document.getElementById('extractProgress');
const extractStatus = document.getElementById('extractStatus');
const extractPercent = document.getElementById('extractPercent');
const extractedText = document.getElementById('extractedText');
const extractedTextResult = document.getElementById('extractedTextResult');
const copyTextBtn = document.getElementById('copyTextBtn');

// Background removal elements
const removeBgSection = document.getElementById('removeBgSection');
const bgRemovalMethod = document.getElementById('bgRemovalMethod');
const colorPickerContainer = document.getElementById('colorPickerContainer');
const bgColorToRemove = document.getElementById('bgColorToRemove');
const startRemoveBgBtn = document.getElementById('startRemoveBgBtn');
const removeBgProgress = document.getElementById('removeBgProgress');
const removeBgStatus = document.getElementById('removeBgStatus');
const removeBgPercent = document.getElementById('removeBgPercent');
const bgRemovedPreview = document.getElementById('bgRemovedPreview');
const bgRemovedResult = document.getElementById('bgRemovedResult');
const bgRemovedSize = document.getElementById('bgRemovedSize');
const downloadBgRemoved = document.getElementById('downloadBgRemoved');

// File size adjustment elements
const sizeAdjustSection = document.getElementById('sizeAdjustSection');
const sizeUnit = document.getElementById('sizeUnit');
const targetSize = document.getElementById('targetSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const startSizeAdjustBtn = document.getElementById('startSizeAdjustBtn');
const sizeAdjustProgress = document.getElementById('sizeAdjustProgress');
const sizeAdjustStatus = document.getElementById('sizeAdjustStatus');
const sizeAdjustPercent = document.getElementById('sizeAdjustPercent');
const sizeAdjustedPreview = document.getElementById('sizeAdjustedPreview');
const sizeAdjustedResult = document.getElementById('sizeAdjustedResult');
const originalSizeDisplay = document.getElementById('originalSizeDisplay');
const newSizeDisplay = document.getElementById('newSizeDisplay');
const sizeReduction = document.getElementById('sizeReduction');
const downloadSizeAdjusted = document.getElementById('downloadSizeAdjusted');

// Global variables
let originalImage = null;
let originalImageDataUrl = '';
let originalFileSize = 0;
let bgRemovedImageDataUrl = '';

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Tool buttons
convertBtn.addEventListener('click', () => toggleSection(convertSection));
extractTextBtn.addEventListener('click', () => toggleSection(extractSection));
removeBgBtn.addEventListener('click', () => toggleSection(removeBgSection));
resizeBtn.addEventListener('click', () => toggleSection(sizeAdjustSection));
compressBtn.addEventListener('click', () => toggleSection(sizeAdjustSection));

// Background removal method change
bgRemovalMethod.addEventListener('change', () => {
    colorPickerContainer.classList.toggle('hidden', bgRemovalMethod.value !== 'manual');
});

// Quality slider
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
});

// Conversion
startConvertBtn.addEventListener('click', convertImage);

// Text extraction
startExtractBtn.addEventListener('click', extractTextFromImage);
copyTextBtn.addEventListener('click', copyTextToClipboard);

// Background removal
startRemoveBgBtn.addEventListener('click', removeBackground);

// File size adjustment
startSizeAdjustBtn.addEventListener('click', adjustFileSize);

// Functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
    uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
}

function handleDragLeave() {
    uploadArea.style.borderColor = 'var(--gray-color)';
    uploadArea.style.backgroundColor = 'transparent';
}

function handleDrop(e) {
    e.preventDefault();
    handleDragLeave();
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect(e);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPG, PNG, WebP)');
        return;
    }
    
    originalFileSize = file.size;
    const reader = new FileReader();
    reader.onload = (event) => {
        originalImageDataUrl = event.target.result;
        originalPreview.src = originalImageDataUrl;
        imagePreviewContainer.classList.remove('hidden');
        
        // Enable all tool buttons
        [convertBtn, extractTextBtn, removeBgBtn, resizeBtn, compressBtn].forEach(btn => {
            btn.disabled = false;
        });
        
        // Hide all result sections
        [convertedResult, extractedTextResult, bgRemovedResult, sizeAdjustedResult].forEach(section => {
            section.classList.add('hidden');
        });
        
        // Create an Image object for processing
        originalImage = new Image();
        originalImage.onload = () => {
            // Display file info
            originalFormat.textContent = file.type.split('/')[1].toUpperCase();
            originalDimensions.textContent = `${originalImage.width} × ${originalImage.height} px`;
            originalSize.textContent = formatFileSize(originalFileSize);
        };
        originalImage.src = originalImageDataUrl;
    };
    reader.readAsDataURL(file);
}

function toggleSection(section) {
    // Hide all sections first
    [convertSection, extractSection, removeBgSection, sizeAdjustSection].forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show the selected section
    section.classList.remove('hidden');
}

function convertImage() {
    const format = formatSelect.value;
    convertProgress.classList.remove('hidden');
    convertStatus.textContent = 'Converting...';
    convertPercent.textContent = '0%';
    
    // Simulate progress for demo
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        document.querySelector('#convertProgress progress').value = progress;
        convertPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            finishConversion(format);
        }
    }, 100);
}

function finishConversion(format) {
    convertStatus.textContent = 'Conversion complete!';
    
    // Create canvas for conversion
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    
    // Convert to selected format
    let mimeType;
    switch(format) {
        case 'jpg': mimeType = 'image/jpeg'; break;
        case 'png': mimeType = 'image/png'; break;
        case 'webp': mimeType = 'image/webp'; break;
        default: mimeType = 'image/jpeg';
    }
    
    // Get quality based on format
    const quality = format === 'png' ? 1 : 0.9;
    
    const convertedDataUrl = canvas.toDataURL(mimeType, quality);
    convertedPreview.src = convertedDataUrl;
    convertedResult.classList.remove('hidden');
    
    // Calculate and display new size
    const newFileSize = Math.round(convertedDataUrl.length * 0.75); // Approximate
    newFormat.textContent = format.toUpperCase();
    newSize.textContent = formatFileSize(newFileSize);
    
    // Set up download link
    downloadConverted.href = convertedDataUrl;
    downloadConverted.download = `converted_image.${format}`;
}

function extractTextFromImage() {
    const language = languageSelect.value;
    extractProgress.classList.remove('hidden');
    extractStatus.textContent = 'Extracting text...';
    extractPercent.textContent = '0%';
    
    Tesseract.recognize(
        originalImageDataUrl,
        language,
        {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    document.querySelector('#extractProgress progress').value = progress;
                    extractPercent.textContent = `${progress}%`;
                    extractStatus.textContent = `Extracting text... ${progress}%`;
                }
            }
        }
    ).then(({ data: { text } }) => {
        extractStatus.textContent = 'Text extraction complete!';
        extractedText.value = text;
        extractedTextResult.classList.remove('hidden');
    }).catch(err => {
        extractStatus.textContent = 'Error extracting text: ' + err.message;
        console.error(err);
    });
}

function copyTextToClipboard() {
    extractedText.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyTextBtn.innerHTML;
    copyTextBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        copyTextBtn.innerHTML = originalText;
    }, 2000);
}

async function removeBackground() {
    removeBgProgress.classList.remove('hidden');
    removeBgStatus.textContent = 'Removing background...';
    removeBgPercent.textContent = '0%';
    
    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            document.querySelector('#removeBgProgress progress').value = progress;
            removeBgPercent.textContent = `${progress}%`;
            if (progress >= 100) {
                clearInterval(progressInterval);
                performBackgroundRemoval();
            }
        }, 100);
    } catch (err) {
        removeBgStatus.textContent = 'Error removing background: ' + err.message;
        console.error(err);
    }
}

async function performBackgroundRemoval() {
    try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        // Draw original image
        ctx.drawImage(originalImage, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (bgRemovalMethod.value === 'manual') {
            // Manual color selection
            const selectedColor = hexToRgb(bgColorToRemove.value);
            const threshold = 50;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if pixel color is similar to selected color
                if (colorDistance(selectedColor, {r, g, b}) < threshold) {
                    data[i + 3] = 0; // Set alpha to 0 (transparent)
                }
            }
        } else {
            // Automatic background removal (simple edge detection)
            // This is a simplified approach - in production you'd use a better algorithm
            const edgeThreshold = 30;
            
            for (let y = 1; y < canvas.height - 1; y++) {
                for (let x = 1; x < canvas.width - 1; x++) {
                    const i = (y * canvas.width + x) * 4;
                    
                    // Get surrounding pixels
                    const top = (y - 1) * canvas.width + x;
                    const bottom = (y + 1) * canvas.width + x;
                    const left = y * canvas.width + (x - 1);
                    const right = y * canvas.width + (x + 1);
                    
                    // Calculate color differences
                    const diffTop = colorDifference(data, i, top * 4);
                    const diffBottom = colorDifference(data, i, bottom * 4);
                    const diffLeft = colorDifference(data, i, left * 4);
                    const diffRight = colorDifference(data, i, right * 4);
                    
                    // If not an edge, make transparent
                    if (diffTop < edgeThreshold && diffBottom < edgeThreshold && 
                        diffLeft < edgeThreshold && diffRight < edgeThreshold) {
                        data[i + 3] = 0;
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Display result
        bgRemovedImageDataUrl = canvas.toDataURL('image/png');
        bgRemovedPreview.src = bgRemovedImageDataUrl;
        bgRemovedResult.classList.remove('hidden');
        
        // Calculate and display new size
        const newFileSize = Math.round(bgRemovedImageDataUrl.length * 0.75); // Approximate
        bgRemovedSize.textContent = formatFileSize(newFileSize);
        
        // Set up download link
        downloadBgRemoved.href = bgRemovedImageDataUrl;
        downloadBgRemoved.download = 'background_removed.png';
        
        removeBgStatus.textContent = 'Background removal complete!';
    } catch (err) {
        removeBgStatus.textContent = 'Error removing background: ' + err.message;
        console.error(err);
    }
}

function adjustFileSize() {
    const targetSizeValue = parseFloat(targetSize.value);
    const unit = sizeUnit.value;
    const quality = parseInt(qualitySlider.value) / 100;
    
    // Convert target size to bytes
    let targetBytes;
    if (unit === 'kb') {
        targetBytes = targetSizeValue * 1024;
    } else {
        targetBytes = targetSizeValue * 1024 * 1024;
    }
    
    sizeAdjustProgress.classList.remove('hidden');
    sizeAdjustStatus.textContent = 'Adjusting size...';
    sizeAdjustPercent.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        document.querySelector('#sizeAdjustProgress progress').value = progress;
        sizeAdjustPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            performSizeAdjustment(targetBytes, quality);
        }
    }, 100);
}

function performSizeAdjustment(targetBytes, quality) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Start with original dimensions
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    
    let currentQuality = quality;
    let currentDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
    let currentSize = currentDataUrl.length * 0.75; // Approximate
    
    // If already smaller than target, just use that
    if (currentSize <= targetBytes) {
        finishSizeAdjustment(currentDataUrl, currentSize);
        return;
    }
    
    // Otherwise, adjust dimensions to meet target size
    let newWidth = originalImage.width;
    let newHeight = originalImage.height;
    let iterations = 0;
    const maxIterations = 10;
    
    while (currentSize > targetBytes && iterations < maxIterations) {
        // Reduce dimensions by 10%
        newWidth = Math.max(newWidth * 0.9, 10);
        newHeight = Math.max(newHeight * 0.9, 10);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
        
        currentDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        currentSize = currentDataUrl.length * 0.75;
        iterations++;
    }
    
    // If still too large, reduce quality
    while (currentSize > targetBytes && currentQuality > 0.1) {
        currentQuality = Math.max(currentQuality - 0.1, 0.1);
        currentDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        currentSize = currentDataUrl.length * 0.75;
    }
    
    finishSizeAdjustment(currentDataUrl, currentSize);
}

function finishSizeAdjustment(dataUrl, newSize) {
    sizeAdjustStatus.textContent = 'Size adjustment complete!';
    sizeAdjustedPreview.src = dataUrl;
    sizeAdjustedResult.classList.remove('hidden');
    
    // Display file info
    originalSizeDisplay.textContent = formatFileSize(originalFileSize);
    newSizeDisplay.textContent = formatFileSize(newSize);
    
    const reduction = ((originalFileSize - newSize) / originalFileSize * 100).toFixed(1);
    sizeReduction.textContent = `${reduction}% smaller`;
    
    // Set up download link
    downloadSizeAdjusted.href = dataUrl;
    downloadSizeAdjusted.download = 'size_adjusted.jpg';
}

// Helper functions
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
}

function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}

function colorDifference(data, i1, i2) {
    const r1 = data[i1];
    const g1 = data[i1 + 1];
    const b1 = data[i1 + 2];
    
    const r2 = data[i2];
    const g2 = data[i2 + 1];
    const b2 = data[i2 + 2];
    
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}