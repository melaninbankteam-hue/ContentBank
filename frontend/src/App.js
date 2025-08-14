import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContentPlanner from "./components/ContentPlanner";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen bg-[#fffaf1]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ContentPlanner />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;