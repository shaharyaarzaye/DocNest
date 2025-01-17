import { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean']
];


const TextEditor = () => {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);

  // Socket connection
  useEffect(() => {
    const s = io("https://effective-waffle-46xv5jpg56jf6wp-3002.app.github.dev/", {
      transports: ['polling', 'websocket'],
    });
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to the server!');
    });

    s.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
    });

    return () => {
      s.disconnect();
    };
  }, []); // Empty dependency ensures this effect runs only once on mount


  useEffect(() => {
    if (socket && quill) {
      const handler = delta => {
        quill.updateContents(delta);
      };
      socket.on("receive-changes", handler);
  
      return () => {
        socket.off("receive-changes", handler);
      };
    }
  }, [socket, quill]);
  
  useEffect(() => {
    if (socket && quill) {
      const handler = (delta, oldDelta, source) => {
        if (source === 'user') {
          socket.emit('send-changes', delta);
        }
      };
  
      quill.on('text-change', handler);
  
      return () => {
        quill.off('text-change', handler);
      };
    }
  }, [socket, quill]);

  // Set up Quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = ''; // Clear wrapper content
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new Quill(editor, { theme: 'snow', modules: { toolbar: toolbarOptions } });
    setQuill(q);
  }, []);


  
  return (
  <div className="container" ref={wrapperRef}>

  </div>)
};

export default TextEditor;
