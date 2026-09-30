import { useState, useEffect } from "react";
import { apiFetch, uploadStatement } from "./api";
import type { Portfolio } from "./PortfolioList";
import { AnalysisView } from "./AnalysisView";


type Holding = {
    id: number;
    symbol: string;
    shares: number;
    price: number;
    mkt_value: number;
    portfolio_id: number; 
    created_at: string;
};

export function HoldingsList({token, portfolio, onBack}: {token: string; portfolio: Portfolio, onBack: () => void}){
    const[holdings, updateHoldings] = useState<Holding[]>([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState("");
    const[selectedFile, setSelectedFile] = useState<File | null>(null);
    const[uploading, setUploading] = useState(false);
    const[uploadError, setUploadError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const[showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        async function load() {
            try{
                const data = await apiFetch(`/portfolios/${portfolio.id}/holdings`, {}, token);
                updateHoldings(data);
                setError("");
            } catch(e){
                setError("Couldn't load holdings");
            } finally{
                setLoading(false);
            }
        }
        load();
    }, [token, portfolio.id, refreshKey]);

    async function handleUpload() {
        if(!selectedFile){
            return;
        }

        try {
            setUploading(true);
            const statement = await uploadStatement(portfolio.id, selectedFile, token);
            if (statement.status === "failed") {
                setUploadError(`Couldn't parse statement: ${statement.error_message}`);
            } else {
                setUploadError("");
                setRefreshKey(k => k + 1);
            }
        } catch {
            setUploadError("Upload Failed") ;
        } finally {
            setUploading(false);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }


    return (    
        <div>
            <button onClick={onBack}> Back to portfolios </button>
            <h2>{portfolio.name}</h2>

            <div>
                <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                />
                <button onClick={handleUpload} disabled={!selectedFile || uploading}>
                    {uploading ? "Uploading..." : "Upload statement"}
                </button>
                {uploadError && <p>{uploadError}</p>}
            </div>

            <div>
                <button onClick={() => setShowAnalysis(!showAnalysis)}>
                {showAnalysis ? "Show Holdings Table" : "Show Portfolio Analysis"}
                </button>
            </div>

            {showAnalysis ? (
                <AnalysisView token={token} portfolio={portfolio} refreshKey={refreshKey} />
            ) : (error ? <p>{error}</p> :
                holdings.length === 0 ? <p>There are no current holdings</p> : (
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
            ))}

        </div>
    );
}
