import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { PortfolioList  } from './PortfolioList';
import type { Portfolio } from './PortfolioList';
import { HoldingsList } from './HoldingsList';

function App(){
  const[token, updateToken] = useState<string | null>(() => localStorage.getItem("token"));
  const[selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const[showRegister, setShowRegister] = useState(false);

  function setToken(newToken: string | null) {
    if (newToken === null) {
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", newToken);
    }
    updateToken(newToken);
  }

  function logout() {
    setSelectedPortfolio(null);
    setToken(null);
  }

  if(token === null){
    if (showRegister) {
      return (
        <RegisterPage
          onRegistered={setToken}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return <LoginPage onLogin={setToken} onShowRegister={() => setShowRegister(true)} />;
  }

  if(selectedPortfolio === null){
    return <PortfolioList token={token} onSelect={setSelectedPortfolio} onUnauthorized={logout} onLogout={logout} />;
  }

   return (
    <HoldingsList
      token={token}
      portfolio={selectedPortfolio}
      onBack={() => setSelectedPortfolio(null)}
      onUnauthorized={logout}
      onLogout={logout}
    />
   );
}

export default App