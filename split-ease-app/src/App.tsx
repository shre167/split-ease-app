import React from 'react';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import LoginFooter from './components/LoginFooter';
import './App.css'; // your global styles here

function App() {
  return (
    <div className="app-page">
      <LoginHeader />
      <LoginForm />
      <LoginFooter />
    </div>
  );
}

export default App;
