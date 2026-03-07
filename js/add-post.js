import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const photoArea    = document.getElementById('photoUploadArea');
const photoInput   = document.getElementById('wPhoto');
const photoPreview = document.getElementById('photoPreview');
const photoHolder  = document.getElementById('photoPlaceholder');
const removeBtn    = document.getElementById('removePhoto');

// ფოტო არჩევა
photoArea.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
        showError('ფოტო 1.5MB-ზე მეტია — გთხოვთ პატარა ფოტო ატვირთოთ.');
        photoInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
        photoHolder.style.display = 'none';
        removeBtn.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
});

// drag & drop
photoArea.addEventListener('dragover', e => { e.preventDefault(); photoArea.classList.add('drag-over'); });
photoArea.addEventListener('dragleave', () => photoArea.classList.remove('drag-over'));
photoArea.addEventListener('drop', e => {
    e.preventDefault();
    photoArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
        photoInput.dispatchEvent(new Event('change'));
    }
});

removeBtn.addEventListener('click', e => {
    e.stopPropagation();
    photoInput.value = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    photoHolder.style.display = 'flex';
    removeBtn.style.display = 'none';
});

// ფორმის გაგზავნა
const form       = document.getElementById('workerForm');
const submitBtn  = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoad = document.getElementById('submitLoad');

form.addEventListener('submit', async e => {
    e.preventDefault();
    hideMessages();

    const name  = document.getElementById('wName').value.trim();
    const phone = document.getElementById('wPhone').value.trim();
    const desc  = document.getElementById('wDesc').value.trim();
    const cats  = [...document.querySelectorAll('input[name="cat"]:checked')].map(i => i.value);
    const langs = [...document.querySelectorAll('input[name="lang"]:checked')].map(i => i.value);

    if (!name)             return showError('გთხოვთ შეიყვანოთ სახელი და გვარი');
    if (!phone)            return showError('გთხოვთ შეიყვანოთ ტელეფონის ნომერი');
    if (cats.length === 0) return showError('გთხოვთ აირჩიოთ მინიმუმ ერთი პროფესია');

    setLoading(true);

    try {
        // ფოტო base64-ად ვინახავთ პირდაპირ Firestore-ში
        let photoData = '';
        if (photoInput.files[0]) {
            photoData = await toBase64(photoInput.files[0]);
        }

        await addDoc(collection(db, 'workers'), {
            name, phone, cats, langs, desc,
            photo: photoData,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        form.reset();
        photoPreview.src = '';
        photoPreview.style.display = 'none';
        photoHolder.style.display = 'flex';
        removeBtn.style.display = 'none';

        document.getElementById('successMsg').style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        showError('შეცდომა გაგზავნისას: ' + err.message);
    } finally {
        setLoading(false);
    }
});

function toBase64(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onerror = rej;
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const MAX = 600;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else       { w = Math.round(w * MAX / h); h = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                res(canvas.toDataURL('image/jpeg', 0.55));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function setLoading(on) {
    submitBtn.disabled = on;
    submitText.style.display = on ? 'none' : 'inline';
    submitLoad.style.display = on ? 'inline' : 'none';
}
function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = '❌ ' + msg;
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideMessages() {
    document.getElementById('successMsg').style.display = 'none';
    document.getElementById('errorMsg').style.display   = 'none';
}