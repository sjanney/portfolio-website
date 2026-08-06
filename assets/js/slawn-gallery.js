(function () {
    'use strict';

    const gallery = document.getElementById('slawnGallery');
    const detail = document.querySelector('.detail-container');
    const galleryGrid = document.getElementById('slawnGalleryGrid');
    const id = Number.parseInt(new URLSearchParams(window.location.search).get('id'), 10);

    if (!gallery || !galleryGrid || id !== 0) return;

    const photos = [
        'IMG_1132.jpeg',
        'IMG_1137.jpeg',
        'IMG_1142.jpeg',
        'IMG_1145.jpeg',
        'IMG_1150.jpeg',
        'IMG_1151.jpeg',
        'IMG_1154.jpeg',
        'IMG_1155.jpeg',
        'IMG_1160.jpeg',
        'IMG_1172.jpeg',
        'IMG_1238.jpeg',
        'IMG_1266.jpeg',
        'IMG_1267.jpeg',
        'IMG_1283.jpeg',
        'IMG_1287.jpeg',
        'IMG_1298.jpeg',
        'IMG_1299.jpeg',
        'IMG_1316.jpeg',
        'IMG_1321.jpeg',
        'IMG_1327.jpeg'
    ];

    const randomizedPhotos = [...photos];
    for (let index = randomizedPhotos.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [randomizedPhotos[index], randomizedPhotos[randomIndex]] = [
            randomizedPhotos[randomIndex],
            randomizedPhotos[index]
        ];
    }

    const lightbox = document.createElement('div');
    lightbox.className = 'slawn-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
        <button class="slawn-lightbox-close" type="button" aria-label="Close photo">×</button>
        <img class="slawn-lightbox-image" alt="">
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.slawn-lightbox-image');
    const closeButton = lightbox.querySelector('.slawn-lightbox-close');

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
    }

    function openLightbox(image) {
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
    }

    randomizedPhotos.forEach((filename, index) => {
        const button = document.createElement('button');
        const image = document.createElement('img');

        button.className = 'slawn-gallery-item';
        button.type = 'button';
        button.setAttribute('aria-label', `Open Slawn photo ${index + 1}`);
        image.src = `assets/images/slawn/${filename}?v=3`;
        image.alt = `Slawn gallery photo ${index + 1}`;
        image.loading = index < (window.innerWidth <= 768 ? 2 : 5) ? 'eager' : 'lazy';
        image.fetchPriority = index === 0 ? 'high' : 'auto';
        image.decoding = 'async';

        button.appendChild(image);
        button.addEventListener('click', () => openLightbox(image));
        galleryGrid.appendChild(button);
    });

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeLightbox();
    });

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })
        : null;

    galleryGrid.querySelectorAll('.slawn-gallery-item').forEach(item => {
        if (observer) observer.observe(item);
        else item.classList.add('is-visible');
    });

    gallery.hidden = false;
    if (detail) detail.hidden = true;
    document.title = 'Shane Janney — slawn on w14th street';
})();
