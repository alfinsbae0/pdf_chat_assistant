import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF Load Error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  console.log('PDFViewer received URL:', url);
  console.log('URL type:', typeof url);
  console.log('URL valid?', url && url.length > 0);

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No PDF URL provided</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Load PDF</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
            <strong>Debug Info:</strong><br />
            URL: {url}<br />
            Type: {typeof url}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto bg-gray-100">
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading PDF...</span>
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="flex flex-col items-center"
        loading={
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading PDF...</span>
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          className="mb-4 shadow-lg"
          renderTextLayer={true}
          renderAnnotationLayer={true}
          width={Math.min(window.innerWidth * 0.4, 800) * scale}
          scale={scale}
        />
      </Document>

      {!loading && !error && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border z-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </p>
            <p className="text-xs text-gray-500">
              Zoom: {Math.round(scale * 100)}%
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="Reset Zoom"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}