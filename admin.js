// Admin panel JavaScript for uploading and managing content

const ADMIN_PASSKEY_HASH = "ZWFzdGVybWlyYWNsZSMx"; // Base64 encoded passkey: eastermiracle#1

// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const passkeyInput = document.getElementById('passkey-input');
    const loginError = document.getElementById('login-error');
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');

    loginBtn.addEventListener('click', () => {
        const enteredPasskey = passkeyInput.value.trim();

        if (enteredPasskey.toLowerCase() === atob(ADMIN_PASSKEY_HASH).toLowerCase()) {
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            // Initialize admin manager
            new AdminManager();
        } else {
            loginError.textContent = 'Incorrect passkey. Please try again.';
            passkeyInput.value = '';
            passkeyInput.focus();
        }
    });

    // Allow enter key to submit
    passkeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});

class AdminManager {
    constructor() {
        this.apiBase = '/api';
        this.photos = [];
        this.videos = [];
        this.blogPosts = [];
        this.contactMessages = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadContent();
        this.displayPreviews();
        this.updateFeaturedStatus();
        await this.loadBlogPosts();
        this.displayBlogPosts();
        await this.loadContactMessages();
        this.displayContactMessages();
    }

    setupEventListeners() {
        // Photo upload
        document.getElementById('upload-photos-btn').addEventListener('click', () => {
            this.uploadPhotos();
        });

        // Video upload
        document.getElementById('upload-videos-btn').addEventListener('click', () => {
            this.uploadVideos();
        });

        // Bulk delete
        document.getElementById('bulk-delete-btn').addEventListener('click', () => {
            this.bulkDelete();
        });

        // Section toggles
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleSection(toggle.dataset.target);
            });
        });

        // Edit modal
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('close-edit-modal').addEventListener('click', () => {
            this.closeEditModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('edit-modal');
            if (e.target === modal) {
                this.closeEditModal();
            }
        });

        // Blog post buttons
        document.getElementById('publish-blog-btn').addEventListener('click', () => {
            this.createBlogPost('published');
        });

        document.getElementById('draft-blog-btn').addEventListener('click', () => {
            this.createBlogPost('draft');
        });

        // Clear all
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all uploaded content?')) {
                this.clearAll();
            }
        });
    }

    async loadContent() {
        try {
            const [photosRes, videosRes] = await Promise.all([
                fetch(`${this.apiBase}/photos`),
                fetch(`${this.apiBase}/videos`)
            ]);

            if (photosRes.ok) {
                this.photos = await photosRes.json();
            }

            if (videosRes.ok) {
                this.videos = await videosRes.json();
            }
        } catch (error) {
            console.error('Error loading content:', error);
            alert('Failed to load existing content. Please check if the backend server is running.');
        }
    }

    async uploadPhotos() {
        const fileInput = document.getElementById('photo-upload');
        const files = fileInput.files;

        if (files.length === 0) {
            alert('Please select photo files to upload.');
            return;
        }

        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Please select only image files.');
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
                formData.append('category', 'general');

                const response = await fetch(`${this.apiBase}/photos`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newPhoto = await response.json();
                this.photos.push(newPhoto);
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        this.displayPreviews();
        fileInput.value = '';
        alert('Photos uploaded successfully!');
    }

    async uploadVideos() {
        const fileInput = document.getElementById('video-upload');
        const files = fileInput.files;

        if (files.length === 0) {
            alert('Please select video files to upload.');
            return;
        }

        for (let file of files) {
            if (!file.type.startsWith('video/')) {
                alert('Please select only video files.');
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('video', file);
                formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
                formData.append('description', '');
                formData.append('category', 'general');

                const response = await fetch(`${this.apiBase}/videos`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newVideo = await response.json();
                this.videos.push(newVideo);
            } catch (error) {
                console.error('Error uploading video:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        this.displayPreviews();
        fileInput.value = '';
        alert('Videos uploaded successfully!');
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    savePhotos() {
        localStorage.setItem('uploadedPhotos', JSON.stringify(this.photos));
    }

    saveVideos() {
        localStorage.setItem('uploadedVideos', JSON.stringify(this.videos));
    }

    displayPreviews() {
        this.displayPhotoPreviews();
        this.displayVideoPreviews();
    }

    async updateFeaturedStatus() {
        try {
            const response = await fetch(`${this.apiBase}/videos/featured`);
            if (response.ok) {
                const featuredVideo = await response.json();
                const statusElement = document.getElementById('current-featured');
                if (featuredVideo) {
                    statusElement.textContent = `Featured: "${featuredVideo.title}"`;
                } else {
                    statusElement.textContent = 'No featured video set';
                }
            }
        } catch (error) {
            console.error('Error updating featured status:', error);
        }
    }

    displayPhotoPreviews() {
        const container = document.getElementById('photo-previews');
        container.innerHTML = '';

        this.photos.forEach((photo) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'preview-item';
            previewDiv.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" class="bulk-checkbox" data-id="${photo.id}" data-type="photo">
                    <label>Select for bulk delete</label>
                </div>
                <img src="${photo.filepath}" alt="${photo.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
                <p>${photo.title}</p>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <button class="edit-btn" data-id="${photo.id}" data-type="photo">Edit</button>
                    <button class="delete-btn" data-id="${photo.id}" data-type="photo">Delete</button>
                </div>
            `;
            container.appendChild(previewDiv);
        });

        // Add checkbox event listeners
        container.querySelectorAll('.bulk-checkbox[data-type="photo"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBulkDeleteVisibility();
            });
        });

        // Add edit event listeners
        container.querySelectorAll('.edit-btn[data-type="photo"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const photoId = parseInt(e.target.dataset.id);
                const photo = this.photos.find(p => p.id === photoId);
                if (photo) {
                    this.openEditModal('photo', photo);
                }
            });
        });

        // Add delete event listeners
        container.querySelectorAll('.delete-btn[data-type="photo"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const photoId = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this photo?')) {
                    try {
                        const response = await fetch(`${this.apiBase}/photos/${photoId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            this.photos = this.photos.filter(photo => photo.id !== photoId);
                            this.displayPreviews();
                            alert('Photo deleted successfully!');
                        } else {
                            throw new Error('Failed to delete photo');
                        }
                    } catch (error) {
                        console.error('Error deleting photo:', error);
                        alert('Failed to delete photo');
                    }
                }
            });
        });
    }

    displayVideoPreviews() {
        const container = document.getElementById('video-previews');
        container.innerHTML = '';

        this.videos.forEach((video) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'preview-item';
            previewDiv.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" class="bulk-checkbox" data-id="${video.id}" data-type="video">
                    <label>Select for bulk delete</label>
                </div>
                <video style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;" muted>
                    <source src="${video.filepath}" type="${video.type || 'video/mp4'}">
                </video>
                <p>${video.title}</p>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <button class="edit-btn" data-id="${video.id}" data-type="video">Edit</button>
                    <button class="featured-btn ${video.featured ? 'featured-active' : ''}" data-id="${video.id}" data-type="video">
                        ${video.featured ? 'Featured' : 'Set Featured'}
                    </button>
                    <button class="delete-btn" data-id="${video.id}" data-type="video">Delete</button>
                </div>
            `;
            container.appendChild(previewDiv);
        });

        // Add checkbox event listeners
        container.querySelectorAll('.bulk-checkbox[data-type="video"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBulkDeleteVisibility();
            });
        });

        // Add edit event listeners
        container.querySelectorAll('.edit-btn[data-type="video"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = parseInt(e.target.dataset.id);
                const video = this.videos.find(v => v.id === videoId);
                if (video) {
                    this.openEditModal('video', video);
                }
            });
        });

        // Add featured event listeners
        container.querySelectorAll('.featured-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const videoId = parseInt(e.target.dataset.id);
                const isCurrentlyFeatured = e.target.classList.contains('featured-active');
                const newFeaturedStatus = !isCurrentlyFeatured;

                try {
                    const response = await fetch(`${this.apiBase}/videos/${videoId}/featured`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ featured: newFeaturedStatus })
                    });

                    if (response.ok) {
                        // Update local data
                        this.videos = this.videos.map(video => ({
                            ...video,
                            featured: video.id === videoId ? newFeaturedStatus : (newFeaturedStatus ? false : video.featured)
                        }));
                        this.displayPreviews();
                        this.updateFeaturedStatus();
                        alert(`Video ${newFeaturedStatus ? 'set as' : 'removed from'} featured successfully!`);
                    } else {
                        throw new Error('Failed to update featured status');
                    }
                } catch (error) {
                    console.error('Error updating featured status:', error);
                    alert('Failed to update featured status');
                }
            });
        });

        // Add delete event listeners
        container.querySelectorAll('.delete-btn[data-type="video"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const videoId = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this video?')) {
                    try {
                        const response = await fetch(`${this.apiBase}/videos/${videoId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            this.videos = this.videos.filter(video => video.id !== videoId);
                            this.displayPreviews();
                            this.updateFeaturedStatus();
                            alert('Video deleted successfully!');
                        } else {
                            throw new Error('Failed to delete video');
                        }
                    } catch (error) {
                        console.error('Error deleting video:', error);
                        alert('Failed to delete video');
                    }
                }
            });
        });
    }

    toggleSection(targetId) {
        const section = document.getElementById(targetId);
        const toggleIcon = document.querySelector(`[data-target="${targetId}"] .toggle-icon`);

        if (section.classList.contains('collapsed')) {
            // Expand section
            section.classList.remove('collapsed');
            toggleIcon.textContent = '▼';
        } else {
            // Collapse section
            section.classList.add('collapsed');
            toggleIcon.textContent = '▶';
        }
    }

    updateBulkDeleteVisibility() {
        const allCheckboxes = document.querySelectorAll('.bulk-checkbox');
        const checkedBoxes = document.querySelectorAll('.bulk-checkbox:checked');
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        const selectedCount = document.getElementById('selected-count');

        if (checkedBoxes.length > 0) {
            bulkDeleteBtn.style.display = 'inline-block';
            selectedCount.textContent = `${checkedBoxes.length} item(s) selected`;
        } else {
            bulkDeleteBtn.style.display = 'none';
            selectedCount.textContent = '';
        }
    }

    async bulkDelete() {
        const checkedBoxes = document.querySelectorAll('.bulk-checkbox:checked');
        if (checkedBoxes.length === 0) {
            alert('No items selected for deletion.');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${checkedBoxes.length} selected item(s)?`)) {
            return;
        }

        const deletePromises = [];
        let deletedCount = 0;

        checkedBoxes.forEach(checkbox => {
            const itemId = parseInt(checkbox.dataset.id);
            const itemType = checkbox.dataset.type;

            if (itemType === 'photo') {
                deletePromises.push(
                    fetch(`${this.apiBase}/photos/${itemId}`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                this.photos = this.photos.filter(photo => photo.id !== itemId);
                                deletedCount++;
                            }
                        })
                );
            } else if (itemType === 'video') {
                deletePromises.push(
                    fetch(`${this.apiBase}/videos/${itemId}`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                this.videos = this.videos.filter(video => video.id !== itemId);
                                deletedCount++;
                            }
                        })
                );
            }
        });

        try {
            await Promise.all(deletePromises);
            this.displayPreviews();
            this.updateBulkDeleteVisibility();
            alert(`Successfully deleted ${deletedCount} item(s)!`);
        } catch (error) {
            console.error('Error in bulk delete:', error);
            alert('Some items may not have been deleted. Please try again.');
        }
    }

    openEditModal(type, item) {
        const modal = document.getElementById('edit-modal');
        const title = document.getElementById('edit-modal-title');
        const titleInput = document.getElementById('edit-title');
        const descInput = document.getElementById('edit-description');
        const categorySelect = document.getElementById('edit-category');
        const tagsInput = document.getElementById('edit-tags');

        title.textContent = `Edit ${type === 'photo' ? 'Photo' : 'Video'}`;
        titleInput.value = item.title || '';
        descInput.value = item.description || '';
        categorySelect.value = item.category || 'general';
        tagsInput.value = item.tags || '';

        // Store current item info for saving
        this.editingItem = { type, id: item.id };

        modal.style.display = 'block';
    }

    async saveEdit() {
        const title = document.getElementById('edit-title').value.trim();
        const description = document.getElementById('edit-description').value;
        const category = document.getElementById('edit-category').value;
        const tags = document.getElementById('edit-tags').value.trim();

        if (!title) {
            alert('Title is required.');
            return;
        }

        const updateData = { title, description, category, tags };

        try {
            const endpoint = this.editingItem.type === 'photo'
                ? `${this.apiBase}/photos/${this.editingItem.id}`
                : `${this.apiBase}/videos/${this.editingItem.id}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            // Update local data
            if (this.editingItem.type === 'photo') {
                const photoIndex = this.photos.findIndex(p => p.id === this.editingItem.id);
                if (photoIndex !== -1) {
                    this.photos[photoIndex] = { ...this.photos[photoIndex], ...updateData };
                }
            } else {
                const videoIndex = this.videos.findIndex(v => v.id === this.editingItem.id);
                if (videoIndex !== -1) {
                    this.videos[videoIndex] = { ...this.videos[videoIndex], ...updateData };
                }
            }

            this.displayPreviews();
            this.closeEditModal();
            alert('Item updated successfully!');
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    }

    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'none';
        this.editingItem = null;

        // Reset form
        document.getElementById('edit-form').reset();
    }

    async createBlogPost(status) {
        console.log('Creating blog post with status:', status);

        const title = document.getElementById('blog-title').value.trim();
        const content = document.getElementById('blog-content').value.trim();
        const excerpt = document.getElementById('blog-excerpt').value.trim();
        const category = document.getElementById('blog-category').value;
        const tags = document.getElementById('blog-tags').value.trim();
        const featuredImageUrl = document.getElementById('blog-featured-image').value.trim();
        const featuredImageFile = document.getElementById('blog-featured-image-upload').files[0];

        console.log('Form data:', { title, content: content.substring(0, 50) + '...', excerpt, category, tags, featuredImageUrl, featuredImageFile: !!featuredImageFile });

        if (!title || !content) {
            alert('Title and content are required.');
            return;
        }

        let finalImageUrl = featuredImageUrl;

        // If a file was uploaded, upload it to Cloudinary first
        if (featuredImageFile) {
            console.log('Uploading image to Cloudinary...');
            try {
                const formData = new FormData();
                formData.append('photo', featuredImageFile);

                const uploadResponse = await fetch(`${this.apiBase}/photos`, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadedPhoto = await uploadResponse.json();
                finalImageUrl = uploadedPhoto.filepath;
                console.log('Image uploaded successfully:', finalImageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload featured image. Please try again or use a URL instead.');
                return;
            }
        }

        const blogData = {
            title,
            content,
            excerpt,
            category,
            tags,
            featured_image: finalImageUrl,
            status
        };

        console.log('Sending blog data:', blogData);

        try {
            const response = await fetch(`${this.apiBase}/blog-posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const newBlogPost = await response.json();
            console.log('Created blog post:', newBlogPost);

            this.blogPosts.unshift(newBlogPost); // Add to beginning of array

            // Clear form
            document.getElementById('blog-title').value = '';
            document.getElementById('blog-content').value = '';
            document.getElementById('blog-excerpt').value = '';
            document.getElementById('blog-tags').value = '';
            document.getElementById('blog-featured-image').value = '';
            document.getElementById('blog-featured-image-upload').value = '';

            this.displayBlogPosts();
            alert(`Blog post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
        } catch (error) {
            console.error('Error creating blog post:', error);
            alert(`Failed to create blog post: ${error.message}`);
        }
    }

    async loadBlogPosts() {
        try {
            const response = await fetch(`${this.apiBase}/blog-posts?limit=10`);
            if (response.ok) {
                this.blogPosts = await response.json();
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }

    async loadContactMessages() {
        try {
            const response = await fetch(`${this.apiBase}/contact?limit=20`);
            if (response.ok) {
                this.contactMessages = await response.json();
            }
        } catch (error) {
            console.error('Error loading contact messages:', error);
        }
    }

    displayContactMessages() {
        const container = document.getElementById('contact-messages');
        container.innerHTML = '';

        if (this.contactMessages.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No contact messages yet.</p>';
            return;
        }

        this.contactMessages.forEach((message) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'contact-message-item';

            const createdDate = new Date(message.created_at);
            const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();

            messageDiv.innerHTML = `
                <div class="contact-message-header">
                    <span class="contact-message-sender">From: ${message.name} (${message.email})</span>
                    <span class="contact-message-status ${message.status}">${message.status.toUpperCase()}</span>
                </div>
                <div class="contact-message-content">${message.message}</div>
                <div class="contact-message-meta">
                    <span>Received: ${formattedDate}</span>
                    <div class="contact-message-actions">
                        ${message.status !== 'read' ? '<button class="contact-mark-read-btn" data-id="' + message.id + '">Mark Read</button>' : ''}
                        <button class="contact-mark-archived-btn" data-id="${message.id}">Archive</button>
                        <button class="contact-delete-btn" data-id="${message.id}">Delete</button>
                    </div>
                </div>
            `;

            container.appendChild(messageDiv);
        });

        // Add event listeners for contact message actions
        container.querySelectorAll('.contact-mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const messageId = parseInt(e.target.dataset.id);
                try {
                    const response = await fetch(`${this.apiBase}/contact/${messageId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'read' })
                    });

                    if (response.ok) {
                        this.contactMessages = this.contactMessages.map(msg =>
                            msg.id === messageId ? { ...msg, status: 'read' } : msg
                        );
                        this.displayContactMessages();
                        alert('Message marked as read!');
                    } else {
                        throw new Error('Failed to update message status');
                    }
                } catch (error) {
                    console.error('Error updating message status:', error);
                    alert('Failed to update message status');
                }
            });
        });

        container.querySelectorAll('.contact-mark-archived-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const messageId = parseInt(e.target.dataset.id);
                try {
                    const response = await fetch(`${this.apiBase}/contact/${messageId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'archived' })
                    });

                    if (response.ok) {
                        this.contactMessages = this.contactMessages.filter(msg => msg.id !== messageId);
                        this.displayContactMessages();
                        alert('Message archived!');
                    } else {
                        throw new Error('Failed to archive message');
                    }
                } catch (error) {
                    console.error('Error archiving message:', error);
                    alert('Failed to archive message');
                }
            });
        });

        container.querySelectorAll('.contact-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const messageId = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this contact message?')) {
                    try {
                        const response = await fetch(`${this.apiBase}/contact/${messageId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            this.contactMessages = this.contactMessages.filter(msg => msg.id !== messageId);
                            this.displayContactMessages();
                            alert('Message deleted!');
                        } else {
                            throw new Error('Failed to delete message');
                        }
                    } catch (error) {
                        console.error('Error deleting message:', error);
                        alert('Failed to delete message');
                    }
                }
            });
        });
    }

    displayBlogPosts() {
        const container = document.getElementById('blog-previews');
        container.innerHTML = '';

        if (this.blogPosts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No blog posts yet. Create your first post above!</p>';
            return;
        }

        this.blogPosts.forEach((post) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'blog-preview-item';

            const createdDate = new Date(post.created_at);
            const formattedDate = createdDate.toLocaleDateString();

            postDiv.innerHTML = `
                <div class="blog-preview-content">
                    <h5>${post.title}</h5>
                    <div class="blog-preview-meta">
                        <span>Status: ${post.status}</span> |
                        <span>Category: ${post.category}</span> |
                        <span>Created: ${formattedDate}</span>
                    </div>
                </div>
                <div class="blog-preview-actions">
                    <button class="blog-edit-btn" data-id="${post.id}">Edit</button>
                    <button class="blog-delete-btn" data-id="${post.id}">Delete</button>
                </div>
            `;

            container.appendChild(postDiv);
        });

        // Add event listeners for blog post actions
        container.querySelectorAll('.blog-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.target.dataset.id);
                // For now, just show an alert. In a full implementation, you'd open an edit modal
                alert('Blog post editing will be implemented in the next update!');
            });
        });

        container.querySelectorAll('.blog-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = parseInt(e.target.dataset.id);
                if (confirm('Are you sure you want to delete this blog post?')) {
                    try {
                        const response = await fetch(`${this.apiBase}/blog-posts/${postId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            this.blogPosts = this.blogPosts.filter(post => post.id !== postId);
                            this.displayBlogPosts();
                            alert('Blog post deleted successfully!');
                        } else {
                            throw new Error('Failed to delete blog post');
                        }
                    } catch (error) {
                        console.error('Error deleting blog post:', error);
                        alert('Failed to delete blog post');
                    }
                }
            });
        });
    }

    async clearAll() {
        if (!confirm('Are you sure you want to clear all uploaded content? This action cannot be undone.')) {
            return;
        }

        try {
            // Delete all videos
            for (const video of this.videos) {
                await fetch(`${this.apiBase}/videos/${video.id}`, { method: 'DELETE' });
            }

            // Delete all photos
            for (const photo of this.photos) {
                await fetch(`${this.apiBase}/photos/${photo.id}`, { method: 'DELETE' });
            }

            this.photos = [];
            this.videos = [];
            this.displayPreviews();
            alert('All content cleared!');
        } catch (error) {
            console.error('Error clearing content:', error);
            alert('Failed to clear all content');
        }
    }
}

// AdminManager is initialized after successful login
