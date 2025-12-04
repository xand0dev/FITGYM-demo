/* ===========================
    api.js — "Офіціант" (Логіка API)
    =========================== */

export const BASE_URL = 'http://127.0.0.1:8000';

/* =========================================
    ДОПОМІЖНА ЛОГІКА
    ========================================= */

/**
 * Отримує токен (рядок) з localStorage. 
 * Якщо у вас JWT, то це буде сам токен.
 */
export function getToken() {
    try {
        // Припускаємо, що в localStorage зберігається лише сам токен (рядок).
        // Якщо у вас зберігається об'єкт, вам потрібен `JSON.parse` та доступ до поля.
        const tokenData = localStorage.getItem('fp_token'); 
        
        // Якщо в localStorage зберігається об'єкт, як у вашому прикладі (_getToken), використовуйте:
        if (tokenData) {
             const data = JSON.parse(tokenData);
             // Припускаємо, що токен зберігається у полі 'token' або є самим значенням.
             return data.token || data; 
        }
        return null;
    } catch {
        return null;
    }
}


/* --- Private Error Handler --- */
async function _handleError(response) {
    let errorMsg = `Помилка ${response.status}: ${response.statusText}`;
    
    // Спробуємо прочитати JSON
    try {
        const data = await response.json();
        if (data.detail) {
            errorMsg = data.detail;
        } else if (Object.keys(data).length > 0) {
            // Обробка помилок валідації по полях
            const allErrors = Object.values(data).flat();
            if (allErrors.length > 0) errorMsg = allErrors.join(', ');
        }
    } catch (e) {
        // Якщо JSON немає, залишаємо базове повідомлення
    }

    // Для 401 завжди повертаємо стандартизовану помилку
    if (response.status === 401) {
        throw new Error('Не авторизовано. Спробуйте увійти знову.');
    }

    throw new Error(errorMsg);
}

/* =========================================
    ПУБЛІЧНІ ЗАПИТИ (Без Токена)
    ========================================= */

/**
 * GET запит (публічний)
 */
export async function fetchPublicData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
        await _handleError(response);
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

    if (!response.ok) {
        await _handleError(response);
    }
    return await response.json();
}

/* =========================================
    ЗАХИЩЕНІ ЗАПИТИ (З Bearer Токеном)
    ========================================= */

/**
 * Головна функція для виконання захищених запитів.
 * @param {string} endpoint - API-маршрут.
 * @param {string} method - Метод HTTP (GET, POST, PUT, DELETE).
 * @param {object|null} body - Тіло запиту.
 * @returns {Promise<any>}
 */
async function executeAuthRequest(endpoint, method = 'GET', body = null) {
    const token = getToken();
    if (!token) throw new Error('Токен автентифікації відсутній.');

    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Уніфікований Bearer формат, рекомендований для JWT/OAuth
            'Authorization': `Bearer ${token}` 
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Успішне видалення (204 No Content)
    if (method === 'DELETE' && response.status === 204) {
        return true; 
    }
    
    if (!response.ok) {
        await _handleError(response);
    }

    // Для GET/POST/PUT, які повертають тіло
    if (response.status === 200 || response.status === 201) {
         try {
            return await response.json();
         } catch(e) {
             // Може трапитися, якщо API не повертає тіло, але має 200/201
             return true; 
         }
    }
    
    // Для DELETE, який може повернути 200 (хоча має бути 204)
    return true; 
}


export async function getAuthData(endpoint) {
    return executeAuthRequest(endpoint, 'GET');
}

export async function postAuthData(endpoint, body) {
    return executeAuthRequest(endpoint, 'POST', body);
}

/**
 * НОВЕ: Захищений запит для оновлення (наприклад, для адмінки)
 */
export async function putAuthData(endpoint, body) {
    return executeAuthRequest(endpoint, 'PUT', body);
}

export async function deleteAuthData(endpoint) {
    return executeAuthRequest(endpoint, 'DELETE');
}