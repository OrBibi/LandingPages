// --- UI/Animation Logic (Designer Agent) ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu && closeMobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        });

        closeMobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';
            });
        });
    }

    console.log('Self Ski Landing Page Loaded');
});

// --- Backend/Google Integrations (Integrator Agent) ---
const googleAnalyticsId = "G-14Q38JQGLZ";if (googleAnalyticsId) {const script = document.createElement('script');script.async = true;script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;document.head.appendChild(script);window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', googleAnalyticsId);}const form = document.getElementById('lead-form');const submitButton = document.getElementById('submit-btn');const googleFormsUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSd6nFWeRyhzT-yn4P3Y5DF8hN3f7U6Jfm-KwoIHOAYmbbKR8A/formResponse";const fieldMappings = {"email":"entry.1045781291","name":"entry.2005620554"};if (form) {form.addEventListener('submit', async (e) => {e.preventDefault();if (submitButton) {submitButton.textContent = "Sending...";submitButton.disabled = true;}const formData = new URLSearchParams();let allFieldsFound = true;for (const htmlName in fieldMappings) {const googleEntryId = fieldMappings[htmlName];const inputElement = form.querySelector(`[name="${htmlName}"]`);if (inputElement) {formData.append(googleEntryId, inputElement.value);} else {console.warn(`Warning: HTML input with name "${htmlName}" not found. This field will not be submitted to Google Forms.`);allFieldsFound = false;}}if (!allFieldsFound) {console.warn("Some form fields were not found or mapped correctly. Proceeding with available data.");}try {await fetch(googleFormsUrl, {method: 'POST',mode: 'no-cors',body: formData,});console.log("Form submitted successfully (Google Forms opaque response).");if (form.parentNode) {form.parentNode.innerHTML = `<div class="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 backdrop-filter backdrop-blur-lg text-center"><h3 class="text-3xl font-bold text-gray-900 mb-4">Thank You!</h3><p class="text-gray-700 text-lg">Your interest is greatly appreciated. We'll keep you updated on Self Ski's progress.</p></div>`;}if (typeof gtag === 'function') {gtag('event', 'generate_lead');}} catch (error) {console.error("Error submitting form:", error);if (submitButton) {submitButton.textContent = "Get Updates";submitButton.disabled = false;}if (form.parentNode) {form.parentNode.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert"><strong class="font-bold">Error!</strong><span class="block sm:inline">There was an issue submitting your form. Please try again.</span></div>`;}}});} else {console.error("Form with ID 'lead-form' not found.");}