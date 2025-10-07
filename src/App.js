// src/App.js

import React from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      {/* These divs create the glowing aurora background effect */}
      <div className="aurora aurora-1"></div>
      <div className="aurora aurora-2"></div>
      <div className="aurora aurora-3"></div>
      
      <Navbar />
      <main className="main-content">
        <Chat />
      </main>
    </div>
  );
}

export default App;