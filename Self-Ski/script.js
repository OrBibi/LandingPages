// --- UI/Animation Logic (Designer Agent) ---
// --- UI/Animation Logic (Designer Agent) ---
console.log('Self Ski Landing Page Loaded');

// --- Backend/Google Integrations (Integrator Agent) ---
(function() {
    const googleAnalyticsId = 'G-14Q38JQGLZ';
    const formActionUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSd6nFWeRyhzT-yn4P3Y5DF8hN3f7U6Jfm-KwoIHOAYBmbKR8A/formResponse';
    const fieldMappings = {
        "email": "entry.987654321",
        "name": "entry.12345678"
    };

    // A. GOOGLE ANALYTICS
    if (googleAnalyticsId) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', googleAnalyticsId);
    }

    // B. FORM SUBMISSION
    const form = document.getElementById('lead-form');
    const submitButton = document.getElementById('submit-btn');

    if (form && submitButton) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // UI Feedback
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            const formData = new URLSearchParams();
            let allFieldsMapped = true;

            for (const htmlName in fieldMappings) {
                const googleEntryId = fieldMappings[htmlName];
                const inputElement = form.querySelector(`[name="${htmlName}"]`);

                if (inputElement) {
                    formData.append(googleEntryId, inputElement.value);
                } else {
                    console.warn(`Warning: HTML input with name="${htmlName}" not found. This field will not be sent to Google Forms.`);
                    allFieldsMapped = false;
                }
            }

            if (!allFieldsMapped) {
                console.warn('Some form fields could not be mapped. Please check your configuration.');
            }

            try {
                // Send Request
                await fetch(formActionUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Google Forms requires 'no-cors' for direct submission
                    body: formData
                });

                // Handle Success (Google Forms with no-cors always results in an opaque response, which is treated as success)
                console.log('Form submitted successfully (opaque response).');

                // Show success message
                const formContainer = form.closest('div');
                if (formContainer) {
                    formContainer.innerHTML = `
                        <h2 class="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">תודה רבה!</h2>
                        <p class="text-center text-gray-600 mb-8 text-lg">פרטיך נשלחו בהצלחה. נחזור אליך בהקדם!</p>
                    `;
                } else {
                    form.innerHTML = `
                        <h2 class="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">תודה רבה!</h2>
                        <p class="text-center text-gray-600 mb-8 text-lg">פרטיך נשלחו בהצלחה. נחזור אליך בהקדם!</p>
                    `;
                }

                // Analytics Event
                if (typeof gtag === 'function') {
                    gtag('event', 'generate_lead');
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                // Revert UI on error
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                alert('An error occurred while submitting the form. Please try again.');
            }
        });
    } else {
        console.error('Form with ID "lead-form" or submit button with ID "submit-btn" not found.');
    }
})();