/**
 * Shane Janney — Portfolio
 * Main script: loader, entrance animations, live clock, geolocation
 */

(function () {
    'use strict';

    // Start entrance animations immediately
    // Moved to the bottom of the script
    // ========================================
    // ENTRANCE ANIMATIONS
    // ========================================
    let animationsRun = false;

    function runEntranceAnimations() {
        if (animationsRun) return;
        animationsRun = true;

        // Stagger nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, i) => {
            setTimeout(() => {
                link.classList.add('visible');
            }, i * 80);
        });

        // Meta info (time/location)
        const metaInfo = document.getElementById('metaInfo');
        if (metaInfo) {
            setTimeout(() => {
                metaInfo.classList.add('visible');
            }, 200);
        }

        // Reveal name, container, and caption if they exist
        const heroName = document.querySelector('.name-line');
        const heroContainer = document.getElementById('heroImageContainer');
        const heroCaption = document.getElementById('heroCaption');

        if (heroName) {
            setTimeout(() => {
                heroName.classList.add('visible');
            }, 500);
        }

        if (heroContainer) {
            setTimeout(() => {
                heroContainer.classList.add('visible');
            }, 100);
        }

        if (heroCaption) {
            setTimeout(() => {
                heroCaption.classList.add('visible');
            }, 800);
        }
    }

    // ========================================
    // LIVE CLOCK
    // ========================================
    const metaTimeEl = document.getElementById('metaTime');

    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        metaTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
    }

    updateTime();
    setInterval(updateTime, 1000);

    // ========================================
    // GEOLOCATION
    // ========================================
    const metaLocationEl = document.getElementById('metaLocation');

    async function fetchLocation() {
        // First, try the browser Geolocation API for coordinates,
        // then reverse-geocode to get city/state.
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Use free reverse geocoding API
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const data = await response.json();
                        const city = data.city || data.locality || data.principalSubdivision || '';
                        const region = data.principalSubdivisionCode || data.principalSubdivision || '';
                        
                        // Format as "City, ST"
                        let regionShort = region;
                        if (region.includes('-')) {
                            regionShort = region.split('-').pop();
                        }
                        
                        if (city && regionShort) {
                            metaLocationEl.textContent = `${city}, ${regionShort}`;
                        } else if (city) {
                            metaLocationEl.textContent = city;
                        } else {
                            fallbackLocation();
                        }
                    } catch (err) {
                        fallbackLocation();
                    }
                },
                () => {
                    // Permission denied or error
                    fallbackLocation();
                },
                { timeout: 8000, maximumAge: 300000 }
            );
        } else {
            fallbackLocation();
        }
    }

    async function fallbackLocation() {
        // Fallback: IP-based geolocation
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const city = data.city || '';
            const region = data.region_code || data.region || '';
            if (city && region) {
                metaLocationEl.textContent = `${city}, ${region}`;
            } else if (city) {
                metaLocationEl.textContent = city;
            } else {
                metaLocationEl.textContent = '';
            }
        } catch {
            metaLocationEl.textContent = '';
        }
    }

    fetchLocation();

    // ========================================
    // CURSOR GLOW EFFECT
    // ========================================
    const cursorGlow = document.createElement('div');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('active');
    });

    function animateGlow() {
        // Smooth follow with easing
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ========================================
    // SUBTLE PARALLAX ON IMAGE
    // ========================================
    const heroImage = document.getElementById('heroImage');

    if (heroContainer && heroImage) {
        document.addEventListener('mousemove', (e) => {
            const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

            requestAnimationFrame(() => {
                // Scale up slightly (1.05) and use percentage translation to ensure edges never show
                heroImage.style.transform = `scale(1.05) translate(${xPercent * -1.5}%, ${yPercent * -1.5}%)`;
            });
        });
    }

    // Start entrance animations immediately
    runEntranceAnimations();

})();
