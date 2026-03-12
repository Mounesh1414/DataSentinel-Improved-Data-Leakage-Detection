/**
 * Enhanced File Extractor - Supports PDF, DOCX, TXT, JSON, HTML, Images
 */

const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

class FileExtractor {
  async extractText(file) {
    const ext = path.extname(file.originalname).toLowerCase();

    switch (ext) {
      case '.pdf':
        return await this.extractPDF(file.buffer);
      case '.docx':
      case '.doc':
        return await this.extractDocx(file.buffer);
      case '.txt':
        return file.buffer.toString('utf-8');
      case '.csv':
        return file.buffer.toString('utf-8');
      case '.json':
        return file.buffer.toString('utf-8');
      case '.html':
      case '.htm':
        return this.extractHTML(file.buffer.toString('utf-8'));
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.bmp':
      case '.gif':
        return await this.extractImage(file.buffer);
      default:
        try {
          return file.buffer.toString('utf-8');
        } catch (error) {
          return '';
        }
    }
  }

  async extractPDF(buffer) {
    try {
      const data = await pdf(buffer);
      
      let fullText = '';
      if (data.pages && Array.isArray(data.pages)) {
        data.pages.forEach(page => {
          if (page.content) {
            fullText += page.content.map(item => item.str || '').join(' ') + '\n';
          }
        });
      }
      
      if (!fullText && data.text) {
        fullText = data.text;
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF:', error.message);
      return '';
    }
  }

  async extractDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX:', error.message);
      return '';
    }
  }

  extractHTML(htmlContent) {
    try {
      // Remove scripts and styles
      let text = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      
      return text;
    } catch (error) {
      console.error('Error extracting HTML:', error.message);
      return '';
    }
  }

  async extractImage(buffer) {
    try {
      let Tesseract;
      try {
        Tesseract = require('tesseract.js');
      } catch (e) {
        console.warn('Tesseract.js not available for OCR');
        return '';
      }
      
      const { createWorker } = Tesseract;
      const worker = createWorker();
      
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      
      return text;
    } catch (error) {
      console.error('Error extracting from image:', error.message);
      return '';
    }
  }
}

module.exports = new FileExtractor();
