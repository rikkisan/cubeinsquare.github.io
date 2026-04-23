(function () {
    function trackEvent(name, params, options) {
        if (window.CubeAnalytics && typeof window.CubeAnalytics.track === 'function') {
            window.CubeAnalytics.track(name, params, options);
        }
    }

    function copyTextFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function initCopyButtons() {
        document.querySelectorAll('[data-copy-text]').forEach((button) => {
            if (button.dataset.copyReady === 'true') return;
            button.dataset.copyReady = 'true';

            const defaultLabel = button.dataset.copyLabel || button.textContent.trim();
            const copiedLabel = button.dataset.copyCopiedLabel || defaultLabel;
            let resetTimer = null;

            button.addEventListener('click', async () => {
                const text = button.dataset.copyText || '';
                if (!text) return;

                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        copyTextFallback(text);
                    }
                } catch (error) {
                    copyTextFallback(text);
                }

                trackEvent('wiki_example_copy', {
                    copy_target: text,
                    copy_length: text.length
                });

                button.textContent = copiedLabel;
                button.classList.add('is-copied');
                window.clearTimeout(resetTimer);
                resetTimer = window.setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.classList.remove('is-copied');
                }, 1400);
            });
        });
    }

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

    function initGlobalToolLinks() {
        const tools = [
            {
                toolHref: '/skin-editor/',
                guideHref: '/wiki-skin-editor/',
                toolLabel: 'Minecraft Skin Editor',
                guideLabel: 'Skin editor guide',
                featureTitle: 'Skin editor',
                featureDesc: 'Draw on the atlas or paint directly on the 3D player model.'
            },
            {
                toolHref: '/texture-painter/',
                guideHref: '/wiki-texture-painter/',
                toolLabel: 'Texture painter',
                guideLabel: 'Texture painter guide',
                featureTitle: 'Texture painter',
                featureDesc: 'Choose a canvas size, paint a PNG, and send it into your pack workflow.'
            }
        ];

        document.querySelectorAll('.steam-mega-panel--tools .mega-list').forEach((list) => {
            const upcoming = Array.from(list.querySelectorAll('a')).find((item) => /(?:^|\/)tool-coming-soon(?:\/|\.html)?$/i.test(item.getAttribute('href') || ''));
            tools.forEach((tool) => {
                if (list.querySelector(`a[href="${tool.toolHref}"], a[href$="${tool.toolHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.toolHref;
                link.textContent = tool.toolLabel;
                list.insertBefore(link, upcoming || null);
            });
        });

        document.querySelectorAll('.steam-mega-panel--tools .mega-feature').forEach((feature) => {
            tools.slice().reverse().forEach((tool) => {
                if (feature.querySelector(`a[href="${tool.toolHref}"], a[href$="${tool.toolHref}"]`)) return;
                const card = document.createElement('a');
                card.className = 'mega-card';
                card.href = tool.toolHref;
                card.innerHTML = `<strong>${tool.featureTitle}</strong><span>${tool.featureDesc}</span>`;
                feature.insertBefore(card, feature.firstChild);
            });
        });

        document.querySelectorAll('.mega-group-title[href*="#other-tools-wiki"]').forEach((title) => {
            const sublist = title.parentElement ? title.parentElement.querySelector('.mega-sublist') : null;
            const potions = sublist ? Array.from(sublist.querySelectorAll('a')).find((item) => /(?:^|\/)wiki-custom-potions(?:\/|\.html)?$/i.test(item.getAttribute('href') || '')) : null;
            if (!sublist) return;
            tools.forEach((tool) => {
                if (sublist.querySelector(`a[href="${tool.guideHref}"], a[href$="${tool.guideHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.guideLabel;
                sublist.insertBefore(link, potions || sublist.firstChild);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initGlobalToolLinks();
        initCopyButtons();
        document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
    });
})();
