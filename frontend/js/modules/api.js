/* ===========================
   api.js — "Офіціант" (Логіка API)
   =========================== */

export const BASE_URL = 'http://127.0.0.1:8000';

/**
 * Обертка для fetch, щоб обробляти помилки
 * @param {string} endpoint - Шлях до API (напр. '/api/instructors/')
 * @returns {Promise<any>} - JSON-дані
 */
export async function fetchPublicData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`Помилка API (${endpoint}): ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Надсилає POST-запит (для логіну/реєстрації)
 * @param {string} endpoint - Шлях до API (напр. '/api/login/')
 * @param {object} body - Дані для відправки
 * @returns {Promise<any>} - JSON-дані
 */
export async function postApiData(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
        // Викидуємо помилку з бекенду (напр. "user already exists")
        const errorMsg = Object.values(data).join(' ');
        throw new Error(errorMsg || `Помилка ${response.status} на ${endpoint}`);
    }

    return data;
}

// TODO (Етап 3): Додати 'fetchWithToken' для захищених запитів