
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SaasPage from './pages/SaasPage';
import './firebase'; // This imports and initializes Firebase


function App() {
  return (
    <div className="App">
      <SaasPage />
    </div>
  );
}

export default App;
