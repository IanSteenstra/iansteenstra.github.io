(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Highlight the nav link for the section currently in view.
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = navLinks
        .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);

    const setActiveNav = () => {
        if (!sections.length) return;
        const scrollPosition = window.scrollY + 120;
        let activeId = sections[0].id;

        for (const section of sections) {
            if (section.offsetTop <= scrollPosition) {
                activeId = section.id;
            } else {
                break;
            }
        }

        // The last section can be too short to reach the offset, so treat the page bottom as reaching it.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            activeId = sections[sections.length - 1].id;
        }

        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('scroll', setActiveNav, { passive: true });
    window.addEventListener('load', setActiveNav);

    // Auto-scrolling carousel: duplicate the items for a seamless loop and offer a pause control.
    const carousel = document.querySelector('.carousel');
    if (carousel && !reduceMotion) {
        const track = carousel.querySelector('.carousel-track');
        Array.from(track.children).forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('button, a').forEach((el) => el.setAttribute('tabindex', '-1'));
            track.appendChild(clone);
        });
        carousel.classList.add('is-animated');

        // Focus stops the animation (see CSS); once the track has settled, bring the focused thumbnail into view.
        carousel.addEventListener('focusin', (event) => {
            requestAnimationFrame(() => event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
        });

        // Focusing a thumbnail scrolls the clipped carousel; undo that once focus leaves.
        carousel.addEventListener('focusout', (event) => {
            if (!carousel.contains(event.relatedTarget)) carousel.scrollLeft = 0;
        });

        const pauseButton = document.createElement('button');
        pauseButton.type = 'button';
        pauseButton.className = 'carousel-pause';
        const setPaused = (paused) => {
            carousel.classList.toggle('is-paused', paused);
            pauseButton.textContent = paused ? '▶ Play' : '❚❚ Pause';
            pauseButton.setAttribute('aria-label', paused ? 'Play gallery animation' : 'Pause gallery animation');
        };
        pauseButton.addEventListener('click', () => setPaused(!carousel.classList.contains('is-paused')));
        setPaused(false);
        carousel.parentElement.appendChild(pauseButton);
    }

    // Lightbox for gallery thumbnails.
    const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
    if (!thumbs.length) return;

    const items = [];
    const seen = new Set();
    thumbs.forEach((thumb) => {
        const src = thumb.dataset.full;
        if (src && !seen.has(src)) {
            const img = thumb.querySelector('img');
            items.push({
                src,
                alt: img ? img.getAttribute('alt') || '' : '',
                caption: thumb.dataset.caption || '',
            });
            seen.add(src);
        }
    });

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
        <div class="lightbox-content">
            <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
            <button type="button" class="lightbox-prev" aria-label="Previous image">&#10094;</button>
            <img class="lightbox-image" alt="">
            <button type="button" class="lightbox-next" aria-label="Next image">&#10095;</button>
            <p class="lightbox-caption" aria-live="polite"></p>
        </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector('.lightbox-image');
    const lightboxCaption = overlay.querySelector('.lightbox-caption');
    const closeButton = overlay.querySelector('.lightbox-close');
    const prevButton = overlay.querySelector('.lightbox-prev');
    const nextButton = overlay.querySelector('.lightbox-next');
    const focusable = [closeButton, prevButton, nextButton];

    let currentIndex = 0;
    let returnFocusTo = null;

    const preload = (index) => {
        const item = items[(index + items.length) % items.length];
        if (item) new Image().src = item.src;
    };

    const updateLightbox = () => {
        const item = items[currentIndex];
        if (!item) return;
        lightboxImage.src = item.src;
        lightboxImage.alt = item.alt;
        lightboxCaption.textContent = item.caption || item.alt;
        preload(currentIndex + 1);
        preload(currentIndex - 1);
    };

    const openLightbox = (thumb) => {
        const index = items.findIndex((item) => item.src === thumb.dataset.full);
        currentIndex = index >= 0 ? index : 0;
        // Carousel clones aren't focusable, so return focus to the original thumbnail instead.
        returnFocusTo = thumb.getAttribute('tabindex') === '-1'
            ? thumbs.find((t) => t.dataset.full === thumb.dataset.full && t.getAttribute('tabindex') !== '-1')
            : thumb;
        updateLightbox();
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    };

    const closeLightbox = () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        if (returnFocusTo) returnFocusTo.focus();
    };

    const step = (delta) => {
        currentIndex = (currentIndex + delta + items.length) % items.length;
        updateLightbox();
    };

    thumbs.forEach((thumb) => thumb.addEventListener('click', () => openLightbox(thumb)));

    closeButton.addEventListener('click', closeLightbox);
    nextButton.addEventListener('click', () => step(1));
    prevButton.addEventListener('click', () => step(-1));

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (!overlay.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
        if (event.key === 'Tab') {
            const index = focusable.indexOf(document.activeElement);
            const next = event.shiftKey ? index - 1 : index + 1;
            event.preventDefault();
            focusable[(next + focusable.length) % focusable.length].focus();
        }
    });
})();
