/* ===========================
   ui.js — UI Components & Helpers
   ---------------------------
   Відповідає за: Модалки, Тости, Скрол, Гамбургер.
   ВАЖЛИВО: Функції модалок (openModal) експортуються,
   але щоб працювати в HTML onclick, вони мають бути
   прив'язані до window у main.js.
   =========================== */

// --- Security: Санітизація ---
export function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// --- UI: Toast Notifications (Спливаючі повідомлення) ---
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return; // Якщо контейнера немає в HTML, виходимо

    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;

    container.appendChild(el);

    // Автоматичне видалення через 3 сек
    setTimeout(() => el.remove(), 3000);
}

// --- UI: Modals (Core Logic) ---

// 1. Відкриття (використовується в HTML як openModal('id'))
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.warn(`[UI] Modal with ID "${id}" not found.`);
    }
}

// 2. Закриття конкретного вікна
export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// 3. Закриття ВСІХ вікон (корисно при ресетах)
export function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Хелпер: Закриття по кліку на темний фон
function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

// --- INIT: Global UI Listeners ---
export function initModalLogic() {
    // 1. Слухач на кнопки "Хрестик" (class="modal-close")
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.style.display = 'none';
        });
    });

    // 2. Слухач на клік по фону (Overlay)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', closeModalOnOutsideClick);
    });
}

// --- UI: Hamburger Menu (Mobile) ---
export function setupHamburger() {
    const hamb = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-primary');

    if (hamb && nav) {
        hamb.addEventListener('click', () => {
            const isVisible = nav.style.display === 'flex';
            nav.style.display = isVisible ? 'none' : 'flex';
            // Можна додати анімацію іконки тут, якщо потрібно
        });
    }
}

// --- UI: Smooth Scroll ---
export function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });

                // Закриваємо меню на мобільному після кліку
                const nav = document.querySelector('.nav-primary');
                if (window.innerWidth <= 768 && nav) {
                    nav.style.display = 'none';
                }
            }
        });
    });
}