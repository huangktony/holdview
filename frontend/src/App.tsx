import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { PortfolioList  } from './PortfolioList';

function App(){
  const[token, setToken] = useState<string | null>(null);

  if(token === null){
    return <LoginPage onLogin={setToken} />;
  }

  return <PortfolioList token={token} />;

}

export default App