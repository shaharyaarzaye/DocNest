import { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from "react-router-dom";


const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const TextEditor = () => {
  const {id : documentId} = useParams();
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);


  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    })

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  
  useEffect(() => {
    if(socket == null || quill == null) return

    socket.once('load-document' , document =>{
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document' , documentId)

  }, [socket , quill , documentId])

  // Socket connection
  useEffect(() => {

    const s = io('https://effective-waffle-46xv5jpg56jf6wp-3002.app.github.dev/');
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to the server with id : ', s.id);
    });
    s.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
      alert('Failed to connect to the server. Please try again later.');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Handle incoming changes
  useEffect(() => {
    if (socket && quill) {
      const handler = (delta) => {
        quill.updateContents(delta);
      };
      socket.on('receive-changes', handler);

      return () => {
        socket.off('receive-changes', handler);
      };
    }
  }, [socket, quill]);

  // Emit outgoing changes
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
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);

    const q = new Quill(editor, { theme: 'snow', modules: { toolbar: toolbarOptions } });
    q.disable()
    q.setText("Loading...")
    setQuill(q);


    return () => {
      q.off();
      q.container.remove();
    };
  }, []);

  return <div className="container" ref={wrapperRef} />;
};

export default TextEditor;
