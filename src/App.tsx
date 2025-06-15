// import React from 'react';
import { useChat } from './hooks/useChat';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { PDFViewer } from './components/PDFViewer';
import { ResizableSplitPane } from './components/ResizableSplitPane';
import './index.css';

function App() {
  const {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    isLoading,
    pdfContext,
    uploadPDF,
    clearChat
  } = useChat();

  return (
    <div className="h-screen bg-gray-50">
      {!pdfContext ? (
        // Upload State - belum ada PDF
        <div className="flex h-screen bg-gray-100">
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800">PDF Chat Assistant</h1>
              <p className="text-sm text-gray-600 mt-1">Upload PDF dan chat dengan AI</p>
            </div>

            <div className="p-4">
              <FileUpload
                onUpload={uploadPDF}
                isLoading={isLoading}
                currentPDF={pdfContext}
              />
            </div>

            <div className="p-4 mt-auto border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-800 text-sm">💡 Tips Penggunaan:</h5>
                <ul className="mt-2 text-xs text-blue-700 space-y-1">
                  <li>• Upload PDF terlebih dahulu</li>
                  <li>• Kemudian chat dengan AI tentang isi PDF</li>
                  <li>• Anda bisa melihat PDF dan chat bersamaan</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-400 mb-2">Upload PDF untuk memulai</h2>
              <p className="text-gray-500">PDF akan ditampilkan di sini setelah diupload</p>
            </div>
          </div>
        </div>
      ) : (
        // Split View State - sudah ada PDF
        <div className="h-full">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-gray-800">PDF Chat Assistant</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <span className="font-medium">{pdfContext.fileName}</span>
                <span className="text-gray-400">•</span>
                <span>{pdfContext.pageCount} halaman</span>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Reset</span>
            </button>
          </div>

          {/* Split view: PDF Viewer + Chat */}
          <div className="h-full" style={{ height: 'calc(100vh - 64px)' }}>
            <ResizableSplitPane
              leftPane={
                <div className="h-full bg-white">
                  <PDFViewer url={pdfContext.pdfUrl || ''} />
                </div>
              }
              rightPane={
                <div className="h-full bg-gray-50">
                  <ChatInterface
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    pdfUploaded={!!pdfContext}
                  />
                </div>
              }
              // initialLeftWidth={500}
              minLeftWidth={300}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;