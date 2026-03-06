import { db, storage } from './firebase-config.js';
import {
    collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
    ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ===== ფოტო ატვირთვის UI =====
const photoArea     = document.getElementById('photoUploadArea');
const photoInput    = document.getElementById('wPhoto');
const photoPreview  = document.getElementById('photoPreview');
const photoHolder   = document.getElementById('photoPlaceholder');
const removeBtn     = document.getElementById('removePhoto');

photoArea.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showError('ფოტო 2MB-ზე მეტია. გთხოვთ პატარა ფოტო ატვირთოთ.');
        photoInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
        photoHolder.style.display = 'none';
        removeBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
});

removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    photoInput.value = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    photoHolder.style.display = 'flex';
    removeBtn.style.display = 'none';
});

// ===== ფორმის გაგზავნა =====
const form       = document.getElementById('workerForm');
const submitBtn  = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoad = document.getElementById('submitLoading');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const name  = document.getElementById('wName').value.trim();
    const phone = document.getElementById('wPhone').value.trim();
    const desc  = document.getElementById('wDesc').value.trim();
    const cats  = [...document.querySelectorAll('input[name="cat"]:checked')].map(i => i.value);
    const langs = [...document.querySelectorAll('input[name="lang"]:checked')].map(i => i.value);

    // ვალიდაცია
    if (!name)         return showError('გთხოვთ შეიყვანოთ სახელი და გვარი');
    if (!phone)        return showError('გთხოვთ შეიყვანოთ ტელეფონის ნომერი');
    if (cats.length === 0) return showError('გთხოვთ აირჩიოთ მინიმუმ ერთი პროფესია');

    setLoading(true);

    try {
        let photoURL = '';

        // ფოტოს ატვირთვა Storage-ში (თუ არჩეულია)
        const photoFile = photoInput.files[0];
        if (photoFile) {
            const ext = photoFile.name.split('.').pop();
            const storageRef = ref(storage, `worker-photos/${Date.now()}.${ext}`);
            await uploadBytes(storageRef, photoFile);
            photoURL = await getDownloadURL(storageRef);
        }

        // Firestore-ში შენახვა
        await addDoc(collection(db, 'workers'), {
            name,
            phone,
            cats,
            langs,
            desc,
            photoURL,
            status: 'pending',   // pending | approved | rejected
            createdAt: serverTimestamp()
        });

        // წარმატება
        form.reset();
        photoPreview.src = '';
        photoPreview.style.display = 'none';
        photoHolder.style.display = 'flex';
        removeBtn.style.display = 'none';

        document.getElementById('successMsg').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        showError('შეცდომა გაგზავნისას. სცადეთ თავიდან.');
    } finally {
        setLoading(false);
    }
});

function setLoading(on) {
    submitBtn.disabled = on;
    submitText.style.display = on ? 'none' : 'inline';
    submitLoad.style.display = on ? 'inline' : 'none';
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = '❌ ' + msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideMessages() {
    document.getElementById('successMsg').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'none';
}