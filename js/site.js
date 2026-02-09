(() => {
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = navLinks
        .map((link) => {
            const id = link.getAttribute('href').slice(1);
            return document.getElementById(id);
        })
        .filter(Boolean);

    const setActiveNav = () => {
        if (!sections.length) return;
        const offset = 120;
        let activeId = sections[0].id;

        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= offset && rect.bottom > offset) {
                activeId = section.id;
                break;
            }
        }

        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('active', isActive);
        });
    };

    window.addEventListener('scroll', setActiveNav, { passive: true });
    window.addEventListener('load', setActiveNav);

    const images = Array.from(document.querySelectorAll('[data-lightbox]'));
    if (!images.length) return;

    const uniqueImages = [];
    const seen = new Set();

    images.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !seen.has(src)) {
            uniqueImages.push({ src, alt: img.getAttribute('alt') || '' });
            seen.add(src);
        }
        img.style.cursor = 'zoom-in';
    });

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
            <img class="lightbox-image" alt="">
            <button class="lightbox-next" aria-label="Next">&#10095;</button>
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector('.lightbox-image');
    const lightboxCaption = overlay.querySelector('.lightbox-caption');
    const closeButton = overlay.querySelector('.lightbox-close');
    const prevButton = overlay.querySelector('.lightbox-prev');
    const nextButton = overlay.querySelector('.lightbox-next');

    let currentIndex = 0;

    const updateLightbox = () => {
        const item = uniqueImages[currentIndex];
        if (!item) return;
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt || 'Gallery image';
        lightboxCaption.textContent = item.alt || '';
    };

    const openLightbox = (src) => {
        const index = uniqueImages.findIndex((item) => item.src === src);
        currentIndex = index >= 0 ? index : 0;
        updateLightbox();
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % uniqueImages.length;
        updateLightbox();
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + uniqueImages.length) % uniqueImages.length;
        updateLightbox();
    };

    images.forEach((img) => {
        img.addEventListener('click', () => {
            const src = img.getAttribute('src');
            if (src) openLightbox(src);
        });
    });

    closeButton.addEventListener('click', closeLightbox);
    nextButton.addEventListener('click', showNext);
    prevButton.addEventListener('click', showPrev);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!overlay.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') showNext();
        if (event.key === 'ArrowLeft') showPrev();
    });
})();
