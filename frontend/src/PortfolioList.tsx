// src/PortfolioList.tsx
import { useState, useEffect, } from "react";
import { apiFetch } from "./api";

export type Portfolio = {
  id: number;
  name: string;
};

export function PortfolioList({ token, onSelect }: { token: string; onSelect: (p: Portfolio) => void }) {
  // YOU: two pieces of state — the portfolios list, and a loading flag
  const[portfolios, updatePortfolios] = useState<Portfolio[]>([]);
  const[loading, setLoading] = useState(true);
  const[errorState, setError] = useState("");

  useEffect(() => {
    async function load() {
      // YOU: fetch GET /portfolios with the token, store result, flip loading off
      try{
        const data = await apiFetch("/portfolios", {}, token);
        updatePortfolios(data);
      } catch (e){
        setError("No portfolios found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // YOU: if loading, return a loading message
  if(loading){
    return <p>Loading...</p>
  }

  if(errorState){
    return <p>{errorState}</p>
  }

  return (
    <div>
      <h2>Your Portfolios</h2>
      <ul>
        {portfolios.map((portfolio) => (
          <li key={portfolio.id}>
            <button onClick={() => onSelect(portfolio)}>{portfolio.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}