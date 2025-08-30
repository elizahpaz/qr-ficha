import React from "react";
import { Routes, Route } from 'react-router-dom';
import LandingPage from "./components/pages/LandingPage";
import Login from './components/pages/Login';
import Register from './components/pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/cadastro" element={<Register />}/>
    </Routes>
  );
}

export default App;
