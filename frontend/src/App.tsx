import { useState } from 'react';
import { LoginPage } from './LoginPage';

function App(){
  const[token, setToken] = useState<string | null>(null);

  if(token === null){
    return <LoginPage onLogin={setToken} />;
  }

  return <p>Logged in!</p>;

}

export default App