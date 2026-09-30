import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { PortfolioList  } from './PortfolioList';
import type { Portfolio } from './PortfolioList';
import { HoldingsList } from './HoldingsList';

function App(){
  const[token, setToken] = useState<string | null>(null);
  const[selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const[showRegister, setShowRegister] = useState(false);

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
    return <PortfolioList token={token} onSelect={setSelectedPortfolio} />;
  }

   return (
    <HoldingsList 
      token={token} 
      portfolio={selectedPortfolio} 
      onBack={() => setSelectedPortfolio(null)}
    />
   );
}

export default App