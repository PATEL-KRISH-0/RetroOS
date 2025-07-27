// Media Player Application
class MediaPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 180; // 3 minutes
        this.volume = 0.7;
        this.playlist = [
            { title: 'RetroOS Theme', artist: 'System Audio', duration: 180 },
            { title: 'Digital Dreams', artist: 'Synthwave Collective', duration: 240 },
            { title: 'Neon Nights', artist: 'Cyber Orchestra', duration: 195 },
            { title: 'Virtual Reality', artist: 'Tech Sounds', duration: 210 }
        ];
        this.currentTrack = 0;
        this.playbackTimer = null;
        this.visualizerTimer = null;
    }

    getWindowConfig() {
        return {
            title: 'Media Player',
            icon: 'ri-play-circle-line',
            width: 600,
            height: 500
        };
    }

    render() {
        return `
            <div class="media-player-content">
                <div class="media-header">
                    <div class="now-playing">Now Playing</div>
                    <div class="track-info">
                        <div class="track-title">${this.playlist[this.currentTrack].title}</div>
                        <div class="track-artist">${this.playlist[this.currentTrack].artist}</div>
                    </div>
                </div>
                
                <div class="media-visualizer">
                    <div class="visualizer-bars">
                        ${Array.from({ length: 20 }, () => '<div class="visualizer-bar"></div>').join('')}
                    </div>
                    <div class="album-art">
                        <i class="ri-music-line"></i>
                    </div>
                </div>
                
                <div class="media-controls">
                    <div class="progress-container">
                        <span class="time-display current-time">0:00</span>
                        <div class="progress-track">
                            <div class="progress-fill"></div>
                            <div class="progress-handle"></div>
                        </div>
                        <span class="time-display total-time">${this.formatTime(this.duration)}</span>
                    </div>
                    
                    <div class="control-buttons">
                        <button class="control-button shuffle" title="Shuffle">
                            <i class="ri-shuffle-line"></i>
                        </button>
                        <button class="control-button previous" title="Previous">
                            <i class="ri-skip-back-line"></i>
                        </button>
                        <button class="control-button play" title="Play/Pause">
                            <i class="ri-play-line"></i>
                        </button>
                        <button class="control-button next" title="Next">
                            <i class="ri-skip-forward-line"></i>
                        </button>
                        <button class="control-button repeat" title="Repeat">
                            <i class="ri-repeat-line"></i>
                        </button>
                    </div>
                    
                    <div class="volume-container">
                        <i class="ri-volume-up-line"></i>
                        <div class="volume-track">
                            <div class="volume-fill"></div>
                            <div class="volume-handle"></div>
                        </div>
                        <span class="volume-display">${Math.round(this.volume * 100)}%</span>
                    </div>
                </div>
                
                <div class="playlist-container">
                    <div class="playlist-header">
                        <h3>Playlist</h3>
                        <div class="playlist-controls">
                            <button class="playlist-button" data-action="add">
                                <i class="ri-add-line"></i>
                            </button>
                            <button class="playlist-button" data-action="clear">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                    <div class="playlist">
                        ${this.renderPlaylist()}
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        
        // Check if opened with a file
        if (window.retroOS && window.retroOS.currentFileData) {
            this.loadUploadedFile(window.retroOS.currentFileData);
            window.retroOS.currentFileData = null; // Clear after use
        }
        
        this.setupEventListeners();
        this.updateDisplay();
        this.startVisualizer();
    }
    
    loadUploadedFile(fileData) {
        if (fileData.type.startsWith('audio/') || fileData.type.startsWith('video/')) {
            const newTrack = {
                title: fileData.name.split('.')[0],
                artist: 'Uploaded File',
                duration: 180, // Default duration
                data: fileData.data,
                type: fileData.type
            };
            
            this.playlist.unshift(newTrack);
            this.currentTrack = 0;
            this.loadTrack();
            
            // Save to localStorage
            try {
                const savedPlaylists = JSON.parse(localStorage.getItem('retroos-media-files') || '[]');
                savedPlaylists.unshift(newTrack);
                localStorage.setItem('retroos-media-files', JSON.stringify(savedPlaylists));
            } catch (error) {
                console.error('Failed to save media file:', error);
            }
        }
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Control buttons
        const playButton = window.querySelector('.control-button.play');
        const previousButton = window.querySelector('.control-button.previous');
        const nextButton = window.querySelector('.control-button.next');
        const shuffleButton = window.querySelector('.control-button.shuffle');
        const repeatButton = window.querySelector('.control-button.repeat');
        
        playButton.addEventListener('click', () => this.togglePlayback());
        previousButton.addEventListener('click', () => this.previousTrack());
        nextButton.addEventListener('click', () => this.nextTrack());
        shuffleButton.addEventListener('click', () => this.toggleShuffle());
        repeatButton.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        const progressTrack = window.querySelector('.progress-track');
        progressTrack.addEventListener('click', (e) => {
            this.seekTo(e);
        });
        
        // Volume control
        const volumeTrack = window.querySelector('.volume-track');
        volumeTrack.addEventListener('click', (e) => {
            this.setVolume(e);
        });
        
        // Playlist items
        window.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.playTrack(index);
            });
        });
        
        // Playlist controls
        window.querySelectorAll('.playlist-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handlePlaylistAction(button.dataset.action);
            });
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.previousTrack();
                    }
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.nextTrack();
                    }
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.changeVolume(0.1);
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.changeVolume(-0.1);
                    }
                    break;
            }
        });
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        
        const playButton = document.querySelector(`#${this.windowId} .control-button.play i`);
        if (playButton) {
            playButton.className = this.isPlaying ? 'ri-pause-line' : 'ri-play-line';
        }
        
        if (this.isPlaying) {
            this.startPlayback();
        } else {
            this.stopPlayback();
        }
        
        this.updateVisualizerState();
    }

    startPlayback() {
        this.playbackTimer = setInterval(() => {
            this.currentTime += 1;
            
            if (this.currentTime >= this.duration) {
                this.nextTrack();
            } else {
                this.updateProgress();
            }
        }, 1000);
    }

    stopPlayback() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack();
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.loadTrack();
    }

    playTrack(index) {
        this.currentTrack = index;
        this.loadTrack();
        
        if (!this.isPlaying) {
            this.togglePlayback();
        }
    }

    loadTrack() {
        const track = this.playlist[this.currentTrack];
        this.currentTime = 0;
        this.duration = track.duration;
        
        this.updateDisplay();
        this.updatePlaylist();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Now Playing', `${track.title} - ${track.artist}`, 'info');
        }
    }

    seekTo(e) {
        const progressTrack = e.currentTarget;
        const rect = progressTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        this.currentTime = Math.floor(this.duration * percentage);
        this.updateProgress();
    }

    setVolume(e) {
        const volumeTrack = e.currentTarget;
        const rect = volumeTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        
        this.volume = percentage;
        this.updateVolumeDisplay();
    }

    changeVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        this.updateVolumeDisplay();
    }

    updateProgress() {
        const percentage = (this.currentTime / this.duration) * 100;
        
        const progressFill = document.querySelector(`#${this.windowId} .progress-fill`);
        const progressHandle = document.querySelector(`#${this.windowId} .progress-handle`);
        const currentTimeDisplay = document.querySelector(`#${this.windowId} .current-time`);
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressHandle) progressHandle.style.left = `${percentage}%`;
        if (currentTimeDisplay) currentTimeDisplay.textContent = this.formatTime(this.currentTime);
    }

    updateVolumeDisplay() {
        const percentage = this.volume * 100;
        
        const volumeFill = document.querySelector(`#${this.windowId} .volume-fill`);
        const volumeHandle = document.querySelector(`#${this.windowId} .volume-handle`);
        const volumeDisplay = document.querySelector(`#${this.windowId} .volume-display`);
        const volumeIcon = document.querySelector(`#${this.windowId} .volume-container i`);
        
        if (volumeFill) volumeFill.style.width = `${percentage}%`;
        if (volumeHandle) volumeHandle.style.left = `${percentage}%`;
        if (volumeDisplay) volumeDisplay.textContent = `${Math.round(percentage)}%`;
        
        if (volumeIcon) {
            if (this.volume === 0) {
                volumeIcon.className = 'ri-volume-mute-line';
            } else if (this.volume < 0.5) {
                volumeIcon.className = 'ri-volume-down-line';
            } else {
                volumeIcon.className = 'ri-volume-up-line';
            }
        }
    }

    updateDisplay() {
        const track = this.playlist[this.currentTrack];
        
        const trackTitle = document.querySelector(`#${this.windowId} .track-title`);
        const trackArtist = document.querySelector(`#${this.windowId} .track-artist`);
        const totalTime = document.querySelector(`#${this.windowId} .total-time`);
        
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
        if (totalTime) totalTime.textContent = this.formatTime(track.duration);
        
        this.updateProgress();
        this.updateVolumeDisplay();
    }

    updatePlaylist() {
        const playlist = document.querySelector(`#${this.windowId} .playlist`);
        if (playlist) {
            playlist.innerHTML = this.renderPlaylist();
            
            // Re-add event listeners
            playlist.querySelectorAll('.playlist-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.playTrack(index);
                });
            });
        }
    }

    renderPlaylist() {
        return this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentTrack ? 'active' : ''}" data-index="${index}">
                <div class="track-number">${index + 1}</div>
                <div class="track-details">
                    <div class="track-name">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${this.formatTime(track.duration)}</div>
                <div class="track-actions">
                    <button class="track-action" title="Remove">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    startVisualizer() {
        this.visualizerTimer = setInterval(() => {
            this.updateVisualizer();
        }, 100);
    }

    updateVisualizer() {
        const bars = document.querySelectorAll(`#${this.windowId} .visualizer-bar`);
        
        bars.forEach((bar, index) => {
            if (this.isPlaying) {
                const height = Math.random() * 80 + 10;
                bar.style.height = `${height}px`;
                bar.style.animationDuration = `${0.3 + Math.random() * 0.4}s`;
            } else {
                bar.style.height = '10px';
            }
        });
    }

    updateVisualizerState() {
        const bars = document.querySelectorAll(`#${this.windowId} .visualizer-bar`);
        
        if (this.isPlaying) {
            bars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        } else {
            bars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
            });
        }
    }

    toggleShuffle() {
        const shuffleButton = document.querySelector(`#${this.windowId} .control-button.shuffle`);
        shuffleButton.classList.toggle('active');
        
        if (window.retroOS && window.retroOS.notifications) {
            const isActive = shuffleButton.classList.contains('active');
            window.retroOS.notifications.show('Shuffle', `Shuffle ${isActive ? 'enabled' : 'disabled'}`, 'info');
        }
    }

    toggleRepeat() {
        const repeatButton = document.querySelector(`#${this.windowId} .control-button.repeat`);
        repeatButton.classList.toggle('active');
        
        if (window.retroOS && window.retroOS.notifications) {
            const isActive = repeatButton.classList.contains('active');
            window.retroOS.notifications.show('Repeat', `Repeat ${isActive ? 'enabled' : 'disabled'}`, 'info');
        }
    }

    handlePlaylistAction(action) {
        switch (action) {
            case 'add':
                this.addToPlaylist();
                break;
            case 'clear':
                this.clearPlaylist();
                break;
        }
    }

    addToPlaylist() {
        const newTracks = [
            { title: 'Cosmic Journey', artist: 'Space Sounds', duration: 220 },
            { title: 'Binary Beats', artist: 'Digital DJ', duration: 185 },
            { title: 'Retro Wave', artist: 'Nostalgic Vibes', duration: 205 }
        ];
        
        const randomTrack = newTracks[Math.floor(Math.random() * newTracks.length)];
        this.playlist.push(randomTrack);
        this.updatePlaylist();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Track Added', `"${randomTrack.title}" added to playlist`, 'success');
        }
    }

    clearPlaylist() {
        if (confirm('Clear the entire playlist?')) {
            this.playlist = [this.playlist[this.currentTrack]]; // Keep current track
            this.currentTrack = 0;
            this.updatePlaylist();
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Playlist Cleared', 'Playlist has been cleared', 'success');
            }
        }
    }

    cleanup() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
        }
        if (this.visualizerTimer) {
            clearInterval(this.visualizerTimer);
        }
    }
}

