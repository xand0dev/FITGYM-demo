/* ===========================
   ui.js — "Декоратор" (Логіка UI)
   =========================== */

// --- Security Helper ---
export function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    // ВИПРАВЛЕНО: '&#39;' - це правильний код для апострофа
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// --- Toast Notifications ---
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// --- Modal Logic ---
export function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

/**
 * Налаштовує всі кнопки закриття модалок
 */
export function initModalLogic() {
    // Кнопки "X"
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.style.display = 'none';
        });
    });
    // Клік поза вікном
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', closeModalOnOutsideClick);
    });
}

// --- Header / Nav Logic ---

/**
 * Оновлює хедер (Привіт, Юзер / Вхід)
 */
export function updateAuthArea() {
    const area = document.getElementById('authArea');
    const reviewBtn = document.getElementById('openReviewModalBtn');
    if (!area) return;

    // Ми імпортуємо функції з auth.js, щоб уникнути циклічної залежності
    const token = JSON.parse(localStorage.getItem('fp_token') || 'null');
    const userName = JSON.parse(localStorage.getItem('fp_user_name') || 'null');

    if (token && userName) {
        area.innerHTML = `
            <span style="margin-right:10px">Привіт, <b>${escapeHtml(userName)}</b></span>
            <button id="logoutBtn" class="btn btn-ghost">Вихід</button>`;
        // Нам треба "руками" навісити подію, бо window.logoutUser не існує в модулях
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('fp_token');
            localStorage.removeItem('fp_user_name');
            location.reload();
        });
        if (reviewBtn) reviewBtn.style.display = 'inline-block';
    } else {
        area.innerHTML = `
            <button class="btn btn-ghost" onclick="showModal('loginModal')">Вхід</button>
            <button class="btn btn-primary" onclick="showModal('registerModal')">Реєстрація</button>`;
        if (reviewBtn) reviewBtn.style.display = 'none';
    }

    // Прив'язуємо 'showModal' до window, щоб onclick="showModal(...)" працював
    // (Це не ідеально, але це найпростіший спосіб полагодити код, не переписуючи весь HTML)
    window.showModal = showModal;
}

/**
 * Налаштовує мобільне меню (гамбургер)
 */
export function setupHamburger() {
    const hamb = document.querySelector('.hamburger');
    if (hamb) {
        hamb.addEventListener('click', () => {
            const nav = document.querySelector('.nav-primary');
            const isVisible = nav.style.display === 'flex';
            nav.style.display = isVisible ? 'none' : 'flex';
        });
    }
}

/**
 * Налаштовує плавний скрол по якорях
 */
export function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }

            const nav = document.querySelector('.nav-primary');
            if (window.innerWidth <= 768 && nav) {
                nav.style.display = 'none';
            }
        });
    });
}