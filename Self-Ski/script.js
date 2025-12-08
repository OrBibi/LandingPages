
// --- UI/Animation Logic (Designer Agent) ---
// --- UI/Animation Logic (Designer Agent) ---
// --- UI/Animation Logic (Designer Agent) ---
console.log('Page Loaded');


// --- Backend/Google Forms Logic (Integrator Agent) ---
(function() {
    // Google Analytics Integration
    const googleAnalyticsId = 'G-14Q38JQGLZ';
    if (googleAnalyticsId) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', googleAnalyticsId);
    }

    // Google Forms Submission
    const form = document.getElementById('lead-form');
    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const googleFormUrl = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSd6nFWeRyhzT-yn4P3Y5DF8hN3f7U6Jfm-KwoIHOAYmbbKR8A/formResponse';
    const fieldMappings = {
        "email": "entry.1045781291",
        "name": "entry.2005620554"
    };

    if (form && submitBtn && nameInput && emailInput) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const originalButtonText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new URLSearchParams();
            formData.append(fieldMappings.name, nameInput.value);
            formData.append(fieldMappings.email, emailInput.value);

            try {
                await fetch(googleFormUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Critical for Google Forms
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                });

                // Since mode is 'no-cors', response will be opaque. Treat as success.
                // Hide the form and show a success message
                form.innerHTML = '<div class="text-center text-green-400 text-xl font-semibold">Thank you for your interest! We\'ll be in touch soon.</div>';
                form.classList.add('py-10'); // Add some padding to the success message

            } catch (error) {
                console.error('Error submitting form:', error);
                // Revert button state on error
                submitBtn.textContent = originalButtonText;
                submitBtn.disabled = false;
                alert('There was an error submitting your request. Please try again.');
            }
        });
    }
})();