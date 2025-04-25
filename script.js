// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Reveal animations on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Apply initial styles and observe elements
document.querySelectorAll('.section-title, .skill-card, .project-card, .about-content').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Lazy load videos
const lazyLoadVideos = () => {
    const videoElements = document.querySelectorAll('video[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const src = video.getAttribute('data-src');
                
                if (src) {
                    video.src = src;
                    video.removeAttribute('data-src');
                    observer.unobserve(video);
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px 200px 0px' });
    
    videoElements.forEach(video => {
        observer.observe(video);
    });
};

// This function should be defined OUTSIDE the DOMContentLoaded event handler
// So it should be at the same level as your other functions like setupVideoPlayback, etc.
const setupShowMoreLess = () => {
    const projectDescriptions = document.querySelectorAll('.project-desc');
    
    projectDescriptions.forEach(desc => {
        // Create show more button
        const showMoreBtn = document.createElement('span');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.textContent = 'Show more';
        
        // Create a wrapper for proper placement
        const descHeight = desc.scrollHeight;
        const maxHeight = 80; // Same as in CSS
        
        // Only add button if content is taller than max-height
        if (descHeight > maxHeight) {
            desc.parentNode.insertBefore(showMoreBtn, desc.nextSibling);
            
            showMoreBtn.addEventListener('click', () => {
                if (desc.classList.contains('expanded')) {
                    desc.classList.remove('expanded');
                    showMoreBtn.textContent = 'Show more';
                    
                    // Scroll back to the card if needed
                    const card = desc.closest('.project-card');
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else {
                    desc.classList.add('expanded');
                    showMoreBtn.textContent = 'Show less';
                }
            });
        }
    });
};

// Video playing/pausing logic
const setupVideoPlayback = () => {
    const videoContainers = document.querySelectorAll('.project-video-container');
    let currentlyPlaying = null;

    videoContainers.forEach(container => {
        const video = container.querySelector('video');
        const playOverlay = container.querySelector('.play-overlay');
        
        playOverlay.addEventListener('click', () => {
            if (currentlyPlaying && currentlyPlaying !== video) {
                currentlyPlaying.pause();
                // Find and show the overlay for the previously playing video
                document.querySelectorAll('.project-video-container').forEach(c => {
                    if (c.querySelector('video') === currentlyPlaying) {
                        c.querySelector('.play-overlay').style.opacity = '1';
                    }
                });
            }
            
            if (video.paused) {
                video.play();
                playOverlay.style.opacity = '0';
                currentlyPlaying = video;
            } else {
                video.pause();
                playOverlay.style.opacity = '1';
                currentlyPlaying = null;
            }
        });
        
        // Pause video when scrolled out of view
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && video === currentlyPlaying) {
                    video.pause();
                    playOverlay.style.opacity = '1';
                    currentlyPlaying = null;
                }
            });
        }, { threshold: 0.5 });
        
        videoObserver.observe(container);
        
        // Show overlay when video ends
        video.addEventListener('ended', () => {
            playOverlay.style.opacity = '1';
            currentlyPlaying = null;
        });
    });
};

// Horizontal scrolling with mouse drag
const setupDragScroll = () => {
    const slider = document.querySelector('.slider-container');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
};

// Horizontal scrolling navigation
const setupNavButtons = () => {
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // Calculate the total scrollable width
    const totalWidth = slider.scrollWidth;
    
    nextBtn.addEventListener('click', () => {
        const cardWidth = document.querySelector('.project-card').offsetWidth;
        const gap = 32; // 2rem gap converted to pixels
        
        // Calculate remaining scroll distance to the right
        const remainingScroll = totalWidth - (sliderContainer.scrollLeft + sliderContainer.clientWidth);
        
        // If near the end, scroll to the very end to ensure last card is fully visible
        if (remainingScroll < cardWidth * 1.5) {
            sliderContainer.scrollTo({
                left: totalWidth,
                behavior: 'smooth'
            });
        } else {
            sliderContainer.scrollBy({
                left: cardWidth + gap,
                behavior: 'smooth'
            });
        }
    });
    
    prevBtn.addEventListener('click', () => {
        const cardWidth = document.querySelector('.project-card').offsetWidth;
        const gap = 32; // 2rem gap converted to pixels
        
        // If near the beginning, scroll to the very beginning
        if (sliderContainer.scrollLeft < cardWidth * 1.5) {
            sliderContainer.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            sliderContainer.scrollBy({
                left: -(cardWidth + gap),
                behavior: 'smooth'
            });
        }
    });
    
    // Update button states based on scroll position
    const updateButtonStates = () => {
        prevBtn.disabled = sliderContainer.scrollLeft <= 0;
        nextBtn.disabled = sliderContainer.scrollLeft + sliderContainer.clientWidth >= totalWidth;
        
        prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
        nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
    };
    
    // Initial update and add scroll listener
    updateButtonStates();
    sliderContainer.addEventListener('scroll', updateButtonStates);
};

// Setup scroll snap functionality
const setupScrollSnap = () => {
    const slider = document.querySelector('.slider-container');
    const totalSlider = document.querySelector('.slider');
    let isScrolling;
    
    slider.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        
        isScrolling = setTimeout(() => {
            const scrollLeft = slider.scrollLeft;
            const cardWidth = document.querySelector('.project-card').offsetWidth;
            const gap = 32; // 2rem gap
            
            const itemWidth = cardWidth + gap;
            const snapPosition = Math.round(scrollLeft / itemWidth) * itemWidth;
            
            // Check if we're near the end
            if (scrollLeft + slider.clientWidth >= totalSlider.scrollWidth - cardWidth/2) {
                // Snap to end
                slider.scrollTo({
                    left: totalSlider.scrollWidth - slider.clientWidth,
                    behavior: 'smooth'
                });
            } else {
                // Normal snap
                slider.scrollTo({
                    left: snapPosition,
                    behavior: 'smooth'
                });
            }
        }, 150);
    }, { passive: true });
};

// Setup keyboard navigation
const setupKeyboardNav = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            document.querySelector('.next-btn').click();
        } else if (e.key === 'ArrowLeft') {
            document.querySelector('.prev-btn').click();
        }
    });
};

// Setup touch swipe functionality
const setupTouchSwipe = () => {
    const slider = document.querySelector('.slider-container');
    let touchStartX;
    let touchEndX;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    const handleSwipe = () => {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left, go right
            document.querySelector('.next-btn').click();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right, go left
            document.querySelector('.prev-btn').click();
        }
    };
};

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add right padding to the slider to ensure the last card is fully visible
    const slider = document.querySelector('.slider');
    const sliderContainer = document.querySelector('.slider-container');
    
    // Add padding-right to the slider equal to the container width minus one card width
    const cardWidth = document.querySelector('.project-card').offsetWidth;
    const containerWidth = sliderContainer.clientWidth;
    const paddingRight = containerWidth - cardWidth;
    
    // Only add positive padding
    if (paddingRight > 0) {
        slider.style.paddingRight = paddingRight + 'px';
    }
    
   
    // Initialize all components
    lazyLoadVideos();
    setupVideoPlayback();
    setupDragScroll();
    setupNavButtons();
    setupKeyboardNav();
    setupTouchSwipe();
    setupScrollSnap();
    setupShowMoreLess();
});

  