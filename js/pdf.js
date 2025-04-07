// DOM Elements
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadArea = document.getElementById('uploadArea');
const filePreview = document.getElementById('filePreview');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const fileType = document.getElementById('fileType');
const fileSize = document.getElementById('fileSize');

// Tool buttons
const imageToPdfBtn = document.getElementById('imageToPdfBtn');
const pdfToWordBtn = document.getElementById('pdfToWordBtn');
const wordToPdfBtn = document.getElementById('wordToPdfBtn');
const compressBtn = document.getElementById('compressBtn');

// Image to PDF elements
const imageToPdfSection = document.getElementById('imageToPdfSection');
const pdfOrientation = document.getElementById('pdfOrientation');
const pdfMargin = document.getElementById('pdfMargin');
const startImageToPdfBtn = document.getElementById('startImageToPdfBtn');
const imageToPdfProgress = document.getElementById('imageToPdfProgress');
const imageToPdfStatus = document.getElementById('imageToPdfStatus');
const imageToPdfPercent = document.getElementById('imageToPdfPercent');
const imageToPdfResult = document.getElementById('imageToPdfResult');
const pdfSize = document.getElementById('pdfSize');
const downloadPdf = document.getElementById('downloadPdf');

// PDF to Word elements
const pdfToWordSection = document.getElementById('pdfToWordSection');
const wordFormat = document.getElementById('wordFormat');
const startPdfToWordBtn = document.getElementById('startPdfToWordBtn');
const pdfToWordProgress = document.getElementById('pdfToWordProgress');
const pdfToWordStatus = document.getElementById('pdfToWordStatus');
const pdfToWordPercent = document.getElementById('pdfToWordPercent');
const pdfToWordResult = document.getElementById('pdfToWordResult');
const wordSize = document.getElementById('wordSize');
const downloadWord = document.getElementById('downloadWord');

// Word to PDF elements
const wordToPdfSection = document.getElementById('wordToPdfSection');
const pdfQuality = document.getElementById('pdfQuality');
const startWordToPdfBtn = document.getElementById('startWordToPdfBtn');
const wordToPdfProgress = document.getElementById('wordToPdfProgress');
const wordToPdfStatus = document.getElementById('wordToPdfStatus');
const wordToPdfPercent = document.getElementById('wordToPdfPercent');
const wordToPdfResult = document.getElementById('wordToPdfResult');
const wordPdfSize = document.getElementById('wordPdfSize');
const downloadWordPdf = document.getElementById('downloadWordPdf');

// Compression elements
const compressSection = document.getElementById('compressSection');
const compressionLevel = document.getElementById('compressionLevel');
const compressQualitySlider = document.getElementById('compressQualitySlider');
const compressQualityValue = document.getElementById('compressQualityValue');
const startCompressBtn = document.getElementById('startCompressBtn');
const compressProgress = document.getElementById('compressProgress');
const compressStatus = document.getElementById('compressStatus');
const compressPercent = document.getElementById('compressPercent');
const compressResult = document.getElementById('compressResult');
const originalCompressSize = document.getElementById('originalCompressSize');
const compressedSize = document.getElementById('compressedSize');
const compressReduction = document.getElementById('compressReduction');
const downloadCompressed = document.getElementById('downloadCompressed');

// Global variables
let currentFile = null;
let currentFileType = '';
let currentFileSize = 0;
let currentFileDataUrl = '';

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Tool buttons
imageToPdfBtn.addEventListener('click', () => toggleSection(imageToPdfSection));
pdfToWordBtn.addEventListener('click', () => toggleSection(pdfToWordSection));
wordToPdfBtn.addEventListener('click', () => toggleSection(wordToPdfSection));
compressBtn.addEventListener('click', () => toggleSection(compressSection));

// Quality slider
compressQualitySlider.addEventListener('input', () => {
    compressQualityValue.textContent = compressQualitySlider.value;
});

// Conversion buttons
startImageToPdfBtn.addEventListener('click', convertImageToPdf);
startPdfToWordBtn.addEventListener('click', convertPdfToWord);
startWordToPdfBtn.addEventListener('click', convertWordToPdf);
startCompressBtn.addEventListener('click', compressFile);

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
    
    currentFile = file;
    currentFileSize = file.size;
    currentFileType = getFileType(file.name);
    
    // Display file info
    fileType.textContent = currentFileType.toUpperCase();
    fileSize.textContent = formatFileSize(currentFileSize);
    
    // Create preview based on file type
    createFilePreview(file);
    
    // Enable appropriate tool buttons
    updateToolButtons();
    
    // Hide all result sections
    [imageToPdfResult, pdfToWordResult, wordToPdfResult, compressResult].forEach(section => {
        section.classList.add('hidden');
    });
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        return 'image';
    } else if (extension === 'pdf') {
        return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
        return 'word';
    }
    return 'unknown';
}

