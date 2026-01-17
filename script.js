// Smooth scrolling for navigation links (excluding gallery button)
document.querySelectorAll('a[href^="#"]:not(.gallery-btn)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80; // Height of fixed header
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Gallery dropdown toggle (only if elements exist)
const galleryBtn = document.querySelector('.gallery-btn');
const dropdownContent = document.querySelector('.dropdown-content');

if (galleryBtn && dropdownContent) {
    galleryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });
}

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Add scroll effect to navigation
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Video Modal Functionality
const videoModal = document.createElement('div');
videoModal.className = 'video-modal';
videoModal.innerHTML = `
    <div class="video-modal-content">
        <span class="close-modal">&times;</span>
        <video controls>
            <source src="" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="video-controls">
            <button class="play-pause-btn"><i class="fas fa-play"></i></button>
            <div class="video-progress">
                <div class="video-progress-filled"></div>
            </div>
            <div class="video-time">0:00 / 0:00</div>
            <button class="fullscreen-btn"><i class="fas fa-expand"></i></button>
        </div>
    </div>
`;
document.body.appendChild(videoModal);

// Image modal
const imageModal = document.createElement('div');
imageModal.className = 'image-modal';
imageModal.innerHTML = `
    <div class="image-modal-content">
        <span class="close-image-modal">&times;</span>
        <img src="" alt="">
    </div>
`;
document.body.appendChild(imageModal);

// Close image modal
imageModal.querySelector('.close-image-modal').addEventListener('click', () => {
    imageModal.classList.remove('active');
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.classList.remove('active');
    }
});

// Video play button functionality
document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', function() {
        const videoCard = this.closest('.video-card');
        const videoTitle = videoCard.querySelector('h3').textContent;
        const videoDesc = videoCard.querySelector('p').textContent;

        // Set up video modal
        const modalVideo = videoModal.querySelector('video');
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = videoTitle;
        modalTitle.style.color = 'white';
        modalTitle.style.margin = '1rem';
        modalTitle.style.textAlign = 'center';

        // Insert title before video
        const videoContent = videoModal.querySelector('.video-modal-content');
        videoContent.insertBefore(modalTitle, videoContent.querySelector('video'));

        // Set video source based on title (in a real app, this would be actual video URLs)
        let videoSrc = '';
        if (videoTitle.includes('Adventures')) {
            videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
        } else if (videoTitle.includes('Brunch') || videoTitle.includes('Cooking')) {
            videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
        } else if (videoTitle.includes('Traditions')) {
            videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
        } else {
            videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
        }

        modalVideo.src = videoSrc;
        modalVideo.load();

        // Show modal
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Set up video controls
        setupVideoControls(modalVideo);
    });
});

// Close modal functionality
videoModal.querySelector('.close-modal').addEventListener('click', function() {
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Remove title when closing
    const title = videoModal.querySelector('h3');
    if (title) title.remove();

    // Pause video
    const video = videoModal.querySelector('video');
    video.pause();
    video.currentTime = 0;
});

// Close modal when clicking outside
videoModal.addEventListener('click', function(e) {
    if (e.target === videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Remove title when closing
        const title = videoModal.querySelector('h3');
        if (title) title.remove();

        // Pause video
        const video = videoModal.querySelector('video');
        video.pause();
        video.currentTime = 0;
    }
});

// Video controls setup
function setupVideoControls(video) {
    const playPauseBtn = videoModal.querySelector('.play-pause-btn');
    const progressBar = videoModal.querySelector('.video-progress');
    const progressFilled = videoModal.querySelector('.video-progress-filled');
    const timeDisplay = videoModal.querySelector('.video-time');
    const fullscreenBtn = videoModal.querySelector('.fullscreen-btn');

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Update progress bar
    video.addEventListener('timeupdate', function() {
        const progress = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = progress + '%';

        // Update time display
        const currentMinutes = Math.floor(video.currentTime / 60);
        const currentSeconds = Math.floor(video.currentTime % 60);
        const durationMinutes = Math.floor(video.duration / 60);
        const durationSeconds = Math.floor(video.duration % 60);

        timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    });

    // Seek functionality
    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.pageX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (videoModal.classList.contains('active')) {
            if (e.code === 'Space') {
                e.preventDefault();
                if (video.paused) {
                    video.play();
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            } else if (e.code === 'Escape') {
                videoModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                video.pause();
                video.currentTime = 0;
            }
        }
    });
}

