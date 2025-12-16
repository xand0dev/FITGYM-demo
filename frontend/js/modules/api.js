/* ===========================
   api.js — "Офіціант" (Логіка API)
   =========================== */

export const BASE_URL = 'http://127.0.0.1:8000';

/* --- Private Helper --- */
function _getToken() {
    try {
        return JSON.parse(localStorage.getItem('fp_token'));
    } catch {
        return null;
    }
}

/**
 * GET запит (публічний)
 */
export async function fetchPublicData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API Error (${endpoint}): ${response.statusText}`);
    }
    return await response.json();
}

/**
 * POST запит (публічний - логін/реєстрація)
 */
export async function postApiData(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMsg = data.detail || Object.values(data).flat().join(', ') || `Помилка ${response.status}`;
        throw new Error(errorMsg);
    }
    return data;
}

/* =========================================
   PROTECTED REQUESTS (З Токеном)
   ========================================= */

/**
 * GET запит з токеном (використовується для /api/me/)
 * ВАЖЛИВО: Перейменовано для сумісності з auth.js
 */
export async function getApiData(endpoint) {
    const token = _getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    });

    if (response.status === 401) throw new Error('Unauthorized');
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    return await response.json();
}

/**
 * POST запит з токеном (Бронювання)
 */
export async function postAuthData(endpoint, body) {
    const token = _getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        let errorMsg = 'Помилка виконання запиту';
        if (data.detail) {
            errorMsg = data.detail;
        } else {
            const allErrors = Object.values(data).flat();
            if (allErrors.length > 0) errorMsg = allErrors.join(', ');
        }
        throw new Error(errorMsg);
    }
    return data;
}

/**
 * DELETE запит (Скасування)
 */
export async function deleteAuthData(endpoint) {
    const token = _getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        }
    });

    if (response.status === 204) {
        return true;
    }

    if (!response.ok) {
        let errorMsg = `Помилка ${response.status}`;
        try {
            const data = await response.json();
            if (data.detail) errorMsg = data.detail;
        } catch (e) {}
        throw new Error(errorMsg);
    }

    return true;
}