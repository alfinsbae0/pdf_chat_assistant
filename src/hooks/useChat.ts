import { useState } from 'react';
import type { ChatMessage } from '../types';

interface PDFContext {
  fileName: string;
  content: string;
  pageCount: number;
  uploadDate: Date;
  pdfUrl: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContext, setPdfContext] = useState<PDFContext | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Halaman ${i} ---\n${pageText}\n`;
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Gagal mengekstrak teks dari PDF');
    }
  };


  const uploadPDF = async (file: File) => {
    setIsLoading(true);
    try {
      const extractedText = await extractTextFromPDF(file);

      const pdfUrl = URL.createObjectURL(file);

      const newPdfContext: PDFContext = {
        pdfUrl: pdfUrl,
        fileName: file.name,
        content: extractedText,
        pageCount: extractedText.split('--- Halaman').length - 1,
        uploadDate: new Date()
      };

      setPdfContext(newPdfContext);

      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ PDF "${file.name}" berhasil diupload dan diproses! Saya sekarang dapat membantu Anda memahami isi dokumen ini. Dokumen ini memiliki ${newPdfContext.pageCount} halaman. Silakan ajukan pertanyaan tentang dokumen ini.`,
        timestamp: new Date(),
      };

      setMessages([systemMessage]);

    } catch (error) {
      console.error('Error processing PDF:', error);

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Maaf, terjadi kesalahan saat memproses PDF. Pastikan file adalah PDF yang valid.',
        timestamp: new Date(),
      };

      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let systemPrompt = 'You are a helpful assistant that helps users understand PDF documents. Provide clear and concise responses based on the document content. Respond in Indonesian language.';

      if (pdfContext) {
        systemPrompt = `You are a helpful assistant that helps users understand PDF documents. 

CURRENT PDF DOCUMENT INFORMATION:
- File Name: ${pdfContext.fileName}
- Number of Pages: ${pdfContext.pageCount}
- Upload Date: ${pdfContext.uploadDate.toLocaleDateString('id-ID')}

DOCUMENT CONTENT:
${pdfContext.content}

Based on this document content, please provide clear and helpful responses to user questions in Indonesian language. Always reference the document when answering questions about its content. If asked about what PDF is open, mention the filename "${pdfContext.fileName}".`;
      }

      const apiKey = import.meta.env.VITE_API_KEY
      const apiUrl = import.meta.env.VITE_API_URL

      if (!apiKey) {
        throw new Error('API key tidak ditemukan. Pastikan VITE_API_KEY sudah diset di file .env');
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PDF Chat App',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            { role: 'user', content }
          ],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan respons.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPdfContext(null);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    isLoading,
    pdfContext,
    uploadPDF,
    clearChat
  };
}
