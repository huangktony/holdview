const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function extractErrorMessage(response: Response): Promise<string> {
    try {
        const body = await response.json();
        const detail = body?.detail;

        if (typeof detail === "string") {
            return detail;
        }

        if (Array.isArray(detail) && detail.length > 0) {
            return detail.map((err) => err.msg).filter(Boolean).join("; ");
        }
    } catch {
        // response had no JSON body; fall through to generic message
    }

    return `Request failed: ${response.status}`;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string,
  onUnauthorized?: () => void
) {
    const headers: Record<string, string> = {"Content-Type": "application/json"};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}` + path, {...options, headers});

    if(!response.ok){
        if (response.status === 401 && token) {
            onUnauthorized?.();
        }
        const message = await extractErrorMessage(response);
        throw new Error(message);
    }

    return response.json();
}

export async function uploadStatement(
    portfolioId: number,
    file: File,
    token: string,
    onUnauthorized?: () => void
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
        if (response.status === 401) {
            onUnauthorized?.();
        }
        const message = await extractErrorMessage(response);
        throw new Error(message);
    }

    return response.json();
}