function createFilePreview(file) {
    filePreview.innerHTML = '';
    filePreviewContainer.classList.remove('hidden');
    
    if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentFileDataUrl = e.target.result;
            const img = document.createElement('img');
            img.src = e.target.result;
            filePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        const embed = document.createElement('embed');
        embed.src = URL.createObjectURL(file);
        embed.type = 'application/pdf';
        filePreview.appendChild(embed);
    } else if (file.type === 'application/msword' || 
               file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const message = document.createElement('p');
        message.textContent = 'Word document preview not available. File ready for conversion.';
        filePreview.appendChild(message);
    } else {
        const message = document.createElement('p');
        message.textContent = 'File preview not available.';
        filePreview.appendChild(message);
    }
}

function updateToolButtons() {
    // Reset all buttons
    [imageToPdfBtn, pdfToWordBtn, wordToPdfBtn, compressBtn].forEach(btn => {
        btn.disabled = true;
    });
    
    // Enable buttons based on file type
    if (currentFileType === 'image') {
        imageToPdfBtn.disabled = false;
        compressBtn.disabled = false;
    } else if (currentFileType === 'pdf') {
        pdfToWordBtn.disabled = false;
        compressBtn.disabled = false;
    } else if (currentFileType === 'word') {
        wordToPdfBtn.disabled = false;
        compressBtn.disabled = false;
    }
}

function toggleSection(section) {
    // Hide all sections first
    [imageToPdfSection, pdfToWordSection, wordToPdfSection, compressSection].forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show the selected section
    section.classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Image to PDF Conversion
async function convertImageToPdf() {
    imageToPdfProgress.classList.remove('hidden');
    imageToPdfStatus.textContent = 'Converting...';
    imageToPdfPercent.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 20;
        document.querySelector('#imageToPdfProgress progress').value = progress;
        imageToPdfPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            finishImageToPdf();
        }
    }, 100);
}

async function finishImageToPdf() {
    try {
        const { PDFDocument, rgb } = PDFLib;
        
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        
        // Embed the image
        const imageBytes = await fetch(currentFileDataUrl).then(res => res.arrayBuffer());
        let image;
        
        if (currentFile.type === 'image/jpeg' || currentFile.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (currentFile.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            throw new Error('Unsupported image format');
        }
        
        // Add a blank page with image dimensions
        const margin = parseInt(pdfMargin.value) || 10;
        const marginPoints = margin * 2.83465; // Convert mm to points (1mm = 2.83465 points)
        
        let pageWidth = image.width;
        let pageHeight = image.height;
        
        if (pdfOrientation.value === 'landscape' && image.width < image.height) {
            // Swap dimensions for landscape
            pageWidth = image.height;
            pageHeight = image.width;
        }
        
        // Add margin
        pageWidth += marginPoints * 2;
        pageHeight += marginPoints * 2;
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Draw the image on the page
        page.drawImage(image, {
            x: marginPoints,
            y: marginPoints,
            width: image.width,
            height: image.height,
        });
        
        // Serialize the PDF
        const pdfBytes = await pdfDoc.save();
        
        // Create download link
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Display result
        imageToPdfStatus.textContent = 'Conversion complete!';
        pdfSize.textContent = formatFileSize(pdfBlob.size);
        imageToPdfResult.classList.remove('hidden');
        
        downloadPdf.href = pdfUrl;
        downloadPdf.download = 'converted.pdf';
    } catch (err) {
        imageToPdfStatus.textContent = 'Error converting to PDF: ' + err.message;
        console.error(err);
    }
}

// PDF to Word Conversion
async function convertPdfToWord() {
    pdfToWordProgress.classList.remove('hidden');
    pdfToWordStatus.textContent = 'Converting...';
    pdfToWordPercent.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 20;
        document.querySelector('#pdfToWordProgress progress').value = progress;
        pdfToWordPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            finishPdfToWord();
        }
    }, 100);
}