// Add media player specific styles
const mediaPlayerStyles = document.createElement('style');
mediaPlayerStyles.textContent = `
    .progress-handle, .volume-handle {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: white;
        border: 2px solid var(--accent-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .progress-handle:hover, .volume-handle:hover {
        transform: translate(-50%, -50%) scale(1.2);
    }
    
    .volume-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        min-width: 150px;
    }
    
    .volume-track {
        flex: 1;
        height: 6px;
        background: #475569;
        border-radius: var(--radius-sm);
        cursor: pointer;
        position: relative;
    }
    
    .volume-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #60a5fa);
        border-radius: var(--radius-sm);
        width: 70%;
        transition: width var(--transition-normal);
    }
    
    .volume-display {
        font-size: 0.75rem;
        color: #94a3b8;
        min-width: 35px;
    }
    
    .playlist-container {
        border-top: 1px solid #475569;
        padding: var(--spacing-lg);
    }
    
    .playlist-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }
    
    .playlist-header h3 {
        color: white;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .playlist-controls {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .playlist-button {
        width: 32px;
        height: 32px;
        background: #475569;
        border: 1px solid #64748b;
        border-radius: var(--radius-md);
        color: white;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .playlist-button:hover {
        background: #64748b;
    }
    
    .playlist {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #475569;
        border-radius: var(--radius-md);
        background: #1e293b;
    }
    
    .playlist-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        border-bottom: 1px solid #475569;
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .playlist-item:last-child {
        border-bottom: none;
    }
    
    .playlist-item:hover {
        background: #334155;
    }
    
    .playlist-item.active {
        background: var(--accent-color);
    }
    
    .track-number {
        font-size: 0.875rem;
        color: #94a3b8;
        min-width: 20px;
    }
    
    .track-details {
        flex: 1;
    }
    
    .track-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: white;
        margin-bottom: 2px;
    }
    
    .track-artist {
        font-size: 0.75rem;
        color: #94a3b8;
    }
    
    .track-duration {
        font-size: 0.75rem;
        color: #94a3b8;
        min-width: 40px;
    }
    
    .track-actions {
        display: flex;
        gap: var(--spacing-xs);
    }
    
    .track-action {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .track-action:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
    
    .album-art {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        color: #475569;
        opacity: 0.3;
    }
    
    .control-button.active {
        background: var(--accent-color);
        border-color: var(--accent-hover);
    }
`;
document.head.appendChild(mediaPlayerStyles);