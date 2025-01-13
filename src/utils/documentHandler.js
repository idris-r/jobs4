import mammoth from 'mammoth';

export class DocumentHandler {
  static originalDocument = null;
  static originalParagraphs = [];

  static async extractText(file) {
    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
      switch (fileType) {
        case 'docx':
          return await this.handleDocx(file);
        case 'txt':
          return await this.handleTxt(file);
        default:
          throw new Error('Please upload a .docx or .txt file');
      }
    } catch (error) {
      throw new Error(`Error processing file: ${error.message}`);
    }
  }

  static async handleDocx(file) {
    try {
      // Store the original file
      this.originalDocument = file;
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract raw text for editing
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      
      // Extract HTML to preserve structure
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      
      // Store original paragraphs
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlResult.value, 'text/html');
      this.originalParagraphs = Array.from(doc.body.children).map(p => ({
        text: p.textContent,
        html: p.outerHTML
      }));

      return {
        text: textResult.value,
        originalFile: file,
        paragraphs: this.originalParagraphs
      };
    } catch (error) {
      console.error('DOCX processing error:', error);
      throw new Error('Error processing DOCX file');
    }
  }

  static async handleTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const paragraphs = text.split('\n').map(p => ({
          text: p,
          html: `<p>${p}</p>`
        }));
        resolve({
          text,
          originalFile: file,
          paragraphs
        });
      };
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  static async generateOptimizedDoc(originalText, optimizedText) {
    if (!this.originalDocument || !this.originalParagraphs.length) {
      throw new Error('No original document found');
    }

    try {
      // Split optimized text into paragraphs
      const optimizedParagraphs = optimizedText.split('\n').filter(p => p.trim());
      
      // Create a copy of original paragraphs
      let modifiedParagraphs = [...this.originalParagraphs];

      // Replace content while keeping formatting
      optimizedParagraphs.forEach((newText, index) => {
        if (index < modifiedParagraphs.length) {
          const originalHtml = modifiedParagraphs[index].html;
          // Replace text content while preserving HTML structure
          modifiedParagraphs[index].html = originalHtml.replace(
            />([^<]+)</g,
            `>${newText}<`
          );
        }
      });

      // Create modified HTML
      const modifiedHtml = modifiedParagraphs.map(p => p.html).join('');

      // Create a new file with modified content
      const blob = new Blob([modifiedHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const newFile = new File([blob], 'optimized-cv.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // Download the file
      const url = URL.createObjectURL(newFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'optimized-cv.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error('Error generating optimized document');
    }
  }
}
