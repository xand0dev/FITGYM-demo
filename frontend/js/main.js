/* ===========================
   main.js — логіка сайту FITGYM (Односторінкова версія з AOS та Modal)
   =========================== */

/* === Toast === */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'error' ? 'error' : 'success');
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* === Modal Functions (замінює переходи на login.html/register.html) === */
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}


/* === LocalStorage helpers === */
function _get(key, def = []) {
  try { return JSON.parse(localStorage.getItem(key)) || def; }
  catch { return def; }
}
function _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* === Auth === */
function _getUsers() { return _get('fp_users', []); }
function _setUsers(u){ _set('fp_users', u); }

function registerUser(name, email, password, role = "user") {
  const users = _getUsers();
  if (users.some(u => u.email === email.toLowerCase()))
    return { ok: false, msg: 'Email вже існує' };

  users.push({ name, email: email.toLowerCase(), password, role });
  _setUsers(users);
  return { ok: true };
}

function loginUser(email, password) {
  const users = _getUsers();
  const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, msg: 'Невірний email або пароль' };
  _set('fp_current', user);
  return { ok: true, user };
}

function logoutUser() {
  localStorage.removeItem('fp_current');
  // Оновлення сторінки для відображення змін в хедері
  location.reload(); 
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('fp_current')) || null; }
  catch { return null; }
}

/* === Auth Area Update (оновлено для роботи з модальними вікнами) === */
function updateAuthArea() {
  const area = document.getElementById('authArea');
  if (!area) return;
  const cur = getCurrentUser();

  if (cur) {
    area.innerHTML = `
      <span style="margin-right:10px">Привіт, <b>${escapeHtml(cur.name)}</b></span>
      <button id="logoutBtn" class="btn btn-ghost">Вихід</button>`;
    document.getElementById('logoutBtn').onclick = logoutUser;
  } else {
    area.innerHTML = `
      <button class="btn btn-ghost" onclick="showModal('loginModal')">Вхід</button>
      <button class="btn btn-primary" onclick="showModal('registerModal')">Реєстрація</button>`;
  }
}

/* === Тренери (Дані FITGYM + AOS) === */
function populateTrainers() {
  const grid = document.getElementById('trainersGrid');
  if (!grid) return;
  const trainers = [
    { name: 'Іван Петров', spec: 'Кросфіт / Функціональний тренінг', photo: 'муж2.jpg' },
    { name: 'Олена Коваль', spec: 'Фітнес / Йога / Стретчинг', photo: 'жін2.jpg' },
    { name: 'Андрій Сидоренко', spec: 'Бодібілдинг / Персональні тренування', photo: 'муж1.png' },
  ];
  grid.innerHTML = trainers.map((p, i) => `
    <div class="trainer-card" data-aos="flip-up" data-aos-delay="${i * 150}">
      <img src="${p.photo}" alt="${p.name}">
      <div class="meta">
        <h3>${p.name}</h3>
        <p>${p.spec}</p>
      </div>
    </div>`).join('');
}

/* === Плани (Дані FITGYM + AOS) === */
function populatePlans() {
  const grid = document.getElementById('plansGrid');
  if (!grid) return;
  const plans = [
    { title: 'Місячний', price: '₴1 200', desc: 'Тривалість: 30 днів' },
    { title: 'Річний', price: '₴10 000', desc: 'Тривалість: 365 днів. Економія!' },
    { title: 'Одноразовий', price: '₴200', desc: '1 відвідування' },
  ];
  grid.innerHTML = plans.map((p, i) => `
    <div class="plan" data-aos="zoom-in" data-aos-delay="${i * 150}">
      <div class="plan-name">${p.title}</div>
      <div class="plan-desc">${p.desc}</div>
      <div class="plan-price">${p.price}</div>
      <button class="btn btn-primary" onclick="handleBuyPlan('${p.title}')">Придбати</button>
    </div>`).join('');
}

