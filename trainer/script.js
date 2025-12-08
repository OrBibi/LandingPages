// -----------------------------------------------------
// ⚠️ CONFIGURATION (חובה להתאים ל-HTML)
// -----------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyBtY_IrbV0TZLNvJ9Nr1h9UQFXygbO0zBQ",
    authDomain: "landingpages-4d6a8.firebaseapp.com",
    projectId: "landingpages-4d6a8",
    storageBucket: "landingpages-4d6a8.firebasestorage.app",
    messagingSenderId: "745990656140",
    appId: "1:745990656140:web:367c261db9156b15f66ba9",
    measurementId: "G-VJGLT3ZYJ6"
};
// ⚠️ ודא שה-ID הזה הוא ה-ID האמיתי שלך ב-Firestore
const PAGE_DOC_ID = 'mr3jz9athyw12k7k0esb'; 

// שורות ה-import הוסרו. הגישה תהיה דרך האובייקט הגלובלי 'firebase'.

let currentUser = null;
let db = null; 

// -----------------------------------------------------
// 1. ANALYTICS FUNCTIONS
// -----------------------------------------------------

async function updatePageMetrics(metric) {
    // 🛑 בדיקה: ודא ש-db קיים ושה-ID הוזן
    if (typeof firebase === 'undefined' || !db || PAGE_DOC_ID === 'PLACEHOLDER_PAGE_ID') return console.error("Metrics update failed: Firebase or PAGE_DOC_ID missing.");
    
    // שימוש בגישה גלובלית
    const docRef = firebase.firestore().doc("pages", PAGE_DOC_ID);
    
    try {
        await docRef.update({ [metric]: firebase.firestore.FieldValue.increment(1) });
        
        // חישוב יחס המרה (Conversion Rate)
        if (metric === 'leads' || metric === 'views') {
            await firebase.firestore().runTransaction(async (transaction) => {
                const pageDoc = await transaction.get(docRef);
                if (pageDoc.exists) {
                    const data = pageDoc.data();
                    const views = (data.views || 0) + (metric === 'views' ? 1 : 0);
                    const leads = (data.leads || 0) + (metric === 'leads' ? 1 : 0);
                    const conversionRate = views > 0 ? (leads / views) * 100 : 0;
                    transaction.update(docRef, { conversionRate: parseFloat(conversionRate.toFixed(2)) });
                }
            });
        }
    } catch (error) {
        // טיפול במקרה שהמסמך לא קיים (Not Found)
        if (error.code === 'not-found') {
            const initialData = { views: 0, clicks: 0, leads: 0 };
            initialData[metric] = 1;
            // יצירת המסמך באמצעות set
            docRef.set(initialData, { merge: true }); 
        } else {
            console.error("Error updating page metrics:", error);
        }
    }
}

// -----------------------------------------------------
// 2. INITIALIZATION AND AUTH
// -----------------------------------------------------

function initializeFirebase() {
    // 🛑 בדיקה קריטית: ודא שהאובייקט 'firebase' קיים
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined' || PAGE_DOC_ID === 'PLACEHOLDER_PAGE_ID') {
        console.error("Firebase SDK not loaded or config incomplete.");
        return false;
    }
    
    const app = firebase.initializeApp(firebaseConfig); 
    const auth = firebase.auth();
    db = firebase.firestore();

    // כניסה אנונימית והמתנה לאימות
    auth.signInAnonymously().catch((error) => {
        console.error("Error signing in anonymously:", error);
    });

    // המתנה לשינוי סטטוס האימות (שיוך משתמש אנונימי)
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            updatePageMetrics('views'); // מעקב צפייה ראשוני
            
            // חיבור מעקבי לחיצות לאחר אימות המשתמש
            document.querySelectorAll('.track-link-click').forEach(link => {
                link.addEventListener('click', () => {
                    updatePageMetrics('clicks');
                });
            });
        } else {
            currentUser = null;
        }
    });

    return true;
}

// -----------------------------------------------------
// 3. FORM SUBMISSION HANDLER
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // השהייה קצרה לוודא שכל ה-SDK נטען
    setTimeout(() => {
        if (!initializeFirebase()) return;

        const form = document.getElementById('lead-form');
        const thankYouMsg = document.getElementById('thank-you-msg');
        const submitBtn = document.getElementById('submit-btn');
        const formContainer = form ? form.parentElement : null;

        if (form && submitBtn) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                if (!currentUser) {
                    console.error("Form submission failed: User not authenticated.");
                    alert("Authentication error. Please refresh the page and try again.");
                    return;
                }
                
                const originalButtonText = submitBtn.textContent;
                submitBtn.textContent = "Sending...";
                submitBtn.disabled = true;

                const data = {};
                const inputs = form.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    if (input.name) {
                        data[input.name] = input.value;
                    }
                });
                
                const leadData = {
                    ...data,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: currentUser.uid,
                    sourceUrl: window.location.href, // שמירת ה-URL המלא
                };

                try {
                    // שמירת הליד לקולקציית המשנה
                    await db.collection("pages").doc(PAGE_DOC_ID).collection("leads").add(leadData);
                    
                    // עדכון מונה הלידים והמרת יחס
                    await updatePageMetrics('leads');
                    
                    // הצלחה: הסתרת הטופס והצגת הודעת תודה
                    form.style.display = 'none';
                    if (thankYouMsg) {
                        thankYouMsg.style.display = 'block';
                    } else if (formContainer) {
                        // אם אין אלמנט thank-you-msg, יוצרים הודעה דינמית
                        const successMessage = document.createElement('div');
                        successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-8';
                        successMessage.innerHTML = '<strong class="font-bold">Success!</strong><span class="block sm:inline"> Your request has been sent.</span>';
                        formContainer.appendChild(successMessage);
                    }

                } catch (error) {
                    console.error("Error submitting lead:", error);
                    alert("There was an error submitting your request. Please try again.");
                } finally {
                    submitBtn.textContent = originalButtonText;
                    submitBtn.disabled = false;
                }
            });
        }
    }, 500);
});
