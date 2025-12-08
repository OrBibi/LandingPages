
// --- UI/Animation Logic (Designer Agent) ---
document.addEventListener('DOMContentLoaded', () => {const mobileMenuButton = document.getElementById('mobile-menu-button');const mobileMenu = document.getElementById('mobile-menu');mobileMenuButton.addEventListener('click', () => {mobileMenu.classList.toggle('hidden');});document.querySelectorAll('#mobile-menu a').forEach(item => {item.addEventListener('click', () => {mobileMenu.classList.add('hidden');});});console.log('Page Loaded');});


// --- Backend/Data Logic (Integrator Agent) ---
const firebaseConfig = {
    apiKey: "AIzaSyBtY_IrbV0TZLNvJ9Nr1h9UQFXygbO0zBQ",
    authDomain: "landingpages-4d6a8.firebaseapp.com",
    projectId: "landingpages-4d6a8",
    storageBucket: "landingpages-4d6a8.firebasestorage.app",
    messagingSenderId: "745990656140",
    appId: "1:745990656140:web:367c261db9156b15f66ba9",
    measurementId: "G-VJGLT3ZYJ6"
};

// IMPORTANT: This constant is a placeholder. 
// The build system will regex-replace 'ymvd8vyyr3ihg8q0tk0ao8' with the actual ID.
const PAGE_DOC_ID = 'ymvd8vyyr3ihg8q0tk0ao8';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let userId = null;

// --- ANALYTICS & AUTH ---

// Authenticate anonymously and track initial view
firebase.auth().signInAnonymously()
    .then((result) => {
        userId = result.user.uid;
        console.log('Signed in anonymously with UID:', userId);
        updatePageMetrics('views');
    })
    .catch((error) => {
        console.error('Error signing in anonymously:', error);
    });

/**
 * Updates a specific page metric in Firestore.
 * @param {string} metricName - The name of the metric to increment (e.g., 'views', 'leads', 'clicks').
 */
function updatePageMetrics(metricName) {
    if (!PAGE_DOC_ID || PAGE_DOC_ID === 'ymvd8vyyr3ihg8q0tk0ao8') {
        console.warn('PAGE_DOC_ID is not set. Cannot update metrics.');
        return;
    }
    const pageRef = db.collection('pages').doc(PAGE_DOC_ID);
    pageRef.update({
            [metricName]: firebase.firestore.FieldValue.increment(1)
        })
        .then(() => {
            console.log(`Metric '${metricName}' updated successfully.`);
        })
        .catch((error) => {
            console.error(`Error updating metric '${metricName}':`, error);
            // If the document doesn't exist, create it with the initial metric
            if (error.code === 'not-found') {
                pageRef.set({
                    [metricName]: 1
                }, { merge: true })
                .then(() => console.log(`Page document created and metric '${metricName}' initialized.`))
                .catch(err => console.error(`Error creating page document for metric '${metricName}':`, err));
            }
        });
}

// Attach click tracking to all anchor tags and elements with class 'track-link-click'
document.addEventListener('DOMContentLoaded', () => {
    const trackableElements = document.querySelectorAll('a, .track-link-click');
    trackableElements.forEach(element => {
        element.addEventListener('click', () => {
            updatePageMetrics('clicks');
        });
    });
});

// --- FORM SUBMISSION ---
const leadForm = document.getElementById('lead-form');
if (leadForm) {
    leadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!userId) {
            console.error('User not authenticated. Cannot submit lead.');
            alert('There was an issue with authentication. Please try again.');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const originalButtonText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = {};
        for (const element of leadForm.elements) {
            if (element.name && (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')) {
                formData[element.name] = element.value;
            }
        }

        const data = {
            ...formData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId,
            pageId: PAGE_DOC_ID // Include pageId for easier querying
        };

        try {
            if (!PAGE_DOC_ID || PAGE_DOC_ID === 'ymvd8vyyr3ihg8q0tk0ao8') {
                throw new Error('PAGE_DOC_ID is not set. Cannot submit lead.');
            }
            await db.collection('pages').doc(PAGE_DOC_ID).collection('leads').add(data);
            console.log('Lead submitted successfully!');
            updatePageMetrics('leads');

            // Hide form and show success message
            leadForm.style.display = 'none';
            const successMessageDiv = document.createElement('div');
            successMessageDiv.className = 'text-center p-8 bg-green-100 text-green-800 rounded-lg shadow-md';
            successMessageDiv.innerHTML = '<h3 class="text-2xl font-bold mb-4">Thank You!</h3><p class="text-lg">Your consultation request has been received. We will contact you shortly.</p>';
            leadForm.parentNode.insertBefore(successMessageDiv, leadForm.nextSibling);

        } catch (error) {
            console.error('Error submitting lead:', error);
            alert('There was an error submitting your request. Please try again.');
            submitBtn.textContent = originalButtonText;
            submitBtn.disabled = false;
        }
    });
} else {
    console.warn('Lead form with ID "lead-form" not found.');
}