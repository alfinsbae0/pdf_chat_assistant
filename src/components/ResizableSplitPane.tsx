import React, { useState, useEffect, useCallback } from 'react';

interface ResizableSplitPaneProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

export function ResizableSplitPane({
  leftPane,
  rightPane,
  initialLeftWidth = 500,
  minLeftWidth = 300,
  maxLeftWidth = 800,
}: ResizableSplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
          setLeftWidth(newWidth);
        }
      }
    },
    [isResizing, minLeftWidth, maxLeftWidth]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex h-full">
      <div style={{ width: leftWidth }} className="flex-shrink-0">
        {leftPane}
      </div>
      <div
        className="w-2 bg-gray-200 cursor-col-resize hover:bg-gray-300 active:bg-gray-400"
        onMouseDown={startResizing}
      />
      <div className="flex-1">{rightPane}</div>
    </div>
  );
}