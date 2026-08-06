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
        if (metaTimeEl) {
            metaTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
        }
    }

    updateTime();
    setInterval(updateTime, 1000);

    // ========================================
    // GEOLOCATION
    // ========================================
    const metaLocationEl = document.getElementById('metaLocation');

    async function fetchLocation() {
        if (!metaLocationEl) return;

        const cachedLocation = sessionStorage.getItem('userLocation');
        if (cachedLocation) {
            metaLocationEl.textContent = cachedLocation;
            return;
        }

        try {
            const response = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision || '';
            const region = data.principalSubdivisionCode || data.principalSubdivision || '';
            let regionShort = region;
            if (region.includes('-')) {
                regionShort = region.split('-').pop();
            }
            if (city && regionShort) {
                const locStr = `${city}, ${regionShort}`;
                metaLocationEl.textContent = locStr;
                sessionStorage.setItem('userLocation', locStr);
            } else if (city) {
                metaLocationEl.textContent = city;
                sessionStorage.setItem('userLocation', city);
            } else {
                metaLocationEl.textContent = 'location hidden';
            }
        } catch {
            metaLocationEl.textContent = 'location hidden';
        }
    }
    
    // Call immediately since IP location doesn't trigger browser prompts
    fetchLocation();

    // Only called on desktop if user clicks Allow in the custom popup
    async function fetchPreciseLocation() {
        if (!metaLocationEl) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const data = await response.json();
                        const city = data.city || data.locality || data.principalSubdivision || '';
                        const region = data.principalSubdivisionCode || data.principalSubdivision || '';
                        let regionShort = region;
                        if (region.includes('-')) {
                            regionShort = region.split('-').pop();
                        }
                        
                        if (city && regionShort) {
                            const locStr = `${city}, ${regionShort}`;
                            metaLocationEl.textContent = locStr;
                            sessionStorage.setItem('userLocation', locStr);
                        } else if (city) {
                            metaLocationEl.textContent = city;
                            sessionStorage.setItem('userLocation', city);
                        }
                    } catch (err) {
                        // Keep IP location if precise fails
                    }
                },
                () => {
                    // Keep IP location if denied or failed
                },
                { timeout: 8000, maximumAge: 300000 }
            );
        }
    }
    // fetchLocation(); // Deferred to custom popup logic

    // ========================================
    // CURSOR GLOW EFFECT
    // ========================================
    const cursorGlow = document.querySelector('.cursor-glow') || document.createElement('div');
    if (!cursorGlow.parentNode) {
        cursorGlow.classList.add('cursor-glow');
        document.body.appendChild(cursorGlow);
    }

    const heroImage = document.getElementById('heroImage');
    const canUsePointerEffects = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let glowX = pointerX;
    let glowY = pointerY;
    let pointerFrame = null;

    function renderPointerEffects() {
        pointerFrame = null;
        glowX += (pointerX - glowX) * 0.12;
        glowY += (pointerY - glowY) * 0.12;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

        if (heroImage && !prefersReducedMotion) {
            const xPercent = (pointerX / window.innerWidth - 0.5) * -3;
            const yPercent = (pointerY / window.innerHeight - 0.5) * -3;
            heroImage.style.transform = `scale(1.05) translate3d(${xPercent}%, ${yPercent}%, 0)`;
        }

        if (Math.abs(pointerX - glowX) > 0.1 || Math.abs(pointerY - glowY) > 0.1) {
            pointerFrame = requestAnimationFrame(renderPointerEffects);
        }
    }

    if (canUsePointerEffects && !prefersReducedMotion) {
        document.addEventListener('pointermove', (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            cursorGlow.classList.add('active');
            if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointerEffects);
        }, { passive: true });

        document.addEventListener('pointerleave', () => cursorGlow.classList.remove('active'));
    } else {
        cursorGlow.remove();
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions) : null;

    document.querySelectorAll('.work-content').forEach(section => {
        if (scrollObserver) {
            scrollObserver.observe(section);
        } else {
            section.classList.add('in-view');
        }
    });

    // ========================================
    // REFLECTIVE CARD & CONTACT FORM
    // ========================================
    const contactForm = document.getElementById('contactForm');
    const reflectiveCard = document.getElementById('reflectiveCard');
    const cardWebcam = document.getElementById('cardWebcam');

    if (reflectiveCard) {
        // 1. Webcam Stream Initialization (Deferred)
        window.initCamera = function() {
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
        };

        // 2. Interactive 3D Card Tilt Effect (subtle)
        reflectiveCard.addEventListener('pointermove', (e) => {
            if (!canUsePointerEffects || prefersReducedMotion) return;
            const rect = reflectiveCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            reflectiveCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        }, { passive: true });

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
        const mobilePreviewName = document.querySelector('[data-mobile-preview="name"]');
        const mobilePreviewSubject = document.querySelector('[data-mobile-preview="subject"]');

        function syncPreview(element, value, fallback) {
            if (element) element.textContent = value || fallback;
        }

        if (nameInput && cardName) {
            nameInput.addEventListener('input', () => {
                const value = nameInput.value.trim() ? nameInput.value.toUpperCase() : 'YOUR NAME';
                syncPreview(cardName, value, 'YOUR NAME');
                syncPreview(mobilePreviewName, value.toLowerCase(), 'your name');
            });
        }

        if (emailInput && cardEmail) {
            emailInput.addEventListener('input', () => {
                cardEmail.textContent = emailInput.value.trim() ? emailInput.value.toUpperCase() : 'YOUR@EMAIL.COM';
            });
        }

        if (subjectInput && cardSubject) {
            subjectInput.addEventListener('input', () => {
                const value = subjectInput.value.trim() ? subjectInput.value.toUpperCase() : 'PROJECT INQUIRY';
                syncPreview(cardSubject, value, 'PROJECT INQUIRY');
                syncPreview(mobilePreviewSubject, value.toLowerCase(), 'project inquiry');
            });
        }

        if (messageInput && cardSubject) {
            messageInput.addEventListener('input', () => {
                if (!subjectInput.value.trim() && messageInput.value.trim()) {
                    const value = messageInput.value.trim().toUpperCase();
                    syncPreview(cardSubject, value, 'PROJECT INQUIRY');
                    syncPreview(mobilePreviewSubject, value.toLowerCase(), 'project inquiry');
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
                        contactForm.reset();
                        window.location.href = 'success.html';
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

    // ========================================
    // CUSTOM PERMISSIONS POPUP
    // ========================================
    function initPermissions() {
        const hasPrompted = localStorage.getItem('permissionsPrompted');
        const isMobile = window.innerWidth <= 768;
        
        if (hasPrompted === 'true') {
            // Already allowed
            if (!isMobile) {
                fetchPreciseLocation();
                if (document.getElementById('cardWebcam') && typeof window.initCamera === 'function') {
                    window.initCamera();
                }
            }
        } else if (hasPrompted === 'false') {
            // Previously denied via custom popup, do nothing
        } else {
            // Show custom popup after a short delay
            setTimeout(() => {
                const popup = document.createElement('div');
                popup.className = 'permission-popup';
                const popupText = isMobile 
                    ? "Allow access to location for precise local time?" 
                    : "Allow access to location and camera for interactive features and precise local time?";
                    
                popup.innerHTML = `
                    <div class="permission-content">
                        <h3>Enhance your experience</h3>
                        <p>${popupText}</p>
                        <div class="permission-actions">
                            <button class="btn-deny" id="btnDenyPerm">Not Now</button>
                            <button class="btn-allow" id="btnAllowPerm">Allow</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(popup);
                
                // Trigger reflow
                void popup.offsetWidth;
                popup.classList.add('show');
                
                document.getElementById('btnDenyPerm').addEventListener('click', () => {
                    localStorage.setItem('permissionsPrompted', 'false');
                    popup.classList.remove('show');
                    setTimeout(() => popup.remove(), 400);
                });
                
                document.getElementById('btnAllowPerm').addEventListener('click', () => {
                    localStorage.setItem('permissionsPrompted', 'true');
                    popup.classList.remove('show');
                    setTimeout(() => popup.remove(), 400);
                    
                    if (!isMobile) {
                        fetchPreciseLocation();
                        if (document.getElementById('cardWebcam') && typeof window.initCamera === 'function') {
                            window.initCamera();
                        }
                    }
                });
            }, 1500);
        }
    }

    initPermissions();

    // Start entrance animations immediately
    runEntranceAnimations();

})();
