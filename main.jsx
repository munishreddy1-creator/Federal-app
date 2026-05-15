import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoanCalculator from './pages/LoanCalculator.jsx';
import UnderwriterSummary from './pages/UnderwriterSummary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanCalculator />} />
        <Route path="/underwriter-summary" element={<UnderwriterSummary />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