// Featured video functionality
document.addEventListener('DOMContentLoaded', function() {
    loadAdvertTicker(); // Load advert ticker from JSON
    loadFeaturedVideo();
    loadHomePagePhotos(); // Load photos for homepage gallery
    loadHomePageVideos(); // Load videos for homepage gallery
    loadHomePageBlogPosts(); // Load blog posts for homepage

    const featuredPlayBtn = document.getElementById('featured-play-btn');
    if (featuredPlayBtn) {
        featuredPlayBtn.addEventListener('click', function() {
            // Set up featured video modal
            const modalVideo = videoModal.querySelector('video');
            const modalTitle = document.createElement('h3');
            modalTitle.textContent = document.getElementById('featured-title').textContent;
            modalTitle.style.color = 'white';
            modalTitle.style.margin = '1rem';
            modalTitle.style.textAlign = 'center';

            // Insert title before video
            const videoContent = videoModal.querySelector('.video-modal-content');
            videoContent.insertBefore(modalTitle, videoContent.querySelector('video'));

            // Set featured video source
            const featuredVideoSrc = featuredPlayBtn.dataset.videoSrc || 'https://www.w3schools.com/html/mov_bbb.mp4';
            modalVideo.src = featuredVideoSrc;
            modalVideo.load();

            // Show modal
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Handle video load errors
            modalVideo.addEventListener('error', () => {
                alert('Video failed to load. Please check the video source.');
            });

            // Set up video controls
            setupVideoControls(modalVideo);
        });
    }
});

