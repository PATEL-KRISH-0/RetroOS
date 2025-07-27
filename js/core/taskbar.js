// Taskbar Manager - Handles taskbar functionality
class Taskbar {
    constructor() {
        this.windows = new Map();
        this.isStartMenuOpen = false;
        this.isNotificationCenterOpen = false;
        this.searchResults = [];
    }

    init() {
        console.log('📊 Initializing Taskbar...');
        this.setupEventListeners();
        this.initializeSearch();
        this.updateSystemTray();
    }

    setupEventListeners() {
        // Start button
        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        });

        // Search functionality
        const searchInput = document.querySelector('.taskbar-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.searchResults.length > 0) {
                    this.launchSearchResult(this.searchResults[0]);
                    searchInput.value = '';
                    this.clearSearchResults();
                }
            });
        }

        // System tray icons
        document.querySelectorAll('.tray-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                this.handleTrayIconClick(e.currentTarget);
            });
        });

        // Start menu items
        document.addEventListener('click', (e) => {
            const appTile = e.target.closest('.app-tile, .app-item');
            if (appTile && appTile.dataset.app) {
                this.hideStartMenu();
            }
            
            const quickAction = e.target.closest('.quick-action');
            if (quickAction) {
                this.handleQuickAction(quickAction.dataset.action);
            }
            
            // Hide start menu when clicking outside
            if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
                this.hideStartMenu();
            }
        });

        // Window events
        document.addEventListener('windowEvent', (e) => {
            this.handleWindowEvent(e.detail);
        });

        // Notification center
        const notificationIcon = document.querySelector('[data-tooltip="Notifications"]');
        if (notificationIcon) {
            notificationIcon.addEventListener('click', () => {
                this.toggleNotificationCenter();
            });
        }

        // Clear all notifications
        const clearAllBtn = document.querySelector('.clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllNotifications();
            });
        }
    }

    toggleStartMenu() {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        
        if (this.isStartMenuOpen) {
            this.hideStartMenu();
        } else {
            this.showStartMenu();
        }
    }

    showStartMenu() {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        
        startMenu.style.display = 'flex';
        startButton.classList.add('active');
        this.isStartMenuOpen = true;
        
        // Animate app tiles
        const appTiles = startMenu.querySelectorAll('.app-tile');
        appTiles.forEach((tile, index) => {
            tile.style.animationDelay = `${index * 0.05}s`;
            tile.classList.add('animate-in');
        });
        
        // Hide notification center if open
        if (this.isNotificationCenterOpen) {
            this.hideNotificationCenter();
        }
    }

    hideStartMenu() {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        
        startMenu.style.display = 'none';
        startButton.classList.remove('active');
        this.isStartMenuOpen = false;
        
        // Remove animation classes
        const appTiles = startMenu.querySelectorAll('.app-tile');
        appTiles.forEach(tile => {
            tile.classList.remove('animate-in');
        });
    }

    toggleNotificationCenter() {
        if (this.isNotificationCenterOpen) {
            this.hideNotificationCenter();
        } else {
            this.showNotificationCenter();
        }
    }

    showNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        notificationCenter.style.display = 'block';
        this.isNotificationCenterOpen = true;
        
        // Hide start menu if open
        if (this.isStartMenuOpen) {
            this.hideStartMenu();
        }
    }

    hideNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        notificationCenter.style.display = 'none';
        this.isNotificationCenterOpen = false;
    }

    addWindow(windowId, title, icon) {
        const button = document.createElement('button');
        button.className = 'taskbar-button';
        button.dataset.windowId = windowId;
        button.innerHTML = `<i class="${icon}"></i><span>${title}</span>`;
        
        button.addEventListener('click', () => {
            this.handleTaskbarButtonClick(windowId);
        });
        
        // Right-click context menu for taskbar buttons
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showTaskbarContextMenu(e.clientX, e.clientY, windowId);
        });

        document.getElementById('taskbarButtons').appendChild(button);
        
        this.windows.set(windowId, {
            button: button,
            title: title,
            icon: icon
        });
        
        this.updateTaskbarButton(windowId, true);
    }

    removeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            if (windowData.button && windowData.button.parentNode) {
                windowData.button.remove();
            }
            this.windows.delete(windowId);
        }
    }

    updateTaskbarButton(windowId, isActive = false) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.button.classList.toggle('active', isActive);
        }
    }

    handleTaskbarButtonClick(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // Check if window exists in window manager
        if (window.retroOS && window.retroOS.windowManager) {
            const windowExists = window.retroOS.windowManager.getWindow(windowId);
            if (!windowExists) {
                // Remove orphaned taskbar button
                this.removeWindow(windowId);
                return;
            }
        }
        
        const event = new CustomEvent('taskbarButtonClick', {
            detail: { windowId: windowId }
        });
        document.dispatchEvent(event);
    }
    
    showTaskbarContextMenu(x, y, windowId) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'taskbar-context-menu';
        contextMenu.innerHTML = `
            <div class="context-item" data-action="restore">
                <i class="ri-window-line"></i>
                <span>Restore</span>
            </div>
            <div class="context-item" data-action="minimize">
                <i class="ri-subtract-line"></i>
                <span>Minimize</span>
            </div>
            <div class="context-item" data-action="maximize">
                <i class="ri-checkbox-blank-line"></i>
                <span>Maximize</span>
            </div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="close">
                <i class="ri-close-line"></i>
                <span>Close</span>
            </div>
        `;
        
        // Calculate position to ensure menu stays within viewport
        const menuWidth = 150;
        const menuHeight = 120;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let finalX = x;
        let finalY = y;
        
        // Adjust horizontal position
        if (x + menuWidth > viewportWidth) {
            finalX = x - menuWidth;
        }
        
        // Adjust vertical position (show above taskbar)
        if (y + menuHeight > viewportHeight - 60) {
            finalY = y - menuHeight - 10;
        }
        
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${finalX}px`;
        contextMenu.style.top = `${finalY}px`;
        contextMenu.style.zIndex = '4000';
        contextMenu.style.background = 'rgba(255, 255, 255, 0.95)';
        contextMenu.style.backdropFilter = 'blur(20px)';
        contextMenu.style.border = '1px solid var(--border-color)';
        contextMenu.style.borderRadius = 'var(--radius-lg)';
        contextMenu.style.padding = 'var(--spacing-sm)';
        contextMenu.style.boxShadow = 'var(--shadow-xl)';
        contextMenu.style.minWidth = `${menuWidth}px`;
        
        document.body.appendChild(contextMenu);
        
        // Add click handlers
        contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleTaskbarContextAction(item.dataset.action, windowId);
                contextMenu.remove();
            });
        });
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeContextMenu(e) {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', removeContextMenu);
                }
            });
        }, 100);
    }
    
    handleTaskbarContextAction(action, windowId) {
        const event = new CustomEvent('taskbarContextAction', {
            detail: { action: action, windowId: windowId }
        });
        document.dispatchEvent(event);
    }

    handleWindowEvent(eventDetail) {
        const { type, window } = eventDetail;
        
        switch (type) {
            case 'windowFocused':
                // Update all taskbar buttons
                this.windows.forEach((data, id) => {
                    this.updateTaskbarButton(id, id === window.id);
                });
                break;
                
            case 'windowMinimized':
                this.updateTaskbarButton(window.id, false);
                break;
                
            case 'windowRestored':
                this.updateTaskbarButton(window.id, true);
                break;
        }
    }

    initializeSearch() {
        this.searchIndex = [
            { name: 'File Manager', app: 'file-manager', keywords: ['files', 'folders', 'explorer'] },
            { name: 'Text Editor', app: 'text-editor', keywords: ['text', 'edit', 'notepad', 'write'] },
            { name: 'Image Editor', app: 'image-editor', keywords: ['image', 'photo', 'paint', 'draw'] },
            { name: 'Terminal', app: 'terminal', keywords: ['command', 'console', 'shell', 'cmd'] },
            { name: 'Calculator', app: 'calculator', keywords: ['calc', 'math', 'numbers'] },
            { name: 'Media Player', app: 'media-player', keywords: ['music', 'audio', 'video', 'player'] },
            { name: 'Web Browser', app: 'web-browser', keywords: ['web', 'internet', 'browser', 'surf'] },
            { name: 'Settings', app: 'settings', keywords: ['config', 'preferences', 'options'] },
            { name: 'Games', app: 'games', keywords: ['game', 'play', 'entertainment'] },
            { name: 'Code Editor', app: 'code-editor', keywords: ['code', 'programming', 'development'] }
        ];
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        const results = this.searchIndex.filter(item => {
            const searchTerms = query.toLowerCase().split(' ');
            return searchTerms.every(term => 
                item.name.toLowerCase().includes(term) ||
                item.keywords.some(keyword => keyword.includes(term))
            );
        });

        this.searchResults = results;
        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        // Remove existing search results
        this.clearSearchResults();
        
        if (results.length === 0) return;

        const searchContainer = document.querySelector('.taskbar-search');
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result" data-app="${result.app}">
                <i class="ri-search-line"></i>
                <span>${result.name}</span>
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result').forEach(item => {
            item.addEventListener('click', () => {
                this.launchSearchResult(results.find(r => r.app === item.dataset.app));
                this.clearSearchResults();
                document.querySelector('.taskbar-search input').value = '';
            });
        });

        searchContainer.appendChild(resultsContainer);
    }

    launchSearchResult(result) {
        if (result) {
            const event = new CustomEvent('launchApplication', {
                detail: { appName: result.app }
            });
            document.dispatchEvent(event);
        }
    }

    clearSearchResults() {
        const existing = document.querySelector('.search-results');
        if (existing) {
            existing.remove();
        }
        this.searchResults = [];
    }

    handleTrayIconClick(icon) {
        const tooltip = icon.dataset.tooltip;
        
        switch (tooltip) {
            case 'Network':
                this.showNetworkMenu();
                break;
            case 'Volume':
                this.showVolumeControl();
                break;
            case 'Battery':
                this.showBatteryInfo();
                break;
            case 'Notifications':
                this.toggleNotificationCenter();
                break;
        }
    }

    showNetworkMenu() {
        // Simulate network menu
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Network', 'Connected to RetroOS Network', 'info');
        }
    }

    showVolumeControl() {
        // Simulate volume control
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Volume', 'Volume: 75%', 'info');
        }
    }

    showBatteryInfo() {
        // Simulate battery info
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Battery', 'Battery: 85% - 3h 24m remaining', 'info');
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'settings':
                const settingsEvent = new CustomEvent('launchApplication', {
                    detail: { appName: 'settings' }
                });
                document.dispatchEvent(settingsEvent);
                break;
                
            case 'power':
                this.showPowerMenu();
                break;
        }
        
        this.hideStartMenu();
    }

    showPowerMenu() {
        const powerMenu = document.createElement('div');
        powerMenu.className = 'power-menu';
        powerMenu.innerHTML = `
            <div class="power-option" data-action="restart">
                <i class="ri-restart-line"></i>
                <span>Restart</span>
            </div>
            <div class="power-option" data-action="shutdown">
                <i class="ri-shut-down-line"></i>
                <span>Shut Down</span>
            </div>
        `;
        
        // Position near start button
        const startButton = document.getElementById('startButton');
        const rect = startButton.getBoundingClientRect();
        powerMenu.style.position = 'fixed';
        powerMenu.style.bottom = '70px';
        powerMenu.style.left = `${rect.left}px`;
        powerMenu.style.background = 'rgba(255, 255, 255, 0.95)';
        powerMenu.style.backdropFilter = 'blur(20px)';
        powerMenu.style.border = '1px solid var(--border-color)';
        powerMenu.style.borderRadius = 'var(--radius-lg)';
        powerMenu.style.padding = 'var(--spacing-sm)';
        powerMenu.style.boxShadow = 'var(--shadow-xl)';
        powerMenu.style.zIndex = '3000';
        
        // Add click handlers
        powerMenu.querySelectorAll('.power-option').forEach(option => {
            option.addEventListener('click', () => {
                if (option.dataset.action === 'shutdown') {
                    window.retroOS.shutdown();
                } else if (option.dataset.action === 'restart') {
                    window.retroOS.restart();
                }
                powerMenu.remove();
            });
        });
        
        document.body.appendChild(powerMenu);
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removePowerMenu(e) {
                if (!powerMenu.contains(e.target)) {
                    powerMenu.remove();
                    document.removeEventListener('click', removePowerMenu);
                }
            });
        }, 100);
    }

    updateSystemTray() {
        // Update battery level periodically
        setInterval(() => {
            const batteryLevel = document.querySelector('.battery-level');
            if (batteryLevel) {
                const currentLevel = parseInt(batteryLevel.textContent);
                const newLevel = Math.max(10, currentLevel + (Math.random() - 0.5) * 2);
                batteryLevel.textContent = `${Math.round(newLevel)}%`;
                
                // Change color based on level
                const batteryIcon = batteryLevel.parentElement;
                if (newLevel < 20) {
                    batteryIcon.style.color = '#ef4444';
                } else if (newLevel < 50) {
                    batteryIcon.style.color = '#f59e0b';
                } else {
                    batteryIcon.style.color = '#10b981';
                }
            }
        }, 30000);
    }

    clearAllNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No notifications</div>';
        }
        
        // Update notification badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    getState() {
        return {
            isStartMenuOpen: this.isStartMenuOpen,
            isNotificationCenterOpen: this.isNotificationCenterOpen,
            windows: Array.from(this.windows.keys())
        };
    }
}