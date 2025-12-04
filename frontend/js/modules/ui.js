/* ===========================
    ui.js — UI Components & Helpers
    ---------------------------
    Відповідає за: Модалки, Тости, Скрол, Гамбургер.
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
    // Додаємо іконку для кращої візуалізації
    const icon = type === 'error' ? '<i class="fas fa-times-circle"></i>' : '<i class="fas fa-check-circle"></i>';
    el.className = 'toast ' + (type === 'error' ? 'error' : type);
    el.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;

    container.appendChild(el);

    // Автоматичне видалення через 3 сек
    setTimeout(() => {
        // Додаємо клас для анімації зникнення (якщо ви його додасте в CSS)
        // el.classList.add('fade-out'); 
        el.remove();
    }, 3000);
}

// --- UI: Modals (Core Logic) ---

// 1. Відкриття (використовується в HTML як openModal('id'))
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        // 💡 ВИПРАВЛЕНО: Використовуємо клас 'active' для CSS-анімацій
        modal.classList.add('active'); 
        document.body.style.overflow = 'hidden'; // Заборона скролу під модалкою
    } else {
        console.warn(`[UI] Modal with ID "${id}" not found.`);
    }
}

// 2. Закриття конкретного вікна
export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        // 💡 ВИПРАВЛЕНО: Використовуємо клас 'active'
        modal.classList.remove('active'); 
        // Перевіряємо, чи немає інших відкритих модалок, перш ніж увімкнути скрол
        setTimeout(() => {
             if (document.querySelectorAll('.modal-overlay.active').length === 0) {
                 document.body.style.overflow = '';
             }
        }, 300); // Час має відповідати тривалості CSS-анімації
    }
}

// 3. Закриття ВСІХ вікон (корисно при ресетах)
export function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    // Увімкнення скролу
    document.body.style.overflow = ''; 
}

// Хелпер: Закриття по кліку на темний фон
function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
}

// --- INIT: Global UI Listeners ---
export function initModalLogic() {
    // 1. Слухач на кнопки "Хрестик" (class="modal-close")
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) closeModal(modal.id); // Викликаємо closeModal за ID
        });
    });

    // 2. Слухач на клік по фону (Overlay)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', closeModalOnOutsideClick);
    });
    
    // 3. Слухач на Escape для закриття
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Закриваємо лише верхню модалку
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// --- UI: Hamburger Menu (Mobile) ---
export function setupHamburger() {
    const hamb = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-primary');

    if (hamb && nav) {
        hamb.addEventListener('click', () => {
            // 💡 ВИПРАВЛЕНО: Використовуємо клас 'active' для керування меню
            hamb.classList.toggle('active');
            nav.classList.toggle('active');
            
            // Якщо вам потрібна проста логіка display:
            // const isVisible = nav.style.display === 'flex';
            // nav.style.display = isVisible ? 'none' : 'flex';
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
                const hamb = document.querySelector('.hamburger');

                // Припускаємо, що мобільний режим, якщо елементи існують
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (hamb) hamb.classList.remove('active');
                }
            }
        });
    });
}