async function loadFeaturedVideo() {
    try {
        const response = await fetch('/api/videos/featured');
        if (response.ok) {
            const featuredVideo = await response.json();
            if (featuredVideo) {
                // Update featured video section
                document.getElementById('featured-title').textContent = featuredVideo.title;
                document.getElementById('featured-description').textContent = featuredVideo.description || 'Watch this featured video!';
                document.getElementById('featured-image').src = `${featuredVideo.thumbnail || 'https://via.placeholder.com/1920x500/667eea/FFFFFF?text=' + encodeURIComponent(featuredVideo.title)}`;
                document.getElementById('featured-image').alt = featuredVideo.title;

                // Set video source for play button
                const playBtn = document.getElementById('featured-play-btn');
                playBtn.dataset.videoSrc = `${featuredVideo.filepath}`;
                playBtn.style.display = 'inline-block';
            } else {
                // No featured video
                document.getElementById('featured-title').textContent = 'No Featured Video';
                document.getElementById('featured-description').textContent = 'Upload and set a featured video from the admin panel.';
                document.getElementById('featured-image').src = 'https://via.placeholder.com/1920x500/667eea/FFFFFF?text=No+Featured+Video';
                document.getElementById('featured-play-btn').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading featured video:', error);
    }
}

async function loadHomePagePhotos() {
    console.log('loadHomePagePhotos: Starting...');
    const photoGrid = document.getElementById('photo-grid');
    if (!photoGrid) {
        console.log('loadHomePagePhotos: Photo grid not found');
        return; // Only run on pages with photo grid
    }

    console.log('loadHomePagePhotos: Found photo grid, fetching photos...');

    try {
        const response = await fetch('/api/photos?limit=50'); // Load all photos
        console.log('loadHomePagePhotos: API response status:', response.status);

        if (response.ok) {
            const allPhotos = await response.json();
            console.log('loadHomePagePhotos: Received photos:', allPhotos);

            // Clear loading placeholder
            photoGrid.innerHTML = '';
            console.log('loadHomePagePhotos: Cleared photo grid');

            if (allPhotos.length === 0) {
                // Show message if no photos
                photoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; font-style: italic;">No photos uploaded yet. Visit the admin panel to add photos.</p>';
                console.log('loadHomePagePhotos: No photos found, showing message');
                return;
            }

            // Initially show only 4 photos
            let displayedCount = 4;
            const displayPhotos = allPhotos.slice(0, displayedCount);
            console.log('loadHomePagePhotos: Creating initial photo cards for', displayPhotos.length, 'photos');

            displayPhotos.forEach((photo, index) => {
                console.log(`loadHomePagePhotos: Creating card ${index + 1}:`, photo.title);
                const photoCard = document.createElement('div');
                photoCard.className = 'photo-card';
                photoCard.innerHTML = `
                    <img src="${photo.filepath}" alt="${photo.title}" onerror="console.error('Failed to load image:', this.src)">
                    <div class="photo-overlay">
                        <h3>${photo.title}</h3>
                        <p>${photo.description || `Uploaded on ${new Date(photo.created_at).toLocaleDateString()}`}</p>
                    </div>
                `;
                photoGrid.appendChild(photoCard);

                // Add click handler for full-size display
                photoCard.addEventListener('click', () => {
                    const img = imageModal.querySelector('img');
                    img.src = photo.filepath;
                    img.alt = photo.title;
                    imageModal.classList.add('active');
                });
            });

            console.log('loadHomePagePhotos: Initial photo cards added successfully');

            // Add "View More" button if there are more than 4 photos
            if (allPhotos.length > 4) {
                const viewMoreDiv = document.createElement('div');
                viewMoreDiv.className = 'photo-card view-more-card';
                viewMoreDiv.id = 'photos-view-more';
                viewMoreDiv.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 2rem; margin-bottom: 8px; animation: bounce 2s infinite;">👆</div>
                            <div style="font-weight: bold; font-size: 1.1rem;">View More Photos</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">${allPhotos.length - displayedCount} more available</div>
                        </div>
                    </div>
                `;

                // Add click handler for view more
                viewMoreDiv.addEventListener('click', function() {
                    const remainingPhotos = allPhotos.slice(displayedCount);
                    const photosToShow = remainingPhotos.slice(0, 4); // Show 4 more at a time

                    photosToShow.forEach((photo) => {
                        const photoCard = document.createElement('div');
                        photoCard.className = 'photo-card';
                        photoCard.style.opacity = '0';
                        photoCard.style.transform = 'translateY(20px)';
                        photoCard.innerHTML = `
                            <img src="${photo.filepath}" alt="${photo.title}" onerror="console.error('Failed to load image:', this.src)">
                            <div class="photo-overlay">
                                <h3>${photo.title}</h3>
                                <p>${photo.description || `Uploaded on ${new Date(photo.created_at).toLocaleDateString()}`}</p>
                            </div>
                        `;
                        photoGrid.insertBefore(photoCard, viewMoreDiv);

                        // Animate in
                        setTimeout(() => {
                            photoCard.style.transition = 'all 0.5s ease';
                            photoCard.style.opacity = '1';
                            photoCard.style.transform = 'translateY(0)';
                        }, 50);
                    });

                    displayedCount += photosToShow.length;

                    // Update view more button or remove if no more photos
                    const remainingCount = allPhotos.length - displayedCount;
                    if (remainingCount <= 0) {
                        viewMoreDiv.remove();
                    } else {
                        viewMoreDiv.querySelector('.photo-card > div > div:last-child').textContent = `${remainingCount} more available`;
                    }
                });

                photoGrid.appendChild(viewMoreDiv);
                console.log('loadHomePagePhotos: Added view more button');
            }
        } else {
            console.error('loadHomePagePhotos: Failed to load photos from API:', response.status);
            photoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Failed to load photos. Please try again later.</p>';
        }
    } catch (error) {
        console.error('loadHomePagePhotos: Error loading photos:', error);
        photoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Error loading photos. Please check your connection.</p>';
    }
}

async function loadHomePageVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return; // Only run on pages with video grid

    try {
        const response = await fetch('/api/videos?limit=50'); // Load all videos
        if (response.ok) {
            const allVideos = await response.json();

            // Clear loading placeholder
            videoGrid.innerHTML = '';

            if (allVideos.length === 0) {
                // Show message if no videos
                videoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; font-style: italic;">No videos uploaded yet. Visit the admin panel to add videos.</p>';
                return;
            }

            // Initially show only 4 videos
            let displayedCount = 4;
            const displayVideos = allVideos.slice(0, displayedCount);

            displayVideos.forEach((video) => {
                const videoCard = document.createElement('div');
                videoCard.className = 'video-card';
                videoCard.setAttribute('data-category', video.category || 'general');

                const uploadDate = new Date(video.created_at);
                const now = new Date();
                const diffTime = Math.abs(now - uploadDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let timeAgo;
                if (diffDays === 1) {
                    timeAgo = '1 day ago';
                } else if (diffDays < 7) {
                    timeAgo = `${diffDays} days ago`;
                } else if (diffDays < 30) {
                    const weeks = Math.floor(diffDays / 7);
                    timeAgo = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                } else {
                    timeAgo = uploadDate.toLocaleDateString();
                }

                // Use actual video URL or fallback
                const videoSrc = video.filepath || 'https://www.w3schools.com/html/mov_bbb.mp4';

                videoCard.innerHTML = `
                    <div class="video-container">
                        <video class="inline-video" poster="${video.thumbnail || 'https://via.placeholder.com/400x225/4A90E2/FFFFFF?text=' + encodeURIComponent(video.title)}">
                            <source src="${videoSrc}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-overlay">
                            <button class="play-pause-btn">
                                <i class="fas fa-play"></i>
                            </button>
                        </div>
                        <div class="video-controls">
                            <div class="progress-bar">
                                <div class="progress-filled"></div>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <h3>${video.title}</h3>
                        <p>${video.description || 'Watch this amazing video!'}</p>
                        <div class="video-stats">
                            <span><i class="fas fa-eye"></i> ${video.views || 0} views</span>
                            <span><i class="fas fa-calendar"></i> ${timeAgo}</span>
                        </div>
                    </div>
                `;

                // Get video elements
                const videoElement = videoCard.querySelector('.inline-video');
                const playPauseBtn = videoCard.querySelector('.play-pause-btn');
                const progressBar = videoCard.querySelector('.progress-bar');
                const progressFilled = videoCard.querySelector('.progress-filled');
                const overlay = videoCard.querySelector('.video-overlay');

                // Play/pause functionality
                function togglePlayPause() {
                    console.log('🎬 BUTTON CLICKED - Video paused:', videoElement.paused);

                    // Add visual feedback immediately
                    playPauseBtn.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        playPauseBtn.style.transform = 'scale(1)';
                    }, 150);

                    if (videoElement.paused) {
                        console.log('▶️ STARTING VIDEO PLAY...');
                        videoElement.play().then(() => {
                            console.log('✅ VIDEO PLAYING SUCCESSFULLY');
                            playPauseBtn.innerHTML = '<i class="fas fa-pause" style="color: #4A90E2;"></i>';
                            playPauseBtn.style.backgroundColor = 'rgba(74, 144, 226, 0.9)';
                            playPauseBtn.style.border = '2px solid #4A90E2';
                            overlay.style.opacity = '0';
                            console.log('🎯 OVERLAY HIDDEN - VIDEO IS VISIBLE');

                            // Add playing indicator
                            const playingIndicator = document.createElement('div');
                            playingIndicator.textContent = '▶ NOW PLAYING';
                            playingIndicator.style.cssText = `
                                position: absolute;
                                top: 10px;
                                left: 10px;
                                background: rgba(74, 144, 226, 0.9);
                                color: white;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 12px;
                                font-weight: bold;
                                z-index: 10;
                            `;
                            videoCard.appendChild(playingIndicator);
                            setTimeout(() => playingIndicator.remove(), 2000);

                        }).catch(error => {
                            console.error('❌ VIDEO PLAY FAILED:', error);
                            alert('Video failed to play. This might be due to browser autoplay policies. Try clicking anywhere on the page first, then click the play button.');
                        });
                    } else {
                        console.log('⏸️ PAUSING VIDEO...');
                        videoElement.pause();
                        console.log('✅ VIDEO PAUSED SUCCESSFULLY');
                        playPauseBtn.innerHTML = '<i class="fas fa-play" style="color: #E74C3C;"></i>';
                        playPauseBtn.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
                        playPauseBtn.style.border = '2px solid #E74C3C';
                        overlay.style.opacity = '1';
                        console.log('🎯 OVERLAY SHOWN - PLAY BUTTON VISIBLE');

                        // Add paused indicator
                        const pausedIndicator = document.createElement('div');
                        pausedIndicator.textContent = '⏸ PAUSED';
                        pausedIndicator.style.cssText = `
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            background: rgba(231, 76, 60, 0.9);
                            color: white;
                            padding: 5px 10px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: bold;
                            z-index: 10;
                        `;
                        videoCard.appendChild(pausedIndicator);
                        setTimeout(() => pausedIndicator.remove(), 2000);
                    }
                }

                playPauseBtn.addEventListener('click', togglePlayPause);
                overlay.addEventListener('click', togglePlayPause);

                // Progress bar functionality
                videoElement.addEventListener('timeupdate', () => {
                    const progress = (videoElement.currentTime / videoElement.duration) * 100;
                    progressFilled.style.width = progress + '%';
                });

                progressBar.addEventListener('click', (e) => {
                    const rect = progressBar.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    videoElement.currentTime = pos * videoElement.duration;
                });

                // Show overlay on pause
                videoElement.addEventListener('pause', () => {
                    overlay.style.opacity = '1';
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                });

                // Hide overlay on play
                videoElement.addEventListener('play', () => {
                    overlay.style.opacity = '0';
                });

                videoGrid.appendChild(videoCard);
            });

            // Add "View More" button if there are more than 4 videos
            if (allVideos.length > 4) {
                const viewMoreDiv = document.createElement('div');
                viewMoreDiv.className = 'video-card view-more-card';
                viewMoreDiv.id = 'videos-view-more';
                viewMoreDiv.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 2rem; margin-bottom: 8px; animation: bounce 2s infinite;">🎬</div>
                            <div style="font-weight: bold; font-size: 1.1rem;">View More Videos</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">${allVideos.length - displayedCount} more available</div>
                        </div>
                    </div>
                `;

                // Add click handler for view more
                viewMoreDiv.addEventListener('click', function() {
                    const remainingVideos = allVideos.slice(displayedCount);
                    const videosToShow = remainingVideos.slice(0, 4); // Show 4 more at a time

                    videosToShow.forEach((video) => {
                        const videoCard = document.createElement('div');
                        videoCard.className = 'video-card';
                        videoCard.setAttribute('data-category', video.category || 'general');
                        videoCard.style.opacity = '0';
                        videoCard.style.transform = 'translateY(20px)';

                        const uploadDate = new Date(video.created_at);
                        const now = new Date();
                        const diffTime = Math.abs(now - uploadDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let timeAgo;
                        if (diffDays === 1) {
                            timeAgo = '1 day ago';
                        } else if (diffDays < 7) {
                            timeAgo = `${diffDays} days ago`;
                        } else if (diffDays < 30) {
                            const weeks = Math.floor(diffDays / 7);
                            timeAgo = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
                        } else {
                            timeAgo = uploadDate.toLocaleDateString();
                        }

                        videoCard.innerHTML = `
                            <div class="video-thumbnail">
                                <img src="${video.thumbnail || 'https://via.placeholder.com/400x225/4A90E2/FFFFFF?text=' + encodeURIComponent(video.title)}" alt="${video.title}">
                                <div class="play-button">
                                    <i class="fas fa-play"></i>
                                </div>
                                <div class="video-duration">--:--</div>
                            </div>
                            <div class="video-info">
                                <h3>${video.title}</h3>
                                <p>${video.description || 'Watch this amazing video!'}</p>
                                <div class="video-stats">
                                    <span><i class="fas fa-eye"></i> ${video.views || 0} views</span>
                                    <span><i class="fas fa-calendar"></i> ${timeAgo}</span>
                                </div>
                            </div>
                        `;

                        // Add click handler for video playback
                        const playButton = videoCard.querySelector('.play-button');
                        playButton.addEventListener('click', function() {
                            const modal = document.querySelector('.video-modal');
                            const modalVideo = modal.querySelector('video');
                            const modalTitle = modal.querySelector('h3');

                            if (modalVideo && modalTitle) {
                                modalTitle.textContent = video.title;

                                // Insert title before video
                                const videoContent = modal.querySelector('.video-modal-content');
                                videoContent.insertBefore(modalTitle, modalVideo);

                                // Set video source based on title
                                let videoSrc = video.filepath || 'https://www.w3schools.com/html/mov_bbb.mp4';
                                if (video.title.includes('Adventures')) {
                                    videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
                                } else if (video.title.includes('Brunch') || video.title.includes('Cooking')) {
                                    videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
                                } else if (video.title.includes('Traditions')) {
                                    videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4';
                                }

                                modalVideo.src = videoSrc;
                                modalVideo.load();

                                modal.classList.add('active');
                                document.body.style.overflow = 'hidden';

                                // Handle video load errors
                                modalVideo.addEventListener('error', () => {
                                    alert('Video failed to load. Please ensure the video is in MP4 format and try again.');
                                });
                            }
                        });

                        videoGrid.insertBefore(videoCard, viewMoreDiv);

                        // Animate in
                        setTimeout(() => {
                            videoCard.style.transition = 'all 0.5s ease';
                            videoCard.style.opacity = '1';
                            videoCard.style.transform = 'translateY(0)';
                        }, 50);
                    });

                    displayedCount += videosToShow.length;

                    // Update view more button or remove if no more videos
                    const remainingCount = allVideos.length - displayedCount;
                    if (remainingCount <= 0) {
                        viewMoreDiv.remove();
                    } else {
                        viewMoreDiv.querySelector('.video-card > div > div:last-child').textContent = `${remainingCount} more available`;
                    }
                });

                videoGrid.appendChild(viewMoreDiv);
            }

            // Re-initialize category filtering after loading videos
            setTimeout(() => {
                const categoryBtns = document.querySelectorAll('.category-btn');
                const categoryTags = document.querySelectorAll('.category-tag');
                const videoCards = document.querySelectorAll('.video-card:not(.view-more-card)');

                // Category button filtering
                categoryBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Remove active class from all buttons
                        categoryBtns.forEach(b => b.classList.remove('active'));
                        // Add active class to clicked button
                        this.classList.add('active');

                        const category = this.getAttribute('data-category');

                        // Filter video cards
                        videoCards.forEach(card => {
                            if (category === 'all' || card.getAttribute('data-category') === category) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });

                        // Hide view more button when filtering
                        const viewMoreBtn = document.getElementById('videos-view-more');
                        if (viewMoreBtn) viewMoreBtn.style.display = 'none';
                    });
                });

                // Category tag filtering
                categoryTags.forEach(tag => {
                    tag.addEventListener('click', function(e) {
                        e.preventDefault();

                        // Remove active class from all tags
                        categoryTags.forEach(t => t.classList.remove('active'));
                        // Add active class to clicked tag
                        this.classList.add('active');

                        const tagText = this.textContent.toLowerCase();

                        // Filter based on tag
                        videoCards.forEach(card => {
                            const title = card.querySelector('h3').textContent.toLowerCase();
                            const desc = card.querySelector('p').textContent.toLowerCase();

                            if (tagText.includes('easter') && (title.includes('easter') || desc.includes('easter'))) {
                                card.style.display = 'block';
                            } else if (tagText.includes('family') && (title.includes('family') || desc.includes('family'))) {
                                card.style.display = 'block';
                            } else if (tagText.includes('cooking') && (title.includes('cooking') || desc.includes('cooking') || title.includes('brunch'))) {
                                card.style.display = 'block';
                            } else if (tagText.includes('traditions') && (title.includes('traditions') || desc.includes('traditions'))) {
                                card.style.display = 'block';
                            } else if (tagText.includes('adventures') && (title.includes('adventures') || desc.includes('adventures'))) {
                                card.style.display = 'block';
                            } else if (this.classList.contains('active') && tagText.includes('eastervlogs')) {
                                card.style.display = 'block';
                            } else if (!this.classList.contains('active')) {
                                card.style.display = 'none';
                            }
                        });

                        // Hide view more button when filtering
                        const viewMoreBtn = document.getElementById('videos-view-more');
                        if (viewMoreBtn) viewMoreBtn.style.display = 'none';
                    });
                });
            }, 100);
        } else {
            console.error('Failed to load videos from API');
            videoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Failed to load videos. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        videoGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Error loading videos. Please check your connection.</p>';
    }
}

