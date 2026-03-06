document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. THEME =====
    const themeBtn = document.getElementById('themeToggle');

    function applyTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        if (themeBtn) themeBtn.textContent = dark ? '☀️' : '🌙';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            themeBtn.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    applyTheme(localStorage.getItem('theme') === 'dark');


    // ===== 2. LANGUAGE SWITCHER =====
    const langSwitch = document.getElementById('langSwitch');

    const translations = {
        ka: {
            hero:        'იპოვნე ხელოსანი <span>Nexus</span>-ზე',
            search:      'ძებნა',
            placeholder: 'რა მომსახურება გჭირდებათ?',
            home:        'მთავარი',
            workers:     'ხელოსნები',
            add:         'დამატება',
            pageTitle:   'ხელოსნების სია',
            cards: ['🏠 სრული რემონტი','⚡ ელექტროობა','🚿 სანტექნიკა','🧱 გიფსოკარდონი','📐 კაფელი','🌡️ გათბობა']
        },
        en: {
            hero:        'Find a Pro on <span>Nexus</span>',
            search:      'Search',
            placeholder: 'What service do you need?',
            home:        'Home',
            workers:     'Workers',
            add:         'Add Post',
            pageTitle:   'Workers List',
            cards: ['🏠 Full Renovation','⚡ Electrical','🚿 Plumbing','🧱 Drywall','📐 Tiling','🌡️ Heating']
        },
        ru: {
            hero:        'Найдите мастера на <span>Nexus</span>',
            search:      'Поиск',
            placeholder: 'Какая услуга вам нужна?',
            home:        'Главная',
            workers:     'Мастера',
            add:         'Добавить',
            pageTitle:   'Список мастеров',
            cards: ['🏠 Полный ремонт','⚡ Электрика','🚿 Сантехника','🧱 Гипсокартон','📐 Плитка','🌡️ Отопление']
        }
    };

    function applyLang(lang) {
        const t = translations[lang];
        if (!t) return;

        const el = (id) => document.getElementById(id);

        if (el('heroTitle'))   el('heroTitle').innerHTML     = t.hero;
        if (el('searchBtn'))   el('searchBtn').textContent   = t.search;
        if (el('searchInput')) el('searchInput').placeholder = t.placeholder;
        if (el('navHome'))     el('navHome').textContent     = t.home;
        if (el('navWorkers'))  el('navWorkers').textContent  = t.workers;
        if (el('navAdd'))      el('navAdd').textContent      = t.add;
        if (el('pageTitle'))   el('pageTitle').textContent   = t.pageTitle;

        // კატეგორიის ბარათები — index.html
        document.querySelectorAll('.grid-container .card').forEach((card, i) => {
            if (t.cards[i] !== undefined) card.textContent = t.cards[i];
        });

        localStorage.setItem('lang', lang);
    }

    // ენა ყოველთვის გამოიყენება (langSwitch-ის გარეშეც)
    const savedLang = localStorage.getItem('lang') || 'ka';
    applyLang(savedLang);

    if (langSwitch) {
        langSwitch.value = savedLang;
        langSwitch.addEventListener('change', (e) => applyLang(e.target.value));
    }


    // ===== 3. HOME SEARCH BUTTON =====
    const searchBtn   = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value.trim();
            if (q) location.href = 'workers.html?cat=' + encodeURIComponent(q);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }

});