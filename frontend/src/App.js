import React from "react";
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import LoginPage from "./pages/Login";
import AuthGuard from "./components/AuthGuard";
import './App.css'
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <AuthGuard>
          <Main />
        </AuthGuard>

      } />
    </Routes>
  )
}
