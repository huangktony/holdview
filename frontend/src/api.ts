const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string
) {
    const headers: Record<string, string> = {"Content-Type": "application/json"};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}` + path, {...options, headers});

    if(!response.ok){
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

export async function uploadStatement(
    portfolioId: number,
    file: File,
    token?: string
) {
    const headers: Record<string, string> = {};
    headers["Authorization"] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/portfolios/${portfolioId}/statements`, {
        method: "POST", 
        headers,
        body: formData,
    });

    if(!response.ok){
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}