import { FileUpload } from './FileUpload';
import { PDFViewer } from './PDFViewer';
import { ChatInterface } from './ChatInterface';
import { ResizableSplitPane } from './ResizableSplitPane';
import type { ChatMessage, PDFFile } from '../types';

interface LayoutProps {
  pdfFile: PDFFile | null;
  onFileUpload: (file: File) => void;
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  onClearDocument?: () => void; // Optional: untuk clear/reset dokumen
}

export function Layout({
  pdfFile,
  onFileUpload,
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading = false,
  onClearDocument,
}: LayoutProps) {
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {!pdfFile ? (
        // Upload State
        <div className="container mx-auto px-4 py-8 h-full flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                WebAI Document Assistant
              </h1>
              <p className="text-gray-600">
                Upload a PDF document to start analyzing and chatting about its content
              </p>
            </div>
            <FileUpload onUpload={onFileUpload} />
          </div>
        </div>
      ) : (
        // Split View State
        <div className="h-full">
          {onClearDocument && (
            <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Document:</span>
                <span className="text-sm font-medium text-gray-800">
                  {pdfFile.name || 'PDF Document'}
                </span>
              </div>
              <button
                onClick={onClearDocument}
                className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
              >
                Clear Document
              </button>
            </div>
          )}

          <div className="h-full">
            <ResizableSplitPane
              leftPane={
                <div className="h-full bg-white">
                  <PDFViewer url={pdfFile.url} />
                </div>
              }
              rightPane={
                <div className="h-full bg-gray-50">
                  <ChatInterface
                    messages={messages}
                    inputValue={inputValue}
                    onInputChange={onInputChange}
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    documentName={pdfFile.name} // Pass document name ke chat
                  />
                </div>
              }
              initialLeftWidth={50} // 50-50 split default
              minLeftWidth={300} // Minimum width untuk PDF viewer
            // minRightWidth={400} // Minimum width untuk chat
            />
          </div>
        </div>
      )}
    </div>
  );
}