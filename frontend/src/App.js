import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContentPlanner from "./components/ContentPlanner";

function App() {
  return (
    <div className="App min-h-screen bg-[#fffaf1]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ContentPlanner />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;