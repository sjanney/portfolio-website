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

    if (document.getElementById('heroImageContainer') && heroImage) {
        document.addEventListener('mousemove', (e) => {
            const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

            requestAnimationFrame(() => {
                // Scale up slightly (1.05) and use percentage translation to ensure edges never show
                heroImage.style.transform = `scale(1.05) translate(${xPercent * -1.5}%, ${yPercent * -1.5}%)`;
            });
        });
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.work-content').forEach(section => {
        scrollObserver.observe(section);
    });

    // ========================================
    // REFLECTIVE CARD & CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    const reflectiveCard = document.getElementById('reflectiveCard');
    const cardWebcam = document.getElementById('cardWebcam');

    if (reflectiveCard) {
        // 1. Webcam Stream Initialization
        if (cardWebcam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            }).then(stream => {
                cardWebcam.srcObject = stream;
            }).catch(err => {
                console.log('Webcam stream unavailable for reflective card fallback active:', err);
            });
        }

        // 2. Interactive 3D Card Tilt Effect (subtle)
        reflectiveCard.addEventListener('mousemove', (e) => {
            const rect = reflectiveCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            reflectiveCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });

        reflectiveCard.addEventListener('mouseleave', () => {
            reflectiveCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });

        // 3. Real-Time Input Synchronization to ReflectiveCard
        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const subjectInput = document.getElementById('contactSubject');
        const messageInput = document.getElementById('contactMessage');

        const cardName = document.getElementById('cardName');
        const cardEmail = document.getElementById('cardEmail');
        const cardSubject = document.getElementById('cardSubject');

        if (nameInput && cardName) {
            nameInput.addEventListener('input', () => {
                cardName.textContent = nameInput.value.trim() ? nameInput.value.toUpperCase() : 'YOUR NAME';
            });
        }

        if (emailInput && cardEmail) {
            emailInput.addEventListener('input', () => {
                cardEmail.textContent = emailInput.value.trim() ? emailInput.value.toUpperCase() : 'YOUR@EMAIL.COM';
            });
        }

        if (subjectInput && cardSubject) {
            subjectInput.addEventListener('input', () => {
                cardSubject.textContent = subjectInput.value.trim() ? subjectInput.value.toUpperCase() : 'PROJECT INQUIRY';
            });
        }

        if (messageInput && cardSubject) {
            messageInput.addEventListener('input', () => {
                if (!subjectInput.value.trim() && messageInput.value.trim()) {
                    cardSubject.textContent = messageInput.value.trim().toUpperCase();
                }
            });
        }

        // Helper: trigger the card-sent CSS animation
        function playCardSentAnimation() {
            reflectiveCard.classList.remove('card-sent-anim');
            // Force reflow so re-adding the class restarts the animation
            void reflectiveCard.offsetWidth;
            reflectiveCard.classList.add('card-sent-anim');
            reflectiveCard.addEventListener('animationend', () => {
                reflectiveCard.classList.remove('card-sent-anim');
            }, { once: true });
        }

        // 4. Contact Form Submission (Email Delivery)
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formStatus = document.getElementById('formStatus');
                const submitBtn = document.getElementById('submitBtn');

                submitBtn.disabled = true;
                submitBtn.querySelector('span').textContent = 'sending...';
                formStatus.className = 'form-status';
                formStatus.style.display = 'none';

                const formData = new FormData(contactForm);

                try {
                    const response = await fetch(contactForm.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        formStatus.textContent = 'message sent successfully! shane will get back to you soon.';
                        formStatus.classList.add('success');
                        contactForm.reset();

                        // Reset card text defaults
                        if (cardName) cardName.textContent = 'YOUR NAME';
                        if (cardEmail) cardEmail.textContent = 'YOUR@EMAIL.COM';
                        if (cardSubject) cardSubject.textContent = 'PROJECT INQUIRY';

                        // Play the card wobble + glow animation
                        playCardSentAnimation();
                    } else {
                        throw new Error('Server response error');
                    }
                } catch (err) {
                    // Redirect to construction page as fallback instead of mailto
                    formStatus.textContent = 'redirecting to construction page...';
                    formStatus.classList.add('success');

                    // Still play the animation for visual feedback
                    playCardSentAnimation();

                    // Redirect after animation completes
                    setTimeout(() => {
                        window.location.href = 'construction.html';
                    }, 1500);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.querySelector('span').textContent = 'send message';
                }
            });
        }
    }

    // Start entrance animations immediately
    runEntranceAnimations();

})();