async function loadHomePageBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return; // Only run on pages with blog grid

    try {
        const response = await fetch('/api/blog-posts?limit=3&status=published'); // Load up to 3 blog posts for homepage
        if (response.ok) {
            const blogPosts = await response.json();

            // Clear loading placeholder
            blogGrid.innerHTML = '';

            if (blogPosts.length === 0) {
                // Show message if no blog posts
                blogGrid.innerHTML = '<p style="text-align: center; padding: 2rem; font-style: italic;">No blog posts published yet. Visit the admin panel to create posts.</p>';
                return;
            }

            // Show up to 3 blog posts on homepage
            const displayPosts = blogPosts.slice(0, 3);

            displayPosts.forEach((post) => {
                const blogArticle = document.createElement('article');
                blogArticle.className = 'blog-post';

                const publishDate = new Date(post.created_at);
                const formattedDate = publishDate.toLocaleDateString();

                // Only include image if featured_image exists and is not empty
                const imageHtml = post.featured_image && post.featured_image.trim() !== ''
                    ? `<img src="${post.featured_image}" alt="${post.title}">`
                    : '';

                blogArticle.innerHTML = `
                    ${imageHtml}
                    <div class="blog-content">
                        <h3>${post.title}</h3>
                        <p>${post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}</p>
                        <div class="blog-meta" style="margin-top: 10px; font-size: 14px; color: #666;">
                            <span><span class="meta-icon">📅</span> ${formattedDate}</span>
                            <span style="margin-left: 15px;"><span class="meta-icon">🏷️</span> ${post.category}</span>
                        </div>
                        <a href="#" class="read-more" data-post-id="${post.id}">Read More</a>
                    </div>
                `;

                // Add click handler for "Read More" - could open a modal or redirect to full post
                const readMoreLink = blogArticle.querySelector('.read-more');
                readMoreLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    // For now, just show a simple alert. In a full implementation, this could open a modal or redirect
                    alert(`"${post.title}"\n\n${post.content}\n\nPublished: ${formattedDate}`);
                });

                blogGrid.appendChild(blogArticle);
            });

            // Add "View All Blog Posts" link if there are more than 3 posts
            if (blogPosts.length > 3) {
                const viewAllArticle = document.createElement('article');
                viewAllArticle.className = 'blog-post view-all-post';
                viewAllArticle.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); border-radius: 8px; color: white;">
                        <div style="text-align: center;">
                            <h3 style="margin: 0 0 10px 0;">More Blog Posts</h3>
                            <p style="margin: 0 0 15px 0;">Read all our latest articles and stories</p>
                            <a href="#" style="color: #4A90E2; text-decoration: none; font-weight: bold;">View All Posts (${blogPosts.length})</a>
                        </div>
                    </div>
                    <div class="blog-content" style="display: none;"></div>
                `;
                blogGrid.appendChild(viewAllArticle);
            }
        } else {
            console.error('Failed to load blog posts from API');
            blogGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Failed to load blog posts. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogGrid.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Error loading blog posts. Please check your connection.</p>';
    }
}

    const categoryBtns = document.querySelectorAll('.category-btn');
    const categoryTags = document.querySelectorAll('.category-tag');
    const videoCards = document.querySelectorAll('.video-card');

    // Category button filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            // Filter video cards
            videoCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Category tag filtering
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all tags
            categoryTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            this.classList.add('active');

            const tagText = this.textContent.toLowerCase();

            // Filter based on tag
            videoCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();

                if (tagText.includes('easter') && (title.includes('easter') || desc.includes('easter'))) {
                    card.style.display = 'block';
                } else if (tagText.includes('family') && (title.includes('family') || desc.includes('family'))) {
                    card.style.display = 'block';
                } else if (tagText.includes('cooking') && (title.includes('cooking') || desc.includes('cooking') || title.includes('brunch'))) {
                    card.style.display = 'block';
                } else if (tagText.includes('traditions') && (title.includes('traditions') || desc.includes('traditions'))) {
                    card.style.display = 'block';
                } else if (tagText.includes('adventures') && (title.includes('adventures') || desc.includes('adventures'))) {
                    card.style.display = 'block';
                } else if (this.classList.contains('active') && tagText.includes('eastervlogs')) {
                    card.style.display = 'block';
                } else if (!this.classList.contains('active')) {
                    card.style.display = 'none';
                }
            });
        });
    });

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = this.querySelector('input[type="text"]').value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const message = this.querySelector('textarea').value.trim();

    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        if (response.ok) {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
        } else {
            const error = await response.json();
            alert('Failed to send message: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error sending contact message:', error);
        alert('Failed to send message. Please try again later.');
    }
});

// Load and initialize advert ticker
async function loadAdvertTicker() {
    console.log('loadAdvertTicker: Starting...');
    try {
        const response = await fetch('advert.json');
        console.log('loadAdvertTicker: Fetch response status:', response.status);

        if (!response.ok) {
            console.error('Failed to load advert.json');
            return;
        }

        const advertData = await response.json();
        console.log('loadAdvertTicker: Loaded data:', advertData);

        const messages = advertData.messages || [];
        const settings = advertData.settings || {};

        if (messages.length === 0) {
            console.log('No advert messages found');
            return;
        }

        // Load all messages into single ticker
        const tickerWrapper = document.getElementById('ticker-wrapper');
        if (tickerWrapper) {
            tickerWrapper.innerHTML = '';
            console.log('loadAdvertTicker: Cleared ticker wrapper');

            const slideDuration = settings.animationDuration || 15;

            let currentIndex = 0;
            let tickerItems = [];

            messages.forEach((message, index) => {
                console.log(`loadAdvertTicker: Creating message ${index + 1}: "${message}"`);
                const tickerItem = document.createElement('div');
                tickerItem.className = 'ticker-item';
                tickerItem.textContent = message;
                tickerItem.style.transition = `transform ${slideDuration}s linear`;
                if (index === 0) {
                    tickerItem.style.opacity = '1';
                    tickerItem.style.transform = 'translateX(100%)';
                    // Start sliding immediately
                    setTimeout(() => {
                        tickerItem.style.transform = 'translateX(-100%)';
                    }, 10); // Small delay to start transition
                } else {
                    tickerItem.style.opacity = '0';
                    tickerItem.style.transform = 'translateX(100%)';
                }

                tickerWrapper.appendChild(tickerItem);
                tickerItems.push(tickerItem);
            });

            // Function to cycle through messages
            function cycleMessages() {
                // Hide current, reset position
                tickerItems[currentIndex].style.opacity = '0';
                tickerItems[currentIndex].style.transform = 'translateX(100%)';
                // Show next and start sliding
                currentIndex = (currentIndex + 1) % messages.length;
                tickerItems[currentIndex].style.opacity = '1';
                setTimeout(() => {
                    tickerItems[currentIndex].style.transform = 'translateX(-100%)';
                }, 10);
            }

            // Start cycling after initial display
            setTimeout(() => {
                setInterval(cycleMessages, slideDuration * 1000);
            }, slideDuration * 1000);

            console.log(`loadAdvertTicker: Successfully loaded ${messages.length} messages, cycling every ${displayDuration + fadeDuration}s`);
        } else {
            console.error('Ticker wrapper not found');
        }

    } catch (error) {
        console.error('Error loading advert ticker:', error);
    }
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe sections for animations
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Chat functionality
let userName = '';
let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

const chatIcon = document.getElementById('chat-icon');
const nameModal = document.getElementById('name-modal');
const chatInterface = document.getElementById('chat-interface');
const userNameInput = document.getElementById('user-name');
const joinChatBtn = document.getElementById('join-chat');
const closeChatBtn = document.getElementById('close-chat');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const imageBtn = document.getElementById('image-btn');
const imageInput = document.getElementById('image-input');
const emojiPicker = document.getElementById('emoji-picker');
const emojiGrid = document.getElementById('emoji-grid');
const chatMessages = document.getElementById('chat-messages');

// Emojis array
const emojis = ['😀', '😊', '😂', '🤣', '😍', '😘', '😉', '😎', '🤔', '😢', '😭', '😤', '😡', '🥺', '😴', '🤤', '🤗', '🤐', '🤨', '😏', '🙄', '😬', '😔', '😷', '🤒', '🤮', '🤢', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

// Show chat icon after page load
setTimeout(() => {
    chatIcon.style.display = 'flex';
}, 1000);

// Populate emoji grid
emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
        messageInput.value += emoji;
        emojiPicker.classList.remove('active');
    });
    emojiGrid.appendChild(btn);
});

// Load existing messages
loadMessages();

// Event listeners
chatIcon.addEventListener('click', () => {
    console.log('Chat icon clicked');
    nameModal.classList.add('active');
});

joinChatBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (name) {
        userName = name;
        nameModal.classList.remove('active');
        chatInterface.classList.add('active');
        chatIcon.style.display = 'none';
    }
});

closeChatBtn.addEventListener('click', () => {
    chatInterface.classList.remove('active');
    chatIcon.style.display = 'flex';
});

sendBtn.addEventListener('click', () => sendMessage());

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

emojiBtn.addEventListener('click', () => {
    emojiPicker.classList.toggle('active');
});

imageBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            sendMessage(event.target.result, 'image');
        };
        reader.readAsDataURL(file);
    }
});

function sendMessage(content = null, type = 'text') {
    const msgContent = content || messageInput.value.trim();
    if (msgContent && userName) {
        const message = {
            user: userName,
            content: msgContent,
            type: type,
            timestamp: new Date().toISOString()
        };
        messages.push(message);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        displayMessage(message);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function displayMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${message.user === userName ? 'own' : 'other'}`;

    const header = document.createElement('div');
    header.className = 'message-header';

    const userSpan = document.createElement('span');
    userSpan.className = 'message-user';
    userSpan.textContent = message.user;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date(message.timestamp).toLocaleTimeString();

    header.appendChild(userSpan);
    header.appendChild(timeSpan);
    msgDiv.appendChild(header);

    if (message.type === 'image') {
        const img = document.createElement('img');
        img.src = message.content;
        msgDiv.appendChild(img);
    } else {
        const contentDiv = document.createElement('div');
        contentDiv.textContent = message.content;
        msgDiv.appendChild(contentDiv);
    }

    chatMessages.appendChild(msgDiv);
}

function loadMessages() {
    messages.forEach(displayMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: white;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        padding: 1rem 0;
    }

    .nav-menu.active li {
        margin: 0.5rem 0;
        text-align: center;
    }

    .dropdown-content.show {
        display: block;
    }

    .nav-menu.active .dropdown-content {
        position: static;
        display: none;
        box-shadow: none;
        background-color: transparent;
        border-radius: 0;
        min-width: auto;
    }

    .nav-menu.active .dropdown-content.show {
        display: block;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    header.scrolled {
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }

    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease forwards;
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    section {
        opacity: 0;
        transform: translateY(30px);
    }

    .image-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        z-index: 2000;
        justify-content: center;
        align-items: center;
    }

    .image-modal.active {
        display: flex;
    }

    .image-modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }

    .image-modal-content img {
        width: 100%;
        height: auto;
        border-radius: 10px;
    }

    .close-image-modal {
        position: absolute;
        top: 20px;
        right: 20px;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        z-index: 2001;
        transition: all 0.3s ease;
    }

    .close-image-modal:hover {
        color: #4A90E2;
        transform: scale(1.2);
    }
`;
document.head.appendChild(style);
