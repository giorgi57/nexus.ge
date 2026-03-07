import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const workerGrid   = document.getElementById('workerGrid');
const noResults    = document.getElementById('noResults');
const workerSearch = document.getElementById('workerSearch');
const catFilter    = document.getElementById('catFilter');

let allWorkers = [];

// URL კატეგორია
const urlCat = new URLSearchParams(window.location.search).get('cat');
if (urlCat && catFilter) catFilter.value = urlCat;

async function loadWorkers() {
    try {
        const q = query(collection(db, 'workers'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        allWorkers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        allWorkers.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        renderWorkers();
    } catch (err) {
        console.error(err);
        workerGrid.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;">⚠️ ჩატვირთვა ვერ მოხერხდა</p>';
    }
}

function renderWorkers() {
    const search = workerSearch?.value.trim().toLowerCase() || '';
    const cat    = catFilter?.value || '';

    const filtered = allWorkers.filter(w => {
        const matchName = w.name?.toLowerCase().includes(search);
        const matchCat  = cat ? (w.cats || []).includes(cat) : true;
        return matchName && matchCat;
    });

    workerGrid.innerHTML = '';
    noResults.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach((w, i) => {
        const card = document.createElement('div');
        card.className = 'worker-row';
        card.style.animationDelay = `${i * 0.05}s`;

        const hasPhoto = w.photo && w.photo.length > 10;
        const photoEl  = hasPhoto
            ? `<img src="${w.photo}" class="worker-row-photo" alt="${w.name}">`
            : `<div class="worker-row-avatar">${w.name?.charAt(0) || '?'}</div>`;

        const cats = (w.cats || []).map(c => `<span class="mini-tag">${c}</span>`).join('');
        const langs = (w.langs || []).join(' · ');

        card.innerHTML = `
            <div class="worker-row-left">
                ${photoEl}
                <div class="worker-row-info">
                    <h3>${w.name}</h3>
                    <div class="worker-row-cats">${cats}</div>
                    ${langs ? `<p class="worker-row-langs">🗣 ${langs}</p>` : ''}
                </div>
            </div>
            <div class="worker-row-right">
                <button class="info-btn" onclick="openWorker('${w.id}')">ვრცლად ›</button>
                <a href="tel:${w.phone}" class="call-btn-sm">📞 დარეკვა</a>
            </div>
        `;
        workerGrid.appendChild(card);
    });
}

// Modal გახსნა
window.openWorker = function(id) {
    const w = allWorkers.find(x => x.id === id);
    if (!w) return;

    const hasPhoto = w.photo && w.photo.length > 10;
    const cats  = (w.cats  || []).map(c => `<span class="modal-tag">${c}</span>`).join('');
    const langs = (w.langs || []).join(' · ');

    document.getElementById('modalContent').innerHTML = `
        ${hasPhoto ? `<img src="${w.photo}" class="modal-photo" alt="${w.name}">` : `<div class="modal-avatar">${w.name?.charAt(0) || '?'}</div>`}
        <div class="modal-body">
            <h2 class="modal-name">${w.name}</h2>
            <div class="modal-tags">${cats}</div>
            ${langs ? `<p class="modal-langs">🗣 ${langs}</p>` : ''}
            ${w.desc ? `<p class="modal-desc">${w.desc}</p>` : ''}
            <a href="tel:${w.phone}" class="modal-call-btn">📞 ${w.phone}</a>
        </div>
    `;
    document.getElementById('workerModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeModal = function(e) {
    if (e.target === document.getElementById('workerModal')) {
        document.getElementById('workerModal').style.display = 'none';
        document.body.style.overflow = '';
    }
};

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.getElementById('workerModal').style.display = 'none';
        document.body.style.overflow = '';
    }
});

if (workerSearch) workerSearch.addEventListener('input', renderWorkers);
if (catFilter)    catFilter.addEventListener('change', renderWorkers);

loadWorkers();
