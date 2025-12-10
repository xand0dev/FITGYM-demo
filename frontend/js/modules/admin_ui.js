/* ===========================
    admin_ui.js — UI Components & Helpers for Admin Panel
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
    if (!container) return;

    const el = document.createElement('div');
    const icon = type === 'error' ? '<i class="fas fa-times-circle"></i>' : '<i class="fas fa-check-circle"></i>';
    el.className = 'toast ' + (type === 'error' ? 'error' : type);
    el.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;

    container.appendChild(el);

    // Автоматичне видалення через 3 сек
    setTimeout(() => el.remove(), 3000);
}

// --- UI: Modals (Core Logic) ---

export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    } else {
        console.warn(`[UI] Modal with ID "${id}" not found.`);
    }
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active'); 

        // 💡 ВИПРАВЛЕННЯ: Відновлюємо скрол з таймаутом (300 мс = тривалість CSS-анімації)
        setTimeout(() => {
             // Перевіряємо, чи немає інших відкритих модалок
             if (document.querySelectorAll('.modal-overlay.active').length === 0) {
                 document.body.style.overflow = ''; 
             }
        }, 300); 
    }
}

export function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = ''; 
}


// --- INIT: Global UI Listeners ---
export function initModalLogic() {
    // 1. Слухач на кнопки "Хрестик" (class="modal-close")
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) closeModal(modal.id); 
        });
    });

    // 2. Слухач на клік по фону (Overlay)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal-overlay')) {
                closeModal(event.target.id);
            }
        });
    });
    
    // 3. Слухач на Escape для закриття
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}


// --- АДМІН-СПЕЦИФІЧНА ЛОГІКА ---

/**
 * Ініціалізує логіку перемикання вкладок (Sidebar)
 * і викликає initAdminPage з admin.js.
 * @param {function} adminInitFunction - initAdminPage з admin.js
 */
export function initAdminTabs(adminInitFunction) {
    initModalLogic(); // Базова логіка модалок

    const tabs = document.querySelectorAll('.menu-item[data-tab]');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Активний клас для меню
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 2. Показати потрібну секцію
            const targetId = tab.dataset.tab;
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // 3. Змінити заголовок
            pageTitle.textContent = tab.textContent.trim();

            // 4. FullCalendar redraw bugfix
            if (targetId === 'section-schedule') {
                if (typeof FullCalendar !== 'undefined' && adminInitFunction) {
                     setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
                }
            }
        });
    });

    // Викликаємо ініціалізацію адмін-логіки
    if (typeof FullCalendar !== 'undefined' && adminInitFunction) {
        adminInitFunction();
    }
}