import { useState } from 'react';
import type { PDFFile } from '../types';
import * as pdfjs from 'pdfjs-dist';

export function usePDF() {
  const [pdfFile, setPDFFile] = useState<PDFFile | null>(null);
  const [pdfText, setPdfText] = useState<string>('');

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFileUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPDFFile({
      url,
      name: file.name,
    });

    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
    }
  };

  const clearPDF = () => {
    if (pdfFile) {
      URL.revokeObjectURL(pdfFile.url);
      setPDFFile(null);
      setPdfText('');
    }
  };

  return {
    pdfFile,
    pdfText,
    handleFileUpload,
    clearPDF,
  };
}