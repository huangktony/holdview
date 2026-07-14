import { useState, useEffect } from "react";
import { apiFetch } from "./api";
import type { Portfolio } from "./PortfolioList";


type Holding = {
    id: number;
    symbol: string;
    shares: number;
    price: number;
    mkt_value: number;
    portfolio_id: number; 
    created_at: string;
};

export function HoldingsList({token, portfolio}: {token: string; portfolio: Portfolio}){
    const[holdings, updateHoldings] = useState<Holding[]>([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState("");

    useEffect(() => {
        async function load() {
        // YOU: try/catch/finally — fetch `/portfolios/${portfolio.id}/holdings` with token
            try{
                const data = await apiFetch(`/portfolios/${portfolio.id}/holdings`, {}, token);
                updateHoldings(data);
            } catch(e){
                setError("No holdings found");
            } finally{
                setLoading(false);
            }
        }
        load();
    }, [token, portfolio.id]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <table>
            <thead>
                <tr><th>Symbol</th><th>Shares</th><th>Price</th><th>Market Value</th></tr>
            </thead>
            <tbody>
                {holdings.map((h) => (
                <tr key={h.id}>
                    <td>{h.symbol}</td>
                    <td>{h.shares}</td>
                    <td>{h.price}</td>
                    <td>{h.mkt_value}</td>
                </tr>
                ))}
            </tbody>
        </table>
    );
}
