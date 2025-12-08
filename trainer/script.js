// --------------------------------------------------------------------------------
// ⚠️ CONFIGURATION & ANALYTICS (DO NOT MODIFY)
// --------------------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyBtY_IrbV0TZLNvJ9Nr1h9UQFXygbO0zBQ",
    authDomain: "landingpages-4d6a8.firebaseapp.com",
    projectId: "landingpages-4d6a8",
    storageBucket: "landingpages-4d6a8.firebasestorage.app",
    messagingSenderId: "745990656140",
    appId: "1:745990656140:web:367c261db9156b15f66ba9",
    measurementId: "G-VJGLT3ZYJ6"
};
const PAGE_DOC_ID = 'o35wh9td4cfyi5h46ek7j'; 

// GLOBAL FIREBASE INIT (Compat Mode)
let userId = null;
let db = null; 

async function updatePageMetrics(field, value = 1) {
    if (!db || PAGE_DOC_ID === 'o35wh9td4cfyi5h46ek7j') return console.error("PAGE_DOC_ID is missing.");
    const docRef = db.collection("pages").doc(PAGE_DOC_ID);
    try {
        await docRef.update({ [field]: firebase.firestore.FieldValue.increment(value) });
        
        // Recalculate conversion rate on views/leads
        if (field === 'leads' || field === 'views') {
            db.runTransaction(async (transaction) => {
                const pageDoc = await transaction.get(docRef);
                if (pageDoc.exists) {
                    const data = pageDoc.data();
                    const views = (data.views || 0) + (field === 'views' ? value : 0);
                    const leads = (data.leads || 0) + (field === 'leads' ? value : 0);
                    const conversionRate = views > 0 ? (leads / views) * 100 : 0;
                    transaction.update(docRef, { conversionRate: parseFloat(conversionRate.toFixed(2)) });
                }
            });
        }
    } catch (e) { console.error("Error updating metrics:", e); }
}

function attachClickTracking() {
    document.querySelectorAll('.track-link-click').forEach(element => {
        element.addEventListener('click', () => updatePageMetrics('clicks'));
    });
}

function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK not loaded");
        return false;
    }
    if (PAGE_DOC_ID === 'o35wh9td4cfyi5h46ek7j') return false;
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    db = firebase.firestore();
    
    auth.signInAnonymously().then((userCredential) => {
        userId = userCredential.user.uid; 
        updatePageMetrics('views'); 
        attachClickTracking();
    }).catch((error) => console.error("Auth failed:", error));
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!initializeFirebase()) return;
    const form = document.getElementById('lead-form');
    const thankYouMsg = document.getElementById('thank-you-msg');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!userId) { alert('Connection error. Please reload.'); return; }
            
            const originalText = submitBtn ? submitBtn.innerText : 'Submit';
            if (submitBtn) { submitBtn.innerText = 'Sending...'; submitBtn.disabled = true; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const leadData = { ...data, userId: userId, timestamp: new Date().toISOString(), sourceUrl: window.location.href };

            try {
                // Save to Subcollection using compat syntax
                await db.collection("pages").doc(PAGE_DOC_ID).collection("leads").add(leadData);
                
                await updatePageMetrics('leads');
                form.style.display = 'none';
                if (thankYouMsg) thankYouMsg.style.display = 'block';
            } catch (error) {
                console.error('Submission error:', error);
                alert('Submission failed. Please try again.');
                if (submitBtn) { submitBtn.innerText = originalText; submitBtn.disabled = false; }
            }
        });
    }
});
