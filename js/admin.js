import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    collection, query, where, onSnapshot,
    doc, updateDoc, deleteDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginScreen = document.getElementById('loginScreen');
const adminPanel  = document.getElementById('adminPanel');
const emailInput  = document.getElementById('adminEmail');
const pwInput     = document.getElementById('adminPassword');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');

// ===== Auth State =====
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        adminPanel.style.display  = 'block';
        loadAll();
    } else {
        loginScreen.style.display = 'flex';
        adminPanel.style.display  = 'none';
    }
});

// ===== Login =====
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const pw    = pwInput.value;
    loginError.style.display = 'none';
    loginBtn.textContent = '⏳...';
    loginBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, pw);
    } catch (err) {
        loginError.style.display = 'block';
        loginError.textContent = '❌ არასწორი ემაილი ან პაროლი';
        loginBtn.textContent = 'შესვლა';
        loginBtn.disabled = false;
    }
});

pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') pwInput.focus(); });

// ===== Logout =====
logoutBtn.addEventListener('click', () => signOut(auth));

// ===== Tabs =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ===== Load all posts =====
function loadAll() {
    listenStatus('pending',  'pendingGrid',  (list) => {
        document.getElementById('statPending').textContent  = list.length;
        document.getElementById('badgePending').textContent = list.length;
    });
    listenStatus('approved', 'approvedGrid', (list) => {
        document.getElementById('statApproved').textContent = list.length;
    });
    listenStatus('rejected', 'rejectedGrid', (list) => {
        document.getElementById('statRejected').textContent = list.length;
    });
}

function listenStatus(status, gridId, onUpdate) {
    const q = query(
        collection(db, 'workers'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(list);
        renderGrid(list, gridId, status);
    });
}

function renderGrid(list, gridId, status) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = '<p class="no-items">განცხადება არ არის</p>';
        return;
    }

    list.forEach(w => {
        const card  = document.createElement('div');
        card.className = 'admin-card';

        const photo = w.photoURL
            ? `<img src="${w.photoURL}" class="admin-photo" alt="${w.name}">`
            : `<div class="admin-photo-placeholder">👤</div>`;

        const cats  = (w.cats  || []).join(', ');
        const langs = (w.langs || []).join(' · ');
        const date  = w.createdAt ? new Date(w.createdAt.seconds * 1000).toLocaleDateString('ka-GE') : '';
        const desc  = w.desc ? `<p class="admin-desc">"${w.desc}"</p>` : '';

        let actions = '';
        if (status === 'pending') {
            actions = `
                <button class="action-btn approve" onclick="approveWorker('${w.id}')">✅ დამტკიცება</button>
                <button class="action-btn reject"  onclick="rejectWorker('${w.id}')">❌ უარყოფა</button>
            `;
        } else if (status === 'approved') {
            actions = `
                <button class="action-btn reject"  onclick="rejectWorker('${w.id}')">❌ უარყოფა</button>
                <button class="action-btn delete"  onclick="deleteWorker('${w.id}')">🗑 წაშლა</button>
            `;
        } else {
            actions = `
                <button class="action-btn approve" onclick="approveWorker('${w.id}')">✅ დამტკიცება</button>
                <button class="action-btn delete"  onclick="deleteWorker('${w.id}')">🗑 წაშლა</button>
            `;
        }

        card.innerHTML = `
            <div class="admin-card-top">
                ${photo}
                <div class="admin-card-info">
                    <h3>${w.name}</h3>
                    <p class="admin-cats">${cats}</p>
                    <p class="admin-phone">📞 ${w.phone}</p>
                    ${langs ? `<p class="admin-langs">🗣 ${langs}</p>` : ''}
                    ${desc}
                    <small class="admin-date">${date}</small>
                </div>
            </div>
            <div class="admin-actions">${actions}</div>
        `;
        grid.appendChild(card);
    });
}

window.approveWorker = async (id) => {
    await updateDoc(doc(db, 'workers', id), { status: 'approved' });
};
window.rejectWorker = async (id) => {
    await updateDoc(doc(db, 'workers', id), { status: 'rejected' });
};
window.deleteWorker = async (id) => {
    if (confirm('დარწმუნებული ხართ?')) {
        await deleteDoc(doc(db, 'workers', id));
    }
};