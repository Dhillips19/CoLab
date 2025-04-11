import React from 'react';
import { render } from '@testing-library/react';
import Editor from './Editor';
import socket from '../../socket/socket';

// Mock dependencies
jest.mock('../../socket/socket', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  connected: true,
  disconnect: jest.fn(),
  connect: jest.fn()
}));

// Mock Quill with icons that can be modified
jest.mock('quill', () => {
  // Create icons object that can be modified
  const icons = {
    undo: 'mock-undo-icon',
    redo: 'mock-redo-icon'
  };

  const mockQuill = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    setText: jest.fn(),
    getContents: jest.fn(() => ({ ops: [] })),
    setContents: jest.fn(),
    history: {
      undo: jest.fn(),
      redo: jest.fn()
    }
  }));

  // Add static methods
  mockQuill.register = jest.fn();
  mockQuill.import = jest.fn((path) => {
    if (path === 'ui/icons') return icons;
    return {};
  });

  return mockQuill;
});

// Mock QuillCursors
jest.mock('quill-cursors', () => ({}));

// Mock Y.js libraries
jest.mock('yjs', () => {
  const mockYDoc = {
    getText: jest.fn().mockReturnValue({
      toString: jest.fn(),
      delete: jest.fn(),
      length: 0
    }),
    on: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    Doc: jest.fn().mockReturnValue(mockYDoc),
    applyUpdate: jest.fn()
  };
});

jest.mock('y-quill', () => ({
  QuillBinding: jest.fn()
}));

jest.mock('y-protocols/awareness', () => {
  const mockAwareness = {
    setLocalStateField: jest.fn(),
    on: jest.fn()
  };
  
  return {
    Awareness: jest.fn().mockReturnValue(mockAwareness),
    encodeAwarenessUpdate: jest.fn(() => new Uint8Array([1, 2, 3])),
    applyAwarenessUpdate: jest.fn()
  };
});

// Capture socket event handlers
const socketHandlers = {};

// Instead of mocking DOM elements directly, let's mock the editor's DOM interaction
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  
  return {
    ...originalReact,
    useRef: jest.fn().mockReturnValue({
      current: document.createElement('div') // Use real DOM elements for refs
    }),
    useEffect: jest.fn((cb) => {
      // Execute the callback to simulate useEffect
      cb();
      // Return a cleanup function
      return () => {};
    })
  };
});

describe('Editor Component', () => {
  const mockDocumentId = 'doc123';
  const mockUsername = 'testuser';
  const mockColour = '#ff0000';
  const mockQuillRef = { current: null };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset captured handlers
    for (const key in socketHandlers) {
      delete socketHandlers[key];
    }
    
    // Capture event handlers when socket.on is called
    socket.on.mockImplementation((event, callback) => {
      socketHandlers[event] = callback;
    });
  });
  
  test('renders editor container', () => {
    const { container } = render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    expect(container.querySelector('.editor-container')).toBeInTheDocument();
  });
  
  test('sets up socket event listeners', () => {
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Check that socket.on was called for each event
    expect(socket.on).toHaveBeenCalledWith('initialState', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('update', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('latestState', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('awareness-update', expect.any(Function));
  });
  
  test('cleans up socket listeners when unmounted', () => {
    const { unmount } = render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Call the cleanup function in useEffect
    React.useEffect.mock.calls.forEach(call => {
      if (call[1] && call[1].includes(mockDocumentId)) {
        const cleanup = call[0]();
        if (cleanup) cleanup();
      }
    });
    
    // Check that socket.off was called for each event
    expect(socket.off).toHaveBeenCalledWith('initialState');
    expect(socket.off).toHaveBeenCalledWith('update');
    expect(socket.off).toHaveBeenCalledWith('latestState');
  });
  
  test('initializes Y.js document and awareness', () => {
    const { Awareness } = require('y-protocols/awareness');
    
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    expect(Awareness().setLocalStateField).toHaveBeenCalledWith('user', {
      name: mockUsername,
      color: mockColour
    });
  });
  
  test('handles document updates from server', () => {
    const { applyUpdate } = require('yjs');
    
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Manually call the update handler with a mock update
    const mockUpdate = new Uint8Array([1, 2, 3]);
    const mockHandler = socket.on.mock.calls.find(call => call[0] === 'update')[1];
    mockHandler(mockUpdate);
    
    expect(applyUpdate).toHaveBeenCalled();
  });
  
  test('handles awareness updates from server', () => {
    const { applyAwarenessUpdate } = require('y-protocols/awareness');
    
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Manually call the awareness-update handler with a mock update
    const mockUpdate = { update: new Uint8Array([4, 5, 6]) };
    const mockHandler = socket.on.mock.calls.find(call => call[0] === 'awareness-update')[1];
    mockHandler(mockUpdate);
    
    expect(applyAwarenessUpdate).toHaveBeenCalled();
  });
  
  test('processes initial state from server', () => {
    const { applyUpdate } = require('yjs');
    
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Manually call the initialState handler with a mock state
    const mockState = new Uint8Array([7, 8, 9]);
    const mockHandler = socket.on.mock.calls.find(call => call[0] === 'initialState')[1];
    mockHandler(mockState);
    
    expect(applyUpdate).toHaveBeenCalled();
  });
  
  test('processes latest state from server', () => {
    const { applyUpdate } = require('yjs');
    const { QuillBinding } = require('y-quill');
    
    render(
      <Editor
        documentId={mockDocumentId}
        username={mockUsername}
        colour={mockColour}
        quillRef={mockQuillRef}
      />
    );
    
    // Clear previous calls to QuillBinding
    QuillBinding.mockClear();
    
    // Manually call the latestState handler with a mock state
    const mockLatestState = new Uint8Array([10, 11, 12]);
    const mockHandler = socket.on.mock.calls.find(call => call[0] === 'latestState')[1];
    mockHandler(mockLatestState);
    
    expect(applyUpdate).toHaveBeenCalled();
    expect(QuillBinding).toHaveBeenCalled();
  });
});