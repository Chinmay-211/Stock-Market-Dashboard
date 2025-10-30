
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://stock-dashboard-backend-2v9jkpqal-chinmay-211s-projects.vercel.app';


const CompanyList = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/companies`)
      .then(response => {
        setCompanies(response.data.companies);
      })
      .catch(error => {
        setError('Could not load companies. Is the backend server running?');
        console.error("Error fetching companies:", error);
      });
  }, []);

  if (error) {
    return <aside className="left-panel"><p className="error">{error}</p></aside>;
  }

  return (
    <aside className="left-panel">
      <h2>Companies</h2>
      <ul className="company-list">
        {companies.map(company => (
          <li key={company} onClick={() => onSelectCompany(company)}>
            {company}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CompanyList;