import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No root element found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);