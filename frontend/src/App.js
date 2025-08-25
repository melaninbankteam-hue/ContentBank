import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContentPlanner from "./components/ContentPlanner";
import LoginForm, { AuthProvider, useAuth } from "./components/LoginForm";
import { Toaster } from "./components/ui/sonner";

const AppContent = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <ContentPlanner />;
};

function App() {
  return (
    <div className="App min-h-screen bg-[#fffaf1]">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppContent />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;