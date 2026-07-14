import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { PortfolioList  } from './PortfolioList';
import type { Portfolio } from './PortfolioList';
import { HoldingsList } from './HoldingsList';

function App(){
  const[token, setToken] = useState<string | null>(null);
  const[selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  if(token === null){
    return <LoginPage onLogin={setToken} />;
  }
  
  if(selectedPortfolio === null){
    return <PortfolioList token={token} onSelect={setSelectedPortfolio} />;
  }

   return <HoldingsList token={token} portfolio={selectedPortfolio} />;
}

export default App