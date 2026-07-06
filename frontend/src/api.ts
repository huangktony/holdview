const BASE_URL = "http://localhost:8000";

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

