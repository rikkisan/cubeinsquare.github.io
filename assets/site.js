(function () {
    function initSlideshow(root) {
        const slides = Array.from(root.querySelectorAll('.server-slides img'));
        const prev = root.querySelector('[data-slide-prev]');
        const next = root.querySelector('[data-slide-next]');
        const dotsWrap = root.querySelector('[data-slide-dots]');
        let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
        const intervalMs = Number(root.dataset.slideInterval || 5000);
        let autoTimer = null;

        if (!slides.length) return;

        function stopAuto() {
            if (autoTimer) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function startAuto() {
            stopAuto();
            if (slides.length > 1 && intervalMs > 0) {
                autoTimer = window.setInterval(() => show(current + 1), intervalMs);
            }
        }

        function moveTo(index) {
            show(index);
            startAuto();
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            if (dotsWrap) {
                dotsWrap.querySelectorAll('button').forEach((dot, dotIndex) => {
                    dot.classList.toggle('is-active', dotIndex === current);
                    dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
                });
            }
        }

        if (dotsWrap) {
            dotsWrap.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', String(index + 1));
                dot.addEventListener('click', () => moveTo(index));
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) prev.addEventListener('click', () => moveTo(current - 1));
        if (next) next.addEventListener('click', () => moveTo(current + 1));

        root.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') moveTo(current - 1);
            if (event.key === 'ArrowRight') moveTo(current + 1);
        });
        root.addEventListener('mouseenter', stopAuto);
        root.addEventListener('mouseleave', startAuto);
        root.addEventListener('focusin', stopAuto);
        root.addEventListener('focusout', startAuto);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAuto();
            else startAuto();
        });

        root.tabIndex = 0;
        show(current);
        startAuto();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
    });
})();
