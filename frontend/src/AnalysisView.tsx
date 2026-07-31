import { useState, useEffect } from "react";
import { apiFetch } from "./api";
import type { Portfolio } from "./PortfolioList";

type AnalysisItem = {
    symbol: string;
    mkt_value: string;     
    pct_of_portfolio: string;
};

type Analysis = {
    total_mkt_value: string;
    items: AnalysisItem[];
};

export function AnalysisView({ token, portfolio }: { token: string; portfolio: Portfolio; refreshKey: number}) {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await apiFetch(`/portfolios/${portfolio.id}/analysis`, {}, token)
                setAnalysis(data);
            } catch(e){
                setError("No analysis found!")
            } finally{
                setLoading(false);
            }
            
        }
        load();
    }, [token, portfolio.id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!analysis) return null;  

    return (
        <div>
            <h3>Portfolio Analysis</h3>
            <h3>Total Value: ${Number(analysis.total_mkt_value)}</h3>
            {analysis.items.map((item) => {
                const pct = Number(item.pct_of_portfolio) * 100;
                return (
                    <div key={item.symbol} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ width: "60px", fontWeight: "bold" }}>{item.symbol}</span>
                        <div style={{ flex: 1, backgroundColor: "#333", height: "24px", borderRadius: "4px" }}>
                            <div style={{ width: `${pct}%`, backgroundColor: "steelblue", height: "100%", borderRadius: "4px" }} />
                        </div>
                        <span style={{ width: "60px", textAlign: "right" }}>{pct.toFixed(2)}%</span>
                    </div>
                );
            })}
        </div>
    );
}