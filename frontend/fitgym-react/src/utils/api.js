// src/utils/api.js
export const BASE_URL = 'http://127.0.0.1:8000';

export function getToken() {
    try {
        return JSON.parse(localStorage.getItem('fp_token'));
    } catch {
        return null;
    }
}

// Універсальна функція для захищених запитів
export async function authRequest(endpoint, method = 'GET', body = null) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (res.status === 204) return true;
    
    // Якщо помилка
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.detail || Object.values(data).flat().join(', ') || `Error ${res.status}`;
        throw new Error(msg);
    }
    
    return res.json();
}

// Для публічних запитів (тренери, плани)
export async function publicRequest(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
}