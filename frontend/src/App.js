import React, { useState } from 'react';
import './App.css';
import CompanyList from './components/CompanyLists'
import StockChart from './components/StockChart';

function App() {
  const [selectedCompany, setSelectedCompany] = useState('Apple'); // Set a default company

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Market Dashboard</h1>
      </header>
      <div className="dashboard-container">
        <CompanyList onSelectCompany={setSelectedCompany} />
        <main className="main-panel">
          {selectedCompany ? (
            <StockChart companyName={selectedCompany} />
          ) : (
            <p>Select a company to view its stock data.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;