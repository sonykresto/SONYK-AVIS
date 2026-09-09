import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AvisPage from './AvisPage.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<AvisPage />} />
        <Route path="*" element={<div style={{padding: 40, fontFamily: 'sans-serif'}}>Lien invalide.</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
