import TextEditor from "./TextEditor.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect to a new document */}
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />

        {/* Route for TextEditor */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;