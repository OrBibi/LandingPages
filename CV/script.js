document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('lead-form');
    const thankYouMsg = document.getElementById('thank-you-msg');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            form.style.display = 'none';
            thankYouMsg.style.display = 'block';

            thankYouMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
});