/* === Reviews (Дані FITGYM + AOS) === */
function populateReviews() {
  const el = document.getElementById('reviewsList');
  if (!el) return;

  const base = [
    { text: 'Найкращий спортзал у місті! Тренери дуже уважні та професійні.', author: 'Олена, Київ', system: true },
    { text: 'Обладнання сучасне, атмосфера чудова, мотивація на максимум!', author: 'Андрій, Львів', system: true },
  ];
  const stored = _get('fp_reviews', []);
  const all = [...base, ...stored];
  const user = getCurrentUser();

  el.innerHTML = all.map((r, i) => {
    const isOwn = user && r.author === user.name && !r.system;
    return `
      <blockquote class="review-item" data-aos="fade-up" data-aos-delay="${i * 50}">
        “${escapeHtml(r.text)}” — <b>${escapeHtml(r.author)}</b>
        ${isOwn ? `<button class="delete-review" data-index="${i}">🗑️</button>` : ''}
      </blockquote>`;
  }).join('');

  document.querySelectorAll('.delete-review').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.target.dataset.index - base.length;
      if (idx < 0) return;
      const reviews = _get('fp_reviews', []);
      reviews.splice(idx, 1);
      _set('fp_reviews', reviews);
      showToast('Відгук видалено', 'success');
      populateReviews();
    });
  });
  // Оновлення AOS після динамічного завантаження контенту
  AOS.refreshHard();
}

function setupReviewForm() {
  const form = document.getElementById('reviewForm');
  const section = document.getElementById('addReviewSection');
  if (!form || !section) return;

  const user = getCurrentUser();
  if (!user) {
    section.style.display = 'none';
    return;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return showToast('Введіть текст відгуку', 'error');

    const reviews = _get('fp_reviews', []);
    reviews.push({ text, author: user.name });
    _set('fp_reviews', reviews);
    showToast('Відгук додано!', 'success');
    document.getElementById('reviewText').value = '';
    populateReviews();
  });
}

/* === FullCalendar (Дані FITGYM) === */
function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;
  const calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "uk",
      initialView: "dayGridMonth",
      headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
      },
      buttonText: {
          today: "Сьогодні",
          month: "Місяць",
          week: "Тиждень",
          day: "День"
      },
      events: [
          { title: "Йога — Олена", start: "2025-11-06T08:00:00", end: "2025-11-06T09:00:00" },
          { title: "Кросфіт — Іван", start: "2025-11-06T18:00:00", end: "2025-11-06T19:00:00" },
          { title: "Бодібілдинг — Андрій", start: "2025-11-07T09:00:00", end: "2025-11-07T10:00:00" },
          { title: "Стретчинг — Олена", start: "2025-11-09T18:30:00", end: "2025-11-09T19:30:00" },
          { title: "Функціональний тренінг — Іван", start: "2025-11-10T19:00:00", end: "2025-11-10T20:00:00" }
      ],
      eventClick(info) {
          showToast(`Заняття: ${info.event.title}`);
      }
  });
  calendar.render();
}



function handleBuyPlan(plan){
  const user = getCurrentUser();
  if (!user) return showToast('Спершу увійдіть у систему, щоб придбати', 'error');
  showToast(`Оформлення замовлення: ${plan}`, 'success');
}

/* 🌟 NEW: Smooth Scrolling 🌟 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Закриття мобільного меню після кліку
            const nav = document.querySelector('.nav-primary');
            if (window.innerWidth <= 768) { 
               nav.style.display = 'none';
            }
        });
    });
}


/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
  // Ініціалізація AOS
  AOS.init({
    duration: 800,
    once: true // Анімація відбувається лише один раз
  });

  updateAuthArea();
  populateTrainers();
  populatePlans();
  populateReviews();
  setupReviewForm();
  initCalendar();
  setupSmoothScrolling(); // Налаштування плавного скролу

  // hamburger
  const hamb = document.querySelector('.hamburger');
  if (hamb) hamb.addEventListener('click', () => {
    const nav = document.querySelector('.nav-primary');
    nav.style.display = (nav.style.display === 'flex' || !nav.style.display || nav.style.display === '') ? 'none' : 'flex';
  });

  // Register Form Handler
  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    const conf = document.getElementById('regConfirm').value;
    const isTrainer = document.getElementById('isTrainer')?.checked;

    if (!name || !email || !pass) return showToast('Заповніть всі поля', 'error');
    if (pass !== conf) return showToast('Паролі не співпадають', 'error');

    const role = isTrainer ? 'trainer' : 'user';
    const res = registerUser(name, email, pass, role);
    if (!res.ok) return showToast(res.msg, 'error');

    showToast('Реєстрація успішна!', 'success');
    closeModal('registerModal');
    document.getElementById('regForm').reset();
  });

  // Login Form Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if (!email || !pass) return showToast('Заповніть всі поля', 'error');

    const res = loginUser(email, pass);
    if (!res.ok) return showToast(res.msg, 'error');

    showToast('Вхід успішний', 'success');
    closeModal('loginModal');
    updateAuthArea(); 
    populateReviews(); 
    document.getElementById('loginForm').reset();
  });
});