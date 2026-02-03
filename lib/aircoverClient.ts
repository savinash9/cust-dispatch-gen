type TokenRecord = { token: string; expiresAt: number };

let tokenRecord: TokenRecord | null = null;

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function loginAircover() {
  const baseUrl = process.env.AIRCOVER_BASE_URL;
  const username = process.env.AIRCOVER_USERNAME;
  const password = process.env.AIRCOVER_PASSWORD;
  if (!baseUrl || !username || !password) {
    throw new Error("Missing Aircover credentials in environment.");
  }

  if (tokenRecord && tokenRecord.expiresAt > Date.now()) {
    return tokenRecord.token;
  }

  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error(`Aircover login failed with ${response.status}`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Aircover login did not return a token.");
  }

  tokenRecord = { token: data.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.token;
}

export async function fetchMeetings(start: string, end: string) {
  const baseUrl = process.env.AIRCOVER_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing Aircover base URL.");
  }
  const token = await loginAircover();
  const response = await fetch(`${baseUrl}/meetings/?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error(`Aircover meetings failed with ${response.status}`);
  }
  return response.json();
}
