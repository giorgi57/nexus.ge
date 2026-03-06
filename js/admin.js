import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    collection, onSnapshot, doc, updateDoc, deleteDoc, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginScreen = document.getElementById('loginScreen');
const adminPanel  = document.getElementById('adminPanel');
const emailInput  = document.getElementById('adminEmail');
const pwInput     = document.getElementById('adminPassword');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');

// ===== სისტემაში შესვლის შემოწმება =====
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        adminPanel.style.display  = 'block';
        loadAllData();
    } else {
        loginScreen.style.display = 'flex';
        adminPanel.style.display  = 'none';
    }
});

// ===== ლოგინი =====
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

// ===== გამოსვლა =====
logoutBtn.addEventListener('click', () => signOut(auth));

// ===== მონაცემების წამოღება (ინდექსების გარეშე) =====
function loadAllData() {
    const q = query(collection(db, 'workers'));
    
    onSnapshot(q, (snap) => {
        const allWorkers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 1. Pending (მოლოდინში)
        const pending = allWorkers.filter(w => w.status === 'pending');
        renderGrid(pending, 'pendingGrid', 'pending');
        document.getElementById('statPending').textContent = pending.length;
        document.getElementById('badgePending').textContent = pending.length;

        // 2. Approved (დამტკიცებული)
        const approved = allWorkers.filter(w => w.status === 'approved');
        renderGrid(approved, 'approvedGrid', 'approved');
        document.getElementById('statApproved').textContent = approved.length;

        // 3. Rejected (უარყოფილი)
        const rejected = allWorkers.filter(w => w.status === 'rejected');
        renderGrid(rejected, 'rejectedGrid', 'rejected');
        document.getElementById('statRejected').textContent = rejected.length;
    }, (error) => {
        console.error("Firestore error:", error);
        alert("ბაზიდან მონაცემების წამოღება ვერ მოხერხდა. ნახე Console.");
    });
}

function renderGrid(list, gridId, status) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = '<p class="no-items">განცხადება არ არის</p>';
        return;
    }

    // დალაგება თარიღის მიხედვით (უახლესი ზემოთ)
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    list.forEach(w => {
        const card  = document.createElement('div');
        card.className = 'admin-card';

        const photo = w.photoURL
            ? `<img src="${w.photoURL}" class="admin-photo" alt="${w.name}">`
            : `<div class="admin-photo-placeholder">👤</div>`;

        const cats  = (w.cats  || []).join(', ');
        const date  = w.createdAt ? new Date(w.createdAt.seconds * 1000).toLocaleDateString('ka-GE') : '';

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
                    <small class="admin-date">${date}</small>
                </div>
            </div>
            <div class="admin-actions">${actions}</div>
        `;
        grid.appendChild(card);
    });
}

// ღილაკების ფუნქციები
window.approveWorker = async (id) => {
    try {
        await updateDoc(doc(db, 'workers', id), { status: 'approved' });
    } catch (e) { alert("შეცდომა დამტკიცებისას"); }
};

window.rejectWorker = async (id) => {
    try {
        await updateDoc(doc(db, 'workers', id), { status: 'rejected' });
    } catch (e) { alert("შეცდომა უარყოფისას"); }
};

window.deleteWorker = async (id) => {
    if (confirm('ნამდვილად გსურთ წაშლა?')) {
        try {
            await deleteDoc(doc(db, 'workers', id));
        } catch (e) { alert("შეცდომა წაშლისას"); }
    }
};

// ტაბების გადართვა
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});