import React, { useEffect, useState } from 'react';

// Error page options with weights (same as backend)
const ERROR_PAGES = [
  {
    name: 'apache-403',
    title: '403 Forbidden',
    content: (
      <>
        <h1>Forbidden</h1>
        <p>You don't have permission to access this resource.</p>
        <hr />
        <address>Apache/2.4.41 (Ubuntu) Server at {window.location.hostname} Port 80</address>
      </>
    ),
    weight: 40
  },
  {
    name: 'apache-404', 
    title: '404 Not Found',
    content: (
      <>
        <h1>Not Found</h1>
        <p>The requested URL was not found on this server.</p>
        <hr />
        <address>Apache/2.4.41 (Ubuntu) Server at {window.location.hostname} Port 80</address>
      </>
    ),
    weight: 30
  },
  {
    name: 'nginx-403',
    title: '403 Forbidden',
    content: (
      <>
        <h1>403 Forbidden</h1>
        <p>nginx/1.18.0 (Ubuntu)</p>
      </>
    ),
    weight: 20
  },
  {
    name: 'maintenance',
    title: 'Service Temporarily Unavailable',
    content: (
      <>
        <h1>Service Temporarily Unavailable</h1>
        <p>The server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.</p>
        <hr />
        <address>Apache/2.4.41 (Ubuntu) Server at {window.location.hostname} Port 80</address>
      </>
    ),
    weight: 10
  }
];

// Weighted random selection
function selectRandomErrorPage() {
  const totalWeight = ERROR_PAGES.reduce((sum, page) => sum + page.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const page of ERROR_PAGES) {
    random -= page.weight;
    if (random <= 0) {
      return page;
    }
  }
  
  return ERROR_PAGES[0]; // Fallback
}

export const Home: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState(() => selectRandomErrorPage());

  // Set document title to match error page
  useEffect(() => {
    document.title = selectedPage.title;
    
    // Reset to default title on unmount
    return () => {
      document.title = 'Multi-Banking Panel';
    };
  }, [selectedPage.title]);

  return (
    <>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          background-color: white;
          margin: 40px;
          color: black;
        }
        h1 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        p {
          margin-bottom: 10px;
          line-height: 1.4;
        }
        hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 20px 0;
        }
        address {
          font-style: italic;
          font-size: 12px;
          color: #666;
          margin-top: 20px;
        }
      `}</style>
      
      <div style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'white',
        margin: '40px',
        color: 'black',
        minHeight: '100vh'
      }}>
        {selectedPage.content}
      </div>
    </>
  );
};
