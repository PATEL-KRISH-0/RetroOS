// Main RetroOS Application
class RetroOS {
    constructor() {
        this.system = new SystemCore();
        this.windowManager = new WindowManager();
        this.taskbar = new Taskbar();
        this.desktop = new Desktop();
        this.storage = new StorageManager();
        this.themes = new ThemeManager();
        this.notifications = new NotificationManager();
        
        this.applications = new Map();
        this.isBooting = true;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing RetroOS...');
        
        // Show boot screen
        await this.showBootScreen();
        
        // Initialize core systems
        this.system.init();
        this.windowManager.init();
        this.taskbar.init();
        this.desktop.init();
        this.themes.init();
        
        // Register applications
        this.registerApplications();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved state
        await this.loadSystemState();
        
        // Show desktop
        this.showDesktop();
        
        // Show welcome notification
        this.notifications.show('Welcome to RetroOS', 'System initialized successfully!', 'success');
        
        console.log('✅ RetroOS initialized successfully');
    }

    async showBootScreen() {
        return new Promise((resolve) => {
            const bootMessages = document.querySelectorAll('.boot-message');
            let messageIndex = 0;
            
            const showNextMessage = () => {
                if (messageIndex < bootMessages.length) {
                    bootMessages[messageIndex].style.opacity = '1';
                    messageIndex++;
                    setTimeout(showNextMessage, 800);
                } else {
                    setTimeout(resolve, 1000);
                }
            };
            
            setTimeout(showNextMessage, 1000);
        });
    }

    showDesktop() {
        document.getElementById('bootScreen').style.display = 'none';
        document.getElementById('osContainer').style.display = 'block';
        
        // Animate desktop icons
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach((icon, index) => {
            icon.style.animationDelay = `${index * 0.1}s`;
            icon.classList.add('animate-in');
        });
        
        // Animate widgets
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach((widget, index) => {
            widget.style.animationDelay = `${(index + icons.length) * 0.1}s`;
            widget.classList.add('animate-in');
        });
    }

    registerApplications() {
        this.applications.set('file-manager', new FileManager());
        this.applications.set('text-editor', new TextEditor());
        this.applications.set('image-editor', new ImageEditor());
        this.applications.set('terminal', new Terminal());
        this.applications.set('calculator', new Calculator());
        this.applications.set('media-player', new MediaPlayer());
        this.applications.set('web-browser', new WebBrowser());
        this.applications.set('settings', new Settings());
        this.applications.set('games', new Games());
        this.applications.set('code-editor', new CodeEditor());
    }

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + Tab - Window switching
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.windowManager.cycleWindows();
            }
            
            // Ctrl + Alt + T - Open terminal
            if (e.ctrlKey && e.altKey && e.key === 't') {
                e.preventDefault();
                this.openApplication('terminal');
            }
            
            // Windows key - Toggle start menu
            if (e.key === 'Meta' || e.key === 'OS') {
                e.preventDefault();
                this.taskbar.toggleStartMenu();
            }
            
            // F11 - Toggle fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Escape - Close menus
            if (e.key === 'Escape') {
                this.taskbar.hideStartMenu();
                this.desktop.hideContextMenu();
                this.hideNotificationCenter();
            }
        });

        // Application launching
        document.addEventListener('click', (e) => {
            const appTrigger = e.target.closest('[data-app]');
            if (appTrigger) {
                const appName = appTrigger.dataset.app;
                this.openApplication(appName);
            }
        });

        // Window focus management
        document.addEventListener('mousedown', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                this.windowManager.focusWindow(window.id);
            }
        });

        // Prevent context menu on certain elements
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.taskbar') || e.target.closest('.start-menu')) {
                e.preventDefault();
            }
        });

        // Auto-save state periodically
        setInterval(() => {
            this.saveSystemState();
        }, 30000); // Save every 30 seconds

        // Save state before unload
        window.addEventListener('beforeunload', () => {
            this.saveSystemState();
        });
    }

    openApplication(appName) {
        const app = this.applications.get(appName);
        if (!app) {
            this.notifications.show('Error', `Application "${appName}" not found`, 'error');
            return;
        }

        // Check if app is already open
        const existingWindow = this.windowManager.findWindowByApp(appName);
        if (existingWindow) {
            this.windowManager.focusWindow(existingWindow.id);
            this.windowManager.restoreWindow(existingWindow.id);
            return;
        }

        // Show loading notification
        this.notifications.show('Loading', `Starting ${app.getWindowConfig().title}...`, 'info', 2000);

        // Create new window
        const windowConfig = app.getWindowConfig();
        const windowId = this.windowManager.createWindow({
            ...windowConfig,
            appName: appName,
            content: app.render()
        });

        // Initialize app
        setTimeout(() => {
            app.init(windowId);
        }, 100);
        
        // Add to taskbar
        this.taskbar.addWindow(windowId, windowConfig.title, windowConfig.icon);
        
        setTimeout(() => {
            this.notifications.show('Application Ready', `${windowConfig.title} is ready to use`, 'success');
        }, 500);
    }
    
    openApplicationWithFile(appName, fileData) {
        // Store file data temporarily for the app to access
        this.currentFileData = fileData;
        this.openApplication(appName);
    }

    closeApplication(windowId) {
        const window = this.windowManager.getWindow(windowId);
        if (!window) return;

        const app = this.applications.get(window.appName);
        if (app && app.cleanup) {
            app.cleanup();
        }

        this.windowManager.closeWindow(windowId);
        this.taskbar.removeWindow(windowId);
        
        // Don't affect desktop icons when closing apps
        // Desktop icons should remain visible
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    showNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        center.style.display = 'block';
        center.classList.add('animate-in');
    }

    hideNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        center.style.display = 'none';
        center.classList.remove('animate-in');
    }

    async saveSystemState() {
        const state = {
            windows: this.windowManager.getState(),
            taskbar: this.taskbar.getState(),
            desktop: this.desktop.getState(),
            theme: this.themes.getCurrentTheme(),
            timestamp: Date.now()
        };

        await this.storage.save('system-state', state);
    }

    async loadSystemState() {
        try {
            const state = await this.storage.load('system-state');
            if (!state) return;

            // Restore theme
            if (state.theme) {
                this.themes.setTheme(state.theme);
            }

            // Restore desktop state
            if (state.desktop) {
                this.desktop.setState(state.desktop);
            }

            // Note: Window restoration would happen here in a full implementation
            console.log('System state loaded successfully');
        } catch (error) {
            console.error('Failed to load system state:', error);
        }
    }

    shutdown() {
        this.notifications.show('System Shutdown', 'RetroOS is shutting down...', 'warning');
        
        // Save state
        this.saveSystemState();
        
        // Close all windows
        this.windowManager.closeAllWindows();
        
        setTimeout(() => {
            document.getElementById('osContainer').style.display = 'none';
            document.body.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    color: white;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <i class="ri-computer-line" style="font-size: 4rem; margin-bottom: 2rem; color: #60a5fa;"></i>
                    <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">RetroOS</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.8;">It's now safe to turn off your computer.</p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                        border: none;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        Restart System
                    </button>
                </div>
            `;
        }, 2000);
    }

    restart() {
        this.shutdown();
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}

// Initialize RetroOS when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.retroOS = new RetroOS();
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('RetroOS Error:', e.error);
    if (window.retroOS && window.retroOS.notifications) {
        window.retroOS.notifications.show('System Error', 'An unexpected error occurred', 'error');
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`🚀 RetroOS loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });
}