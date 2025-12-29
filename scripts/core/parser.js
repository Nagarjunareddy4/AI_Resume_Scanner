// parser.js
// Parser helpers extracted from index.html

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function readFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();
  
  if (fileType === 'txt') {
    return await readTextFile(file);
  } else if (fileType === 'pdf') {
    return await readPdfFile(file);
  } else if (fileType === 'docx') {
    return await readDocxFile(file);
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) {
    return await readImageFile(file);
  }
  return '';
}

async function readTextFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsText(file);
  });
}

async function readPdfFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      resolve(text);
    };
    reader.readAsArrayBuffer(file);
  });
}

async function readDocxFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      resolve(result.value);
    };
    reader.readAsArrayBuffer(file);
  });
}

async function readImageFile(file) {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    return result.data.text;
  } catch (error) {
    throw new Error('Failed to extract text from image');
  }
}

// Expose readFile globally (used by scanning logic)
window.readFile = readFile;