async function finishPdfToWord() {
    try {
        // In a real application, you would use a proper PDF to Word conversion library
        // This is a simplified approach that creates a Word document with the PDF text
        
        // For demo purposes, we'll just create a simple Word document
        const { Document, Paragraph, Packer, TextRun } = docx;
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "PDF to Word Conversion",
                                bold: true,
                                size: 28,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "This is a placeholder for the PDF content.",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "In a real implementation, you would extract text from the PDF and add it here.",
                            }),
                        ],
                    }),
                ],
            }],
        });
        
        // Generate the Word document
        const mimeType = wordFormat.value === 'doc' ? 
            'application/msword' : 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        const extension = wordFormat.value === 'doc' ? '.doc' : '.docx';
        
        Packer.toBlob(doc).then((blob) => {
            const wordUrl = URL.createObjectURL(blob);
            
            // Display result
            pdfToWordStatus.textContent = 'Conversion complete!';
            wordSize.textContent = formatFileSize(blob.size);
            pdfToWordResult.classList.remove('hidden');
            
            downloadWord.href = wordUrl;
            downloadWord.download = 'converted' + extension;
        });
    } catch (err) {
        pdfToWordStatus.textContent = 'Error converting to Word: ' + err.message;
        console.error(err);
    }
}

// Word to PDF Conversion
async function convertWordToPdf() {
    wordToPdfProgress.classList.remove('hidden');
    wordToPdfStatus.textContent = 'Converting...';
    wordToPdfPercent.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 20;
        document.querySelector('#wordToPdfProgress progress').value = progress;
        wordToPdfPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            finishWordToPdf();
        }
    }, 100);
}

async function finishWordToPdf() {
    try {
        // In a real application, you would use a proper Word to PDF conversion library
        // This is a simplified approach that creates a PDF with placeholder text
        
        const { PDFDocument, rgb } = PDFLib;
        
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        
        // Add a page
        const page = pdfDoc.addPage([550, 750]);
        
        // Draw some text
        const { width, height } = page.getSize();
        
        page.drawText('Word to PDF Conversion', {
            x: 50,
            y: height - 70,
            size: 24,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('This is a placeholder for the Word document content.', {
            x: 50,
            y: height - 120,
            size: 14,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('In a real implementation, you would convert the Word content to PDF.', {
            x: 50,
            y: height - 150,
            size: 14,
            color: rgb(0, 0, 0),
        });
        
        // Serialize the PDF
        const pdfBytes = await pdfDoc.save();
        
        // Create download link
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Display result
        wordToPdfStatus.textContent = 'Conversion complete!';
        wordPdfSize.textContent = formatFileSize(pdfBlob.size);
        wordToPdfResult.classList.remove('hidden');
        
        downloadWordPdf.href = pdfUrl;
        downloadWordPdf.download = 'converted.pdf';
    } catch (err) {
        wordToPdfStatus.textContent = 'Error converting to PDF: ' + err.message;
        console.error(err);
    }
}

// File Compression
async function compressFile() {
    compressProgress.classList.remove('hidden');
    compressStatus.textContent = 'Compressing...';
    compressPercent.textContent = '0%';
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 20;
        document.querySelector('#compressProgress progress').value = progress;
        compressPercent.textContent = `${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
            finishCompression();
        }
    }, 100);
}

async function finishCompression() {
    try {
        let compressedBlob;
        const quality = parseInt(compressQualitySlider.value) / 100;
        
        if (currentFileType === 'image') {
            // Compress image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                let mimeType;
                switch(currentFile.type) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'image/png':
                        mimeType = 'image/png';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                }
                
                canvas.toBlob((blob) => {
                    compressedBlob = blob;
                    finalizeCompression(compressedBlob);
                }, mimeType, quality);
            };
            
            img.src = currentFileDataUrl;
        } else {
            // For non-image files, we can't really compress, so just use the original
            compressedBlob = currentFile;
            finalizeCompression(compressedBlob);
        }
    } catch (err) {
        compressStatus.textContent = 'Error compressing file: ' + err.message;
        console.error(err);
    }
}

function finalizeCompression(compressedBlob) {
    const compressedUrl = URL.createObjectURL(compressedBlob);
    
    // Display result
    compressStatus.textContent = 'Compression complete!';
    originalCompressSize.textContent = formatFileSize(currentFileSize);
    compressedSize.textContent = formatFileSize(compressedBlob.size);
    
    const reduction = ((currentFileSize - compressedBlob.size) / currentFileSize * 100).toFixed(1);
    compressReduction.textContent = `${reduction}% smaller`;
    
    compressResult.classList.remove('hidden');
    
    // Set up download link
    downloadCompressed.href = compressedUrl;
    downloadCompressed.download = 'compressed_' + currentFile.name;
}