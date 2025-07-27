// Desktop Manager - Handles desktop functionality
class Desktop {
    constructor() {
        this.selectedIcons = new Set();
        this.contextMenuVisible = false;
        this.wallpapers = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        this.currentWallpaper = 0;
    }

    init() {
        console.log('🖥️ Initializing Desktop...');
        this.setupEventListeners();
        this.initializeIcons();
        this.loadWallpaper();
    }

    setupEventListeners() {
        const desktop = document.getElementById('desktop');
        
        // Desktop icon interactions
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            // Double-click to launch
            icon.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const appName = icon.dataset.app;
                if (appName) {
                    const event = new CustomEvent('launchApplication', {
                        detail: { appName: appName }
                    });
                    document.dispatchEvent(event);
                }
            });
            
            // Single click to select
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectIcon(icon, e.ctrlKey || e.metaKey);
            });
            
            // Touch events for mobile
            let touchStartTime = 0;
            icon.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
            });
            
            icon.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;
                if (touchDuration < 300) {
                    // Short tap - select
                    this.selectIcon(icon, false);
                } else if (touchDuration > 500) {
                    // Long tap - launch
                    e.preventDefault();
                    const appName = icon.dataset.app;
                    if (appName) {
                        const event = new CustomEvent('launchApplication', {
                            detail: { appName: appName }
                        });
                        document.dispatchEvent(event);
                    }
                }
            });
        });

        // Desktop right-click context menu
        desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!e.target.closest('.desktop-icon') && !e.target.closest('.window')) {
                this.showContextMenu(e.clientX, e.clientY);
            }
        });

        // Context menu actions
        document.addEventListener('click', (e) => {
            const contextItem = e.target.closest('.context-item');
            if (contextItem) {
                this.handleContextAction(contextItem.dataset.action);
                this.hideContextMenu();
            } else if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
            
            // Deselect icons when clicking on empty desktop
            if (e.target.closest('.desktop') && !e.target.closest('.desktop-icon') && !e.target.closest('.window')) {
                this.clearSelection();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Delete key - delete selected icons (simulate)
            if (e.key === 'Delete' && this.selectedIcons.size > 0) {
                this.deleteSelectedIcons();
            }
            
            // Ctrl+A - Select all icons
            if (e.ctrlKey && e.key === 'a' && e.target.closest('.desktop')) {
                e.preventDefault();
                this.selectAllIcons();
            }
            
            // F5 - Refresh desktop
            if (e.key === 'F5' && e.target.closest('.desktop')) {
                e.preventDefault();
                this.refreshDesktop();
            }
        });

        // Widget interactions
        document.querySelectorAll('.widget').forEach(widget => {
            widget.addEventListener('click', () => {
                this.handleWidgetClick(widget);
            });
        });

        // Listen for application launches
        document.addEventListener('launchApplication', (e) => {
            if (window.retroOS) {
                window.retroOS.openApplication(e.detail.appName);
            }
        });
        
        // Prevent desktop icons from being affected by window operations
        document.addEventListener('windowEvent', (e) => {
            // Desktop icons should always remain visible
            const icons = document.querySelectorAll('.desktop-icon');
            icons.forEach(icon => {
                if (icon.style.display === 'none') {
                    icon.style.display = '';
                }
            });
        });
    }

    initializeIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        
        // Add hover effects and animations
        icons.forEach((icon, index) => {
            // Stagger entrance animations
            icon.style.animationDelay = `${index * 0.1}s`;
            
            // Add ripple effect on click
            icon.addEventListener('mousedown', (e) => {
                this.createRippleEffect(icon, e);
            });
        });
    }

    selectIcon(icon, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        icon.classList.add('selected');
        this.selectedIcons.add(icon);
        
        // Add selection animation
        icon.style.animation = 'pulse 0.3s ease-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 300);
    }

    clearSelection() {
        this.selectedIcons.forEach(icon => {
            icon.classList.remove('selected');
        });
        this.selectedIcons.clear();
    }

    selectAllIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.classList.add('selected');
            this.selectedIcons.add(icon);
        });
    }

    deleteSelectedIcons() {
        // Simulate deletion (in a real OS, this would move to trash)
        this.selectedIcons.forEach(icon => {
            icon.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                icon.style.animation = '';
                icon.style.opacity = '0.5';
                icon.classList.add('deleted');
            }, 300);
        });
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show(
                'Items Deleted', 
                `${this.selectedIcons.size} item(s) moved to trash`, 
                'info'
            );
        }
        
        this.clearSelection();
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        
        // Position menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
        
        // Ensure menu stays within viewport
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${y - rect.height}px`;
        }
        
        this.contextMenuVisible = true;
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'none';
        this.contextMenuVisible = false;
    }

    handleContextAction(action) {
        switch (action) {
            case 'refresh':
                this.refreshDesktop();
                break;
            case 'new-folder':
                this.createNewFolder();
                break;
            case 'new-file':
                this.createNewFile();
                break;
            case 'wallpaper':
                this.changeWallpaper();
                break;
            case 'properties':
                this.showDesktopProperties();
                break;
        }
    }

    refreshDesktop() {
        // Animate refresh
        const desktop = document.getElementById('desktop');
        desktop.style.animation = 'fadeIn 0.5s ease-out';
        
        // Restore deleted icons
        document.querySelectorAll('.desktop-icon.deleted').forEach(icon => {
            icon.style.opacity = '';
            icon.classList.remove('deleted');
        });
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Desktop Refreshed', 'Desktop has been refreshed', 'success');
        }
        
        setTimeout(() => {
            desktop.style.animation = '';
        }, 500);
    }

    createNewFolder() {
        // Simulate creating a new folder
        const iconsContainer = document.querySelector('.desktop-icons');
        const newFolder = document.createElement('div');
        newFolder.className = 'desktop-icon animate-in';
        newFolder.innerHTML = `
            <i class="ri-folder-line"></i>
            <span>New Folder</span>
        `;
        
        iconsContainer.appendChild(newFolder);
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Folder Created', 'New folder created on desktop', 'success');
        }
    }

    createNewFile() {
        // Simulate creating a new file
        const iconsContainer = document.querySelector('.desktop-icons');
        const newFile = document.createElement('div');
        newFile.className = 'desktop-icon animate-in';
        newFile.innerHTML = `
            <i class="ri-file-line"></i>
            <span>New File.txt</span>
        `;
        
        iconsContainer.appendChild(newFile);
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('File Created', 'New file created on desktop', 'success');
        }
    }

    changeWallpaper() {
        this.currentWallpaper = (this.currentWallpaper + 1) % this.wallpapers.length;
        const desktop = document.getElementById('desktop');
        
        // Smooth transition
        desktop.style.transition = 'background 0.5s ease-out';
        desktop.style.background = this.wallpapers[this.currentWallpaper];
        
        // Save preference
        if (window.retroOS && window.retroOS.storage) {
            window.retroOS.storage.save('wallpaper', this.currentWallpaper);
        }
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Wallpaper Changed', 'Desktop wallpaper updated', 'success');
        }
        
        setTimeout(() => {
            desktop.style.transition = '';
        }, 500);
    }

    showDesktopProperties() {
        // Launch settings app with desktop properties
        if (window.retroOS) {
            window.retroOS.openApplication('settings');
        }
    }

    handleWidgetClick(widget) {
        if (widget.classList.contains('weather-widget')) {
            this.updateWeatherWidget();
        } else if (widget.classList.contains('system-monitor')) {
            // Open system monitor in terminal
            if (window.retroOS) {
                window.retroOS.openApplication('terminal');
            }
        }
    }

    updateWeatherWidget() {
        const temperatures = [18, 19, 20, 21, 22, 23, 24, 25, 26];
        const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear', 'Overcast'];
        
        const tempElement = document.querySelector('.weather-widget .temperature');
        const conditionElement = document.querySelector('.weather-widget .condition');
        
        if (tempElement && conditionElement) {
            const newTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
            const newCondition = conditions[Math.floor(Math.random() * conditions.length)];
            
            tempElement.textContent = `${newTemp}°C`;
            conditionElement.textContent = newCondition;
            
            // Add update animation
            tempElement.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                tempElement.style.animation = '';
            }, 500);
        }
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    async loadWallpaper() {
        try {
            if (window.retroOS && window.retroOS.storage) {
                const savedWallpaper = await window.retroOS.storage.load('wallpaper');
                if (savedWallpaper !== null) {
                    this.currentWallpaper = savedWallpaper;
                    const desktop = document.getElementById('desktop');
                    desktop.style.background = this.wallpapers[this.currentWallpaper];
                }
            }
        } catch (error) {
            console.error('Failed to load wallpaper preference:', error);
        }
    }

    getState() {
        return {
            selectedIcons: Array.from(this.selectedIcons).map(icon => icon.dataset.app),
            currentWallpaper: this.currentWallpaper,
            contextMenuVisible: this.contextMenuVisible
        };
    }

    setState(state) {
        if (state.currentWallpaper !== undefined) {
            this.currentWallpaper = state.currentWallpaper;
            const desktop = document.getElementById('desktop');
            desktop.style.background = this.wallpapers[this.currentWallpaper];
        }
    }
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(rippleStyle);