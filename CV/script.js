document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initMobileNav();
    initScrollReveal();
    initProjectFilters();
    initContactForm();
    initActiveNavLink();
});

/* ---- Theme Toggle ---- */
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    } else if (!prefersDark) {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

/* ---- Mobile Navigation ---- */
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);
    });

    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ---- Active Nav Link on Scroll ---- */
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(section => observer.observe(section));
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

/* ---- Project Filters ---- */
function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    const emptyMsg = document.getElementById('projects-empty');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            buttons.forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
            });

            let visibleCount = 0;

            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden', !match);
                if (match) visibleCount++;
            });

            emptyMsg.hidden = visibleCount > 0;
        });
    });
}
/* ---- Contact Form ---- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const thankYou = document.getElementById('thank-you-msg');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');
        let valid = true;

        [name, email, message].forEach(field => {
            field.classList.remove('error');
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            }
        });

        if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('error');
            valid = false;
        }

        if (!valid) return;

        const subject = encodeURIComponent(`Portfolio Contact from ${name.value.trim()}`);
        const body = encodeURIComponent(
            `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${message.value.trim()}`
        );

        window.location.href = `mailto:orbibics@gmail.com?subject=${subject}&body=${body}`;

        form.hidden = true;
        thankYou.hidden = false;
    });
}

