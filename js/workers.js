import { db } from './firebase-config.js';
import { collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const workerGrid  = document.getElementById('workerGrid');
const searchInput = document.getElementById('workerSearch');
const catFilter   = document.getElementById('catFilter');
const noResults   = document.getElementById('noResults');

let allApprovedWorkers = [];

// მონაცემების წამოღება
function loadWorkers() {
    // ვიყენებთ უბრალო query-ს ინდექსების თავიდან ასაცილებლად
    const q = query(collection(db, 'workers'));

    onSnapshot(q, (snap) => {
        const allData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // ვფილტრავთ მხოლოდ დამტკიცებულებს (Approved)
        allApprovedWorkers = allData.filter(w => w.status === 'approved');
        
        // ვალაგებთ თარიღით (უახლესი ზემოთ)
        allApprovedWorkers.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        applyFilters();
    }, (error) => {
        console.error("Firestore error:", error);
        workerGrid.innerHTML = `<p class="error">მონაცემების ჩატვირთვა ვერ მოხერხდა</p>`;
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCat = catFilter.value;

    const filtered = allApprovedWorkers.filter(w => {
        const matchesName = w.name.toLowerCase().includes(searchTerm);
        const matchesCat  = selectedCat === "" || (w.cats && w.cats.includes(selectedCat));
        return matchesName && matchesCat;
    });

    renderWorkers(filtered);
}

function renderWorkers(list) {
    workerGrid.innerHTML = '';
    
    if (list.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    list.forEach(w => {
        const card = document.createElement('div');
        card.className = 'admin-card'; // ვიყენებთ ადმინის სტილს ან Card-ს

        const photo = w.photoURL 
            ? `<img src="${w.photoURL}" class="admin-photo" alt="${w.name}">` 
            : `<div class="admin-photo-placeholder">👤</div>`;

        card.innerHTML = `
            <div class="admin-card-top">
                ${photo}
                <div class="admin-card-info">
                    <h3>${w.name}</h3>
                    <p class="admin-cats">${(w.cats || []).join(', ')}</p>
                    <p class="admin-phone">📞 ${w.phone}</p>
                    <a href="tel:${w.phone}" class="add-btn" style="display:inline-block; margin-top:10px; text-decoration:none; text-align:center;">დარეკვა</a>
                </div>
            </div>
        `;
        workerGrid.appendChild(card);
    });
}

// Event Listeners ფილტრებისთვის
searchInput.addEventListener('input', applyFilters);
catFilter.addEventListener('change', applyFilters);

// სტარტი
loadWorkers();