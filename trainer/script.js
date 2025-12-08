// --------------------------------------------------------------------------------
// ⚠️ START: CONFIGURATION INJECTION (Must be present in the final JS file)
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
// ⚠️ PLACEHOLDER: THIS MUST BE REPLACED BY YOUR PLATFORM'S BACKEND WITH THE REAL ID!
const PAGE_DOC_ID = '1wg1s7id9u2hae3uvldobp';
// --------------------------------------------------------------------------------
// ⚠️ END: CONFIGURATION INJECTION
// --------------------------------------------------------------------------------


import { initializeApp } from "https://www.gstatic.com/firebase/7.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebase/7.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, runTransaction, increment, setDoc } from "https://www.gstatic.com/firebase/7.10.0/firebase-firestore.js";

let userId = null;
let db = null;

// -----------------------------------------------------
// 1. ANALYTICS FUNCTIONS
// -----------------------------------------------------

async function updatePageMetrics(field, value = 1) {
    if (!db || PAGE_DOC_ID === '1wg1s7id9u2hae3uvldobp') return console.error("PAGE_DOC_ID is missing.");
    const docRef = doc(db, "pages", PAGE_DOC_ID);
    
    try {
        // Attempt to update the document. If it doesn't exist, this will fail.
        await updateDoc(docRef, { [field]: increment(value) });
    } catch (e) {
        // If the document doesn't exist (e.g., 'not-found' error), create it.
        // This ensures that the page document always exists before further operations.
        if (e.code === 'not-found' || e.message.includes('No document to update')) {
            console.warn(`Page document ${PAGE_DOC_ID} not found, attempting to create with initial values.`);
            await setDoc(docRef, {
                views: field === 'views' ? value : 0,
                clicks: field === 'clicks' ? value : 0,
                leads: field === 'leads' ? value : 0,
                conversionRate: 0 // Initial conversion rate
            }, { merge: true }); // Use merge: true to avoid overwriting if partial document exists
        } else {
            console.error("Error updating or creating page metrics document:", e);
            return; // Exit if a different error occurred
        }
    }

    // Recalculate conversion rate using a transaction if 'leads' or 'views' were updated.
    // This transaction reads the latest 'views' and 'leads' (which now include the current increment)
    // and updates the 'conversionRate' atomically.
    if (field === 'leads' || field === 'views') {
        try {
            await runTransaction(db, async (transaction) => {
                const pageDoc = await transaction.get(docRef);
                if (pageDoc.exists()) {
                    const data = pageDoc.data();
                    const views = data.views || 0;
                    const leads = data.leads || 0;
                    const conversionRate = views > 0 ? (leads / views) * 100 : 0;
                    transaction.update(docRef, {
                        conversionRate: parseFloat(conversionRate.toFixed(2))
                    });
                }
            });
        } catch (transactionError) {
            console.error("Transaction failed to update conversionRate:", transactionError);
        }
    }
}

function attachClickTracking() {
    document.querySelectorAll('.track-link-click').forEach(element => {
        element.addEventListener('click', () => updatePageMetrics('clicks'));
    });
}

// -----------------------------------------------------
// 2. INITIALIZATION AND AUTH
// -----------------------------------------------------

function initializeFirebase() {
    if (typeof firebaseConfig === 'undefined' || PAGE_DOC_ID === '1wg1s7id9u2hae3uvldobp') {
        console.error("Firebase configuration is incomplete.");
        return false;
    }
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    db = getFirestore(app);

    // Anonymous Sign-in
    signInAnonymously(auth)
      .then((userCredential) => {
        userId = userCredential.user.uid;
        console.log("Analytics started for:", userId);
        updatePageMetrics('views'); // Track first view
        attachClickTracking(); // Attach click listeners
      })
      .catch((error) => {
        console.error("Auth failed:", error);
      });
    return true;
}

// -----------------------------------------------------
// 3. FORM SUBMISSION HANDLER
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    if (!initializeFirebase()) return;

    const form = document.getElementById('lead-form');
    const thankYouMsg = document.getElementById('thank-you-msg');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!userId) {
                alert('האימות נכשל. אנא טען מחדש או נסה מאוחר יותר.');
                return;
            }

            const originalText = submitBtn ? submitBtn.innerText : 'שלח';
            if (submitBtn) {
                submitBtn.innerText = 'שולח...';
                submitBtn.disabled = true;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const leadData = {
                ...data,
                userId: userId,
                timestamp: new Date().toISOString(),
                sourceUrl: window.location.href, // שמירת ה-URL המלא
            };

            try {
                // Save lead to subcollection: /pages/{PAGE_DOC_ID}/leads
                const pageDocRef = doc(db, "pages", PAGE_DOC_ID);
                await addDoc(collection(pageDocRef, "leads"), leadData);
                
                // Update Analytics Counters (CRITICAL STEP)
                await updatePageMetrics('leads');

                // Success
                form.style.display = 'none';
                if (thankYouMsg) thankYouMsg.style.display = 'block';

            } catch (error) {
                console.error('Lead submission failed:', error);
                alert('אירעה שגיאה בשליחה. אנא נסה שוב.');
                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});