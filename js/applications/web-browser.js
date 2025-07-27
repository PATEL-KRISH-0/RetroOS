// Web Browser Application
class WebBrowser {
    constructor() {
        this.currentUrl = 'retroos://home';
        this.history = ['retroos://home'];
        this.historyIndex = 0;
        this.bookmarks = [
            { title: 'RetroOS Home', url: 'retroos://home' },
            { title: 'RetroOS Documentation', url: 'retroos://docs' },
            { title: 'RetroOS Settings', url: 'retroos://settings' },
            { title: 'RetroOS Games', url: 'retroos://games' }
        ];
        this.tabs = [
            { id: 1, title: 'RetroOS Home', url: 'retroos://home', active: true }
        ];
        this.activeTab = 1;
        this.nextTabId = 2;
    }

    getWindowConfig() {
        return {
            title: 'Web Browser',
            icon: 'ri-global-line',
            width: 900,
            height: 700
        };
    }

    render() {
        return `
            <div class="browser-content">
                <div class="browser-toolbar">
                    <div class="nav-buttons">
                        <button class="nav-button" data-action="back" title="Back" ${this.historyIndex <= 0 ? 'disabled' : ''}>
                            <i class="ri-arrow-left-line"></i>
                        </button>
                        <button class="nav-button" data-action="forward" title="Forward" ${this.historyIndex >= this.history.length - 1 ? 'disabled' : ''}>
                            <i class="ri-arrow-right-line"></i>
                        </button>
                        <button class="nav-button" data-action="refresh" title="Refresh">
                            <i class="ri-refresh-line"></i>
                        </button>
                        <button class="nav-button" data-action="home" title="Home">
                            <i class="ri-home-line"></i>
                        </button>
                    </div>
                    
                    <div class="address-bar">
                        <input type="text" class="address-input" value="${this.currentUrl}" placeholder="Enter URL or search...">
                    </div>
                    
                    <div class="browser-actions">
                        <button class="nav-button" data-action="bookmark" title="Bookmark">
                            <i class="ri-bookmark-line"></i>
                        </button>
                        <button class="nav-button" data-action="menu" title="Menu">
                            <i class="ri-menu-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="tab-bar">
                    ${this.renderTabs()}
                    <button class="new-tab-button" title="New Tab">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
                
                <div class="browser-viewport">
                    ${this.renderPage()}
                </div>
                
                <div class="browser-status">
                    <div class="status-left">
                        <span class="security-indicator">
                            <i class="ri-shield-check-line"></i>
                            Secure
                        </span>
                    </div>
                    <div class="status-right">
                        <span class="zoom-level">100%</span>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupEventListeners();
        this.loadPage(this.currentUrl);
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Navigation buttons
        window.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleNavigation(button.dataset.action);
            });
        });
        
        // Address bar
        const addressInput = window.querySelector('.address-input');
        addressInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigateToUrl(addressInput.value);
            }
        });
        
        addressInput.addEventListener('focus', () => {
            addressInput.select();
        });
        
        // Tab management
        const newTabButton = window.querySelector('.new-tab-button');
        newTabButton.addEventListener('click', () => {
            this.createNewTab();
        });
        
        // Tab clicks
        this.updateTabEventListeners();
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshPage();
                        break;
                    case 't':
                        e.preventDefault();
                        this.createNewTab();
                        break;
                    case 'w':
                        e.preventDefault();
                        this.closeCurrentTab();
                        break;
                    case 'l':
                        e.preventDefault();
                        addressInput.focus();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.addBookmark();
                        break;
                }
            }
            
            // Alt + Left/Right for navigation
            if (e.altKey) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.goBack();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.goForward();
                }
            }
        });
    }

    handleNavigation(action) {
        switch (action) {
            case 'back':
                this.goBack();
                break;
            case 'forward':
                this.goForward();
                break;
            case 'refresh':
                this.refreshPage();
                break;
            case 'home':
                this.navigateToUrl('retroos://home');
                break;
            case 'bookmark':
                this.addBookmark();
                break;
            case 'menu':
                this.showBrowserMenu();
                break;
        }
    }

    navigateToUrl(url) {
        // Simple URL processing
        if (!url.includes('://')) {
            if (url.includes('.')) {
                url = 'https://' + url;
            } else {
                url = 'retroos://search?q=' + encodeURIComponent(url);
            }
        }
        
        this.currentUrl = url;
        this.addToHistory(url);
        this.loadPage(url);
        this.updateAddressBar();
        this.updateNavigationButtons();
        this.updateCurrentTab();
    }

    loadPage(url) {
        const viewport = document.querySelector(`#${this.windowId} .browser-viewport`);
        if (!viewport) return;
        
        // Show loading state
        viewport.innerHTML = '<div class="loading-page"><i class="ri-loader-line"></i> Loading...</div>';
        
        // Simulate loading delay
        setTimeout(() => {
            viewport.innerHTML = this.renderPage(url);
            this.setupPageEventListeners();
        }, 500 + Math.random() * 1000);
    }

    renderPage(url = this.currentUrl) {
        if (url.startsWith('retroos://')) {
            return this.renderRetroOSPage(url);
        } else {
            return this.renderExternalPage(url);
        }
    }

    renderRetroOSPage(url) {
        const path = url.replace('retroos://', '');
        
        switch (path) {
            case 'home':
                return `
                    <div class="retroos-page">
                        <div class="page-header">
                            <h1>Welcome to RetroOS</h1>
                            <p>Your complete browser-based operating system</p>
                        </div>
                        
                        <div class="page-content">
                            <div class="feature-grid">
                                <div class="feature-card" data-url="retroos://apps">
                                    <i class="ri-apps-line"></i>
                                    <h3>Applications</h3>
                                    <p>Explore built-in applications</p>
                                </div>
                                
                                <div class="feature-card" data-url="retroos://files">
                                    <i class="ri-folder-line"></i>
                                    <h3>File Manager</h3>
                                    <p>Manage your files and folders</p>
                                </div>
                                
                                <div class="feature-card" data-url="retroos://settings">
                                    <i class="ri-settings-line"></i>
                                    <h3>Settings</h3>
                                    <p>Customize your experience</p>
                                </div>
                                
                                <div class="feature-card" data-url="retroos://games">
                                    <i class="ri-gamepad-line"></i>
                                    <h3>Games</h3>
                                    <p>Play built-in games</p>
                                </div>
                            </div>
                            
                            <div class="news-section">
                                <h2>Latest Updates</h2>
                                <div class="news-item">
                                    <h4>RetroOS 2.0 Released!</h4>
                                    <p>New features include advanced window management, improved performance, and modern UI design.</p>
                                    <span class="news-date">January 15, 2024</span>
                                </div>
                                <div class="news-item">
                                    <h4>New Applications Available</h4>
                                    <p>Code Editor, Image Editor, and Media Player have been added to the system.</p>
                                    <span class="news-date">January 10, 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'apps':
                return `
                    <div class="retroos-page">
                        <div class="page-header">
                            <h1>Applications</h1>
                            <p>Built-in applications for productivity and entertainment</p>
                        </div>
                        
                        <div class="apps-grid">
                            <div class="app-card" data-app="file-manager">
                                <i class="ri-folder-line"></i>
                                <h3>File Manager</h3>
                                <p>Browse and manage files</p>
                                <button class="launch-button">Launch</button>
                            </div>
                            
                            <div class="app-card" data-app="text-editor">
                                <i class="ri-file-text-line"></i>
                                <h3>Text Editor</h3>
                                <p>Create and edit text documents</p>
                                <button class="launch-button">Launch</button>
                            </div>
                            
                            <div class="app-card" data-app="image-editor">
                                <i class="ri-image-edit-line"></i>
                                <h3>Image Editor</h3>
                                <p>Edit and create images</p>
                                <button class="launch-button">Launch</button>
                            </div>
                            
                            <div class="app-card" data-app="calculator">
                                <i class="ri-calculator-line"></i>
                                <h3>Calculator</h3>
                                <p>Perform calculations</p>
                                <button class="launch-button">Launch</button>
                            </div>
                            
                            <div class="app-card" data-app="terminal">
                                <i class="ri-terminal-line"></i>
                                <h3>Terminal</h3>
                                <p>Command line interface</p>
                                <button class="launch-button">Launch</button>
                            </div>
                            
                            <div class="app-card" data-app="media-player">
                                <i class="ri-play-circle-line"></i>
                                <h3>Media Player</h3>
                                <p>Play audio and video files</p>
                                <button class="launch-button">Launch</button>
                            </div>
                        </div>
                        
                        <div class="feature-section">
                            <h2>Create Your Own Website</h2>
                            <div class="website-builder-card">
                                <i class="ri-code-s-slash-line"></i>
                                <h3>Website Builder</h3>
                                <p>Create and design your own websites with our built-in website builder</p>
                                <button class="website-builder-button">Open Website Builder</button>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'docs':
                return `
                    <div class="retroos-page">
                        <div class="page-header">
                            <h1>Documentation</h1>
                            <p>Learn how to use RetroOS</p>
                        </div>
                        
                        <div class="docs-content">
                            <div class="docs-sidebar">
                                <h3>Contents</h3>
                                <ul>
                                    <li><a href="#getting-started">Getting Started</a></li>
                                    <li><a href="#applications">Applications</a></li>
                                    <li><a href="#keyboard-shortcuts">Keyboard Shortcuts</a></li>
                                    <li><a href="#customization">Customization</a></li>
                                </ul>
                            </div>
                            
                            <div class="docs-main">
                                <section id="getting-started">
                                    <h2>Getting Started</h2>
                                    <p>Welcome to RetroOS! This operating system runs entirely in your browser and provides a complete desktop experience.</p>
                                    
                                    <h3>Basic Navigation</h3>
                                    <ul>
                                        <li>Double-click desktop icons to launch applications</li>
                                        <li>Use the taskbar to switch between open windows</li>
                                        <li>Right-click for context menus</li>
                                        <li>Click the Start button to access the application menu</li>
                                    </ul>
                                </section>
                                
                                <section id="applications">
                                    <h2>Applications</h2>
                                    <p>RetroOS includes several built-in applications:</p>
                                    
                                    <h3>File Manager</h3>
                                    <p>Browse and organize your files and folders with an intuitive interface.</p>
                                    
                                    <h3>Text Editor</h3>
                                    <p>Create and edit text documents with syntax highlighting and advanced features.</p>
                                    
                                    <h3>Terminal</h3>
                                    <p>Access a full-featured command line interface with many built-in commands.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                if (path.startsWith('search?q=')) {
                    const query = decodeURIComponent(path.split('=')[1]);
                    return this.renderSearchResults(query);
                }
                return this.render404Page();
        }
    }

    renderExternalPage(url) {
        return `
            <div class="external-page">
                <div class="external-notice">
                    <i class="ri-information-line"></i>
                    <h3>External Website</h3>
                    <p>This is a simulated external website. In a real browser, this would load the actual website.</p>
                    <p><strong>URL:</strong> ${url}</p>
                    <button class="mock-content-button">Show Mock Content</button>
                </div>
            </div>
        `;
    }

    renderSearchResults(query) {
        const results = [
            { title: 'RetroOS File Manager', url: 'retroos://apps', description: 'Built-in file management application' },
            { title: 'RetroOS Terminal', url: 'retroos://apps', description: 'Command line interface for RetroOS' },
            { title: 'RetroOS Documentation', url: 'retroos://docs', description: 'Complete guide to using RetroOS' }
        ].filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.description.toLowerCase().includes(query.toLowerCase())
        );
        
        return `
            <div class="search-results-page">
                <div class="search-header">
                    <h2>Search Results for "${query}"</h2>
                    <p>Found ${results.length} result(s)</p>
                </div>
                
                <div class="search-results">
                    ${results.map(result => `
                        <div class="search-result">
                            <h3><a href="${result.url}">${result.title}</a></h3>
                            <p class="result-url">${result.url}</p>
                            <p class="result-description">${result.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    render404Page() {
        return `
            <div class="error-page">
                <div class="error-content">
                    <i class="ri-error-warning-line"></i>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <button class="home-button" onclick="this.closest('.browser-viewport').dispatchEvent(new CustomEvent('navigate', {detail: 'retroos://home'}))">
                        Go Home
                    </button>
                </div>
            </div>
        `;
    }

    setupPageEventListeners() {
        const viewport = document.querySelector(`#${this.windowId} .browser-viewport`);
        
        // Feature cards
        viewport.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateToUrl(card.dataset.url);
            });
        });
        
        // App launch buttons
        viewport.querySelectorAll('.launch-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const appCard = button.closest('.app-card');
                if (appCard && appCard.dataset.app) {
                    const event = new CustomEvent('launchApplication', {
                        detail: { appName: appCard.dataset.app }
                    });
                    document.dispatchEvent(event);
                }
            });
        });
        
        // Internal links
        viewport.querySelectorAll('a[href^="retroos://"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToUrl(link.href);
            });
        });
        
        // Mock content button
        const mockButton = viewport.querySelector('.mock-content-button');
        if (mockButton) {
            mockButton.addEventListener('click', () => {
                this.showMockContent();
            });
        }
    }

    renderTabs() {
        return this.tabs.map(tab => `
            <div class="tab ${tab.active ? 'active' : ''}" data-tab-id="${tab.id}">
                <span class="tab-title">${tab.title}</span>
                <button class="tab-close" data-tab-id="${tab.id}">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `).join('');
    }

    updateTabEventListeners() {
        const window = document.getElementById(this.windowId);
        
        window.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-close')) {
                    this.switchToTab(parseInt(tab.dataset.tabId));
                }
            });
        });
        
        window.querySelectorAll('.tab-close').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(parseInt(button.dataset.tabId));
            });
        });
    }

    createNewTab() {
        const newTab = {
            id: this.nextTabId++,
            title: 'New Tab',
            url: 'retroos://home',
            active: false
        };
        
        this.tabs.push(newTab);
        this.switchToTab(newTab.id);
        this.updateTabBar();
    }

    closeTab(tabId) {
        if (this.tabs.length <= 1) return; // Don't close last tab
        
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;
        
        this.tabs.splice(tabIndex, 1);
        
        // If closing active tab, switch to another
        if (this.activeTab === tabId) {
            const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
            this.switchToTab(this.tabs[newActiveIndex].id);
        }
        
        this.updateTabBar();
    }

    switchToTab(tabId) {
        this.tabs.forEach(tab => {
            tab.active = tab.id === tabId;
        });
        
        this.activeTab = tabId;
        const activeTab = this.tabs.find(tab => tab.id === tabId);
        
        if (activeTab) {
            this.currentUrl = activeTab.url;
            this.loadPage(activeTab.url);
            this.updateAddressBar();
        }
        
        this.updateTabBar();
    }

    updateCurrentTab() {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTab);
        if (activeTab) {
            activeTab.url = this.currentUrl;
            activeTab.title = this.getPageTitle(this.currentUrl);
            this.updateTabBar();
        }
    }

    updateTabBar() {
        const tabBar = document.querySelector(`#${this.windowId} .tab-bar`);
        if (tabBar) {
            const newTabButton = tabBar.querySelector('.new-tab-button');
            tabBar.innerHTML = this.renderTabs();
            tabBar.appendChild(newTabButton);
            this.updateTabEventListeners();
        }
    }

    getPageTitle(url) {
        if (url.startsWith('retroos://')) {
            const path = url.replace('retroos://', '');
            switch (path) {
                case 'home': return 'RetroOS Home';
                case 'apps': return 'Applications';
                case 'docs': return 'Documentation';
                case 'settings': return 'Settings';
                case 'games': return 'Games';
                default: return 'RetroOS';
            }
        }
        
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return 'New Tab';
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentUrl = this.history[this.historyIndex];
            this.loadPage(this.currentUrl);
            this.updateAddressBar();
            this.updateNavigationButtons();
            this.updateCurrentTab();
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentUrl = this.history[this.historyIndex];
            this.loadPage(this.currentUrl);
            this.updateAddressBar();
            this.updateNavigationButtons();
            this.updateCurrentTab();
        }
    }

    refreshPage() {
        this.loadPage(this.currentUrl);
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Page Refreshed', 'Page has been reloaded', 'info');
        }
    }

    addToHistory(url) {
        // Remove any forward history when navigating to new page
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(url);
        this.historyIndex = this.history.length - 1;
    }

    updateAddressBar() {
        const addressInput = document.querySelector(`#${this.windowId} .address-input`);
        if (addressInput) {
            addressInput.value = this.currentUrl;
        }
    }

    updateNavigationButtons() {
        const backButton = document.querySelector(`#${this.windowId} [data-action="back"]`);
        const forwardButton = document.querySelector(`#${this.windowId} [data-action="forward"]`);
        
        if (backButton) {
            backButton.disabled = this.historyIndex <= 0;
        }
        
        if (forwardButton) {
            forwardButton.disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    addBookmark() {
        const title = this.getPageTitle(this.currentUrl);
        const bookmark = { title, url: this.currentUrl };
        
        if (!this.bookmarks.find(b => b.url === this.currentUrl)) {
            this.bookmarks.push(bookmark);
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Bookmark Added', `"${title}" added to bookmarks`, 'success');
            }
        }
    }

    showBrowserMenu() {
        // Create browser menu
        const menu = document.createElement('div');
        menu.className = 'browser-menu';
        menu.innerHTML = `
            <div class="menu-section">
                <div class="menu-item" data-action="new-tab">
                    <i class="ri-add-line"></i>
                    <span>New Tab</span>
                    <span class="shortcut">Ctrl+T</span>
                </div>
                <div class="menu-item" data-action="new-window">
                    <i class="ri-window-line"></i>
                    <span>New Window</span>
                </div>
            </div>
            
            <div class="menu-separator"></div>
            
            <div class="menu-section">
                <div class="menu-item" data-action="bookmarks">
                    <i class="ri-bookmark-line"></i>
                    <span>Bookmarks</span>
                </div>
                <div class="menu-item" data-action="history">
                    <i class="ri-history-line"></i>
                    <span>History</span>
                </div>
                <div class="menu-item" data-action="downloads">
                    <i class="ri-download-line"></i>
                    <span>Downloads</span>
                </div>
            </div>
            
            <div class="menu-separator"></div>
            
            <div class="menu-section">
                <div class="menu-item" data-action="settings">
                    <i class="ri-settings-line"></i>
                    <span>Settings</span>
                </div>
                <div class="menu-item" data-action="about">
                    <i class="ri-information-line"></i>
                    <span>About Browser</span>
                </div>
            </div>
        `;
        
        // Position and show menu
        const menuButton = document.querySelector(`#${this.windowId} [data-action="menu"]`);
        const rect = menuButton.getBoundingClientRect();
        
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        menu.style.background = 'rgba(255, 255, 255, 0.95)';
        menu.style.backdropFilter = 'blur(20px)';
        menu.style.border = '1px solid var(--border-color)';
        menu.style.borderRadius = 'var(--radius-lg)';
        menu.style.padding = 'var(--spacing-sm)';
        menu.style.boxShadow = 'var(--shadow-xl)';
        menu.style.zIndex = '4000';
        menu.style.minWidth = '200px';
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleMenuAction(item.dataset.action);
                menu.remove();
            });
        });
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu(e) {
                if (!menu.contains(e.target) && !menuButton.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', removeMenu);
                }
            });
        }, 100);
    }

    handleMenuAction(action) {
        switch (action) {
            case 'new-tab':
                this.createNewTab();
                break;
            case 'new-window':
                if (window.retroOS) {
                    window.retroOS.openApplication('web-browser');
                }
                break;
            case 'bookmarks':
                this.showBookmarks();
                break;
            case 'history':
                this.showHistory();
                break;
            case 'downloads':
                this.showDownloads();
                break;
            case 'settings':
                this.navigateToUrl('retroos://settings');
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }

    showBookmarks() {
        this.navigateToUrl('retroos://bookmarks');
    }

    showHistory() {
        this.navigateToUrl('retroos://history');
    }

    showDownloads() {
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Downloads', 'No downloads available', 'info');
        }
    }

    showAbout() {
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('About Browser', 'RetroOS Browser v2.0 - Built with modern web technologies', 'info');
        }
    }

    showMockContent() {
        const viewport = document.querySelector(`#${this.windowId} .browser-viewport`);
        viewport.innerHTML = `
            <div class="mock-website">
                <header class="mock-header">
                    <h1>Example Website</h1>
                    <nav>
                        <a href="#">Home</a>
                        <a href="#">About</a>
                        <a href="#">Services</a>
                        <a href="#">Contact</a>
                    </nav>
                </header>
                
                <main class="mock-main">
                    <section class="hero">
                        <h2>Welcome to Our Website</h2>
                        <p>This is a mock website to demonstrate the browser functionality.</p>
                        <button class="cta-button">Get Started</button>
                    </section>
                    
                    <section class="features">
                        <h3>Our Features</h3>
                        <div class="feature-grid">
                            <div class="feature">
                                <i class="ri-rocket-line"></i>
                                <h4>Fast Performance</h4>
                                <p>Lightning-fast loading times</p>
                            </div>
                            <div class="feature">
                                <i class="ri-shield-check-line"></i>
                                <h4>Secure</h4>
                                <p>Your data is protected</p>
                            </div>
                            <div class="feature">
                                <i class="ri-smartphone-line"></i>
                                <h4>Mobile Friendly</h4>
                                <p>Works on all devices</p>
                            </div>
                        </div>
                    </section>
                </main>
                
                <footer class="mock-footer">
                    <p>&copy; 2024 Example Website. All rights reserved.</p>
                </footer>
            </div>
        `;
    }
    
    openWebsiteBuilder() {
        // Create website builder window
        if (window.retroOS && window.retroOS.windowManager) {
            const windowId = window.retroOS.windowManager.createWindow({
                title: 'Website Builder',
                icon: 'ri-code-s-slash-line',
                width: 1000,
                height: 700,
                content: this.renderWebsiteBuilder()
            });
            
            setTimeout(() => {
                this.initWebsiteBuilder(windowId);
            }, 100);
        }
    }
    
    renderWebsiteBuilder() {
        return `
            <div class="website-builder">
                <div class="builder-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-button" data-action="new-site">
                            <i class="ri-file-add-line"></i>
                            New Site
                        </button>
                        <button class="toolbar-button" data-action="save-site">
                            <i class="ri-save-line"></i>
                            Save Site
                        </button>
                        <button class="toolbar-button" data-action="preview">
                            <i class="ri-eye-line"></i>
                            Preview
                        </button>
                    </div>
                    <div class="toolbar-group">
                        <select class="template-select">
                            <option value="">Choose Template</option>
                            <option value="blog">Blog</option>
                            <option value="portfolio">Portfolio</option>
                            <option value="business">Business</option>
                            <option value="landing">Landing Page</option>
                        </select>
                    </div>
                </div>
                
                <div class="builder-workspace">
                    <div class="builder-sidebar">
                        <div class="sidebar-section">
                            <h4>Elements</h4>
                            <div class="element-list">
                                <div class="element-item" data-element="heading">
                                    <i class="ri-h-1"></i>
                                    <span>Heading</span>
                                </div>
                                <div class="element-item" data-element="paragraph">
                                    <i class="ri-paragraph"></i>
                                    <span>Paragraph</span>
                                </div>
                                <div class="element-item" data-element="image">
                                    <i class="ri-image-line"></i>
                                    <span>Image</span>
                                </div>
                                <div class="element-item" data-element="button">
                                    <i class="ri-checkbox-blank-line"></i>
                                    <span>Button</span>
                                </div>
                                <div class="element-item" data-element="link">
                                    <i class="ri-link"></i>
                                    <span>Link</span>
                                </div>
                                <div class="element-item" data-element="list">
                                    <i class="ri-list-unordered"></i>
                                    <span>List</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Styles</h4>
                            <div class="style-controls">
                                <label>Background Color:</label>
                                <input type="color" class="bg-color-picker" value="#ffffff">
                                
                                <label>Text Color:</label>
                                <input type="color" class="text-color-picker" value="#000000">
                                
                                <label>Font Size:</label>
                                <select class="font-size-select">
                                    <option value="12px">12px</option>
                                    <option value="14px" selected>14px</option>
                                    <option value="16px">16px</option>
                                    <option value="18px">18px</option>
                                    <option value="24px">24px</option>
                                    <option value="32px">32px</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="builder-canvas">
                        <div class="canvas-header">
                            <span>Website Preview</span>
                            <div class="canvas-controls">
                                <button class="canvas-control" data-view="desktop">
                                    <i class="ri-computer-line"></i>
                                </button>
                                <button class="canvas-control" data-view="tablet">
                                    <i class="ri-tablet-line"></i>
                                </button>
                                <button class="canvas-control" data-view="mobile">
                                    <i class="ri-smartphone-line"></i>
                                </button>
                            </div>
                        </div>
                        <div class="website-canvas" id="websiteCanvas">
                            <div class="default-content">
                                <h1>Welcome to Your Website</h1>
                                <p>Start building by adding elements from the sidebar or choose a template.</p>
                                <button>Get Started</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    initWebsiteBuilder(windowId) {
        const window = document.getElementById(windowId);
        let currentSite = {
            title: 'My Website',
            elements: [],
            styles: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                fontSize: '14px'
            }
        };
        
        // Toolbar actions
        window.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleBuilderAction(button.dataset.action, currentSite, windowId);
            });
        });
        
        // Template selection
        const templateSelect = window.querySelector('.template-select');
        templateSelect.addEventListener('change', () => {
            if (templateSelect.value) {
                this.loadTemplate(templateSelect.value, windowId);
            }
        });
        
        // Element drag and drop
        window.querySelectorAll('.element-item').forEach(element => {
            element.addEventListener('click', () => {
                this.addElementToCanvas(element.dataset.element, windowId);
            });
        });
        
        // Style controls
        const bgColorPicker = window.querySelector('.bg-color-picker');
        const textColorPicker = window.querySelector('.text-color-picker');
        const fontSizeSelect = window.querySelector('.font-size-select');
        
        bgColorPicker.addEventListener('change', () => {
            this.updateCanvasStyle('backgroundColor', bgColorPicker.value, windowId);
        });
        
        textColorPicker.addEventListener('change', () => {
            this.updateCanvasStyle('color', textColorPicker.value, windowId);
        });
        
        fontSizeSelect.addEventListener('change', () => {
            this.updateCanvasStyle('fontSize', fontSizeSelect.value, windowId);
        });
    }
    
    handleBuilderAction(action, currentSite, windowId) {
        switch (action) {
            case 'new-site':
                this.newSite(windowId);
                break;
            case 'save-site':
                this.saveSite(currentSite);
                break;
            case 'preview':
                this.previewSite(windowId);
                break;
        }
    }
    
    loadTemplate(templateName, windowId) {
        const templates = {
            blog: `
                <header style="background: #2563eb; color: white; padding: 2rem; text-align: center;">
                    <h1>My Blog</h1>
                    <p>Welcome to my personal blog</p>
                </header>
                <main style="max-width: 800px; margin: 2rem auto; padding: 0 1rem;">
                    <article style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2>Blog Post Title</h2>
                        <p>This is a sample blog post. You can edit this content and add more posts.</p>
                        <a href="#" style="color: #2563eb;">Read more...</a>
                    </article>
                </main>
            `,
            portfolio: `
                <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center;">
                    <h1>John Doe</h1>
                    <p>Web Developer & Designer</p>
                </header>
                <section style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
                    <h2>My Work</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem;">
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                            <h3>Project 1</h3>
                            <p>Description of your project goes here.</p>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                            <h3>Project 2</h3>
                            <p>Description of your project goes here.</p>
                        </div>
                    </div>
                </section>
            `,
            business: `
                <header style="background: #1f2937; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;">
                    <h1>Business Name</h1>
                    <nav>
                        <a href="#" style="color: white; margin: 0 1rem;">Home</a>
                        <a href="#" style="color: white; margin: 0 1rem;">About</a>
                        <a href="#" style="color: white; margin: 0 1rem;">Services</a>
                        <a href="#" style="color: white; margin: 0 1rem;">Contact</a>
                    </nav>
                </header>
                <section style="background: #f9fafb; padding: 4rem 2rem; text-align: center;">
                    <h2 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to Our Business</h2>
                    <p style="font-size: 1.25rem; margin-bottom: 2rem;">We provide excellent services for your needs</p>
                    <button style="background: #2563eb; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.1rem;">Get Started</button>
                </section>
            `,
            landing: `
                <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
                    <div>
                        <h1 style="font-size: 4rem; margin-bottom: 1rem;">Amazing Product</h1>
                        <p style="font-size: 1.5rem; margin-bottom: 2rem;">The best solution for your needs</p>
                        <button style="background: white; color: #667eea; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.2rem; margin: 0 1rem;">Learn More</button>
                        <button style="background: transparent; color: white; padding: 1rem 2rem; border: 2px solid white; border-radius: 8px; font-size: 1.2rem; margin: 0 1rem;">Sign Up</button>
                    </div>
                </div>
            `
        };
        
        const canvas = document.querySelector(`#${windowId} #websiteCanvas`);
        if (canvas && templates[templateName]) {
            canvas.innerHTML = templates[templateName];
        }
    }
    
    addElementToCanvas(elementType, windowId) {
        const canvas = document.querySelector(`#${windowId} #websiteCanvas`);
        if (!canvas) return;
        
        const elements = {
            heading: '<h2 contenteditable="true">New Heading</h2>',
            paragraph: '<p contenteditable="true">New paragraph text goes here.</p>',
            image: '<img src="https://via.placeholder.com/300x200" alt="Placeholder" style="max-width: 100%; height: auto;">',
            button: '<button contenteditable="true" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px;">Button</button>',
            link: '<a href="#" contenteditable="true" style="color: #2563eb;">Link Text</a>',
            list: '<ul><li contenteditable="true">List item 1</li><li contenteditable="true">List item 2</li></ul>'
        };
        
        if (elements[elementType]) {
            const wrapper = document.createElement('div');
            wrapper.style.margin = '1rem 0';
            wrapper.innerHTML = elements[elementType];
            canvas.appendChild(wrapper);
        }
    }
    
    updateCanvasStyle(property, value, windowId) {
        const canvas = document.querySelector(`#${windowId} #websiteCanvas`);
        if (canvas) {
            canvas.style[property] = value;
        }
    }
    
    newSite(windowId) {
        const canvas = document.querySelector(`#${windowId} #websiteCanvas`);
        if (canvas) {
            canvas.innerHTML = `
                <div class="default-content">
                    <h1>Welcome to Your Website</h1>
                    <p>Start building by adding elements from the sidebar or choose a template.</p>
                    <button>Get Started</button>
                </div>
            `;
        }
    }
    
    saveSite(siteData) {
        const siteName = prompt('Enter website name:', 'My Website');
        if (siteName) {
            try {
                const savedSites = JSON.parse(localStorage.getItem('retroos-websites') || '{}');
                savedSites[siteName] = {
                    ...siteData,
                    created: new Date().toISOString()
                };
                localStorage.setItem('retroos-websites', JSON.stringify(savedSites));
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Website Saved', `"${siteName}" saved successfully`, 'success');
                }
            } catch (error) {
                console.error('Failed to save website:', error);
            }
        }
    }
    
    previewSite(windowId) {
        const canvas = document.querySelector(`#${windowId} #websiteCanvas`);
        if (canvas) {
            const content = canvas.innerHTML;
            const previewUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Website Preview</title>
                    <style>
                        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                        * { box-sizing: border-box; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `)}`;
            
            this.navigateToUrl(previewUrl);
        }
    }

    cleanup() {
        // Clean up any resources
        this.tabs = [];
        this.history = [];
        this.bookmarks = [];
    }
}

// Add browser-specific styles
const browserStyles = document.createElement('style');
browserStyles.textContent = `
    .tab-bar {
        background: #f8fafc;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        padding: 0 var(--spacing-sm);
        overflow-x: auto;
    }
    
    .tab {
        background: #e2e8f0;
        border: 1px solid var(--border-color);
        border-bottom: none;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        padding: var(--spacing-sm) var(--spacing-md);
        margin-right: 2px;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        max-width: 200px;
        min-width: 120px;
    }
    
    .tab.active {
        background: white;
        border-bottom: 1px solid white;
        margin-bottom: -1px;
    }
    
    .tab:hover {
        background: #f1f5f9;
    }
    
    .tab.active:hover {
        background: white;
    }
    
    .tab-title {
        flex: 1;
        font-size: 0.875rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .tab-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 2px;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
    }
    
    .tab-close:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    .new-tab-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        margin-left: var(--spacing-sm);
    }
    
    .new-tab-button:hover {
        background: #f1f5f9;
        color: var(--text-primary);
    }
    
    .browser-actions {
        display: flex;
        gap: var(--spacing-xs);
    }
    
    .browser-status {
        background: #f8fafc;
        border-top: 1px solid var(--border-color);
        padding: var(--spacing-sm) var(--spacing-lg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .security-indicator {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        color: #10b981;
    }
    
    .retroos-page {
        padding: var(--spacing-xl);
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .page-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }
    
    .page-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-md);
        background: linear-gradient(45deg, var(--accent-color), #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .page-header p {
        font-size: 1.25rem;
        color: var(--text-secondary);
    }
    
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-2xl);
    }
    
    .feature-card {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        text-align: center;
        cursor: pointer;
        transition: all var(--transition-normal);
        box-shadow: var(--shadow-sm);
    }
    
    .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
        border-color: var(--accent-color);
    }
    
    .feature-card i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: var(--spacing-lg);
    }
    
    .feature-card h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
    }
    
    .feature-card p {
        color: var(--text-secondary);
    }
    
    .news-section {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
    }
    
    .news-section h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: var(--spacing-lg);
    }
    
    .news-item {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
        margin-bottom: var(--spacing-lg);
    }
    
    .news-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .news-item h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
    }
    
    .news-item p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-sm);
    }
    
    .news-date {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .apps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-xl);
    }
    
    .app-card {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--spacing-xl);
        text-align: center;
        transition: all var(--transition-normal);
        box-shadow: var(--shadow-sm);
    }
    
    .app-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .app-card i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: var(--spacing-lg);
    }
    
    .app-card h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
    }
    
    .app-card p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);
    }
    
    .launch-button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
    }
    
    .launch-button:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
    }
    
    .loading-page {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 1.1rem;
        color: var(--text-secondary);
        gap: var(--spacing-md);
    }
    
    .loading-page i {
        animation: spin 1s linear infinite;
    }
    
    .external-page {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: var(--spacing-xl);
    }
    
    .external-notice {
        text-align: center;
        max-width: 500px;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        box-shadow: var(--shadow-lg);
    }
    
    .external-notice i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: var(--spacing-lg);
    }
    
    .external-notice h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }
    
    .external-notice p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
        line-height: 1.6;
    }
    
    .mock-content-button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-md) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
        margin-top: var(--spacing-md);
    }
    
    .mock-content-button:hover {
        background: var(--accent-hover);
    }
    
    .error-page {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    
    .error-content {
        text-align: center;
        max-width: 400px;
    }
    
    .error-content i {
        font-size: 4rem;
        color: #ef4444;
        margin-bottom: var(--spacing-lg);
    }
    
    .error-content h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }
    
    .error-content p {
        color: var(--text-secondary);
        margin-bottom: var(--spacing-lg);
    }
    
    .home-button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-md) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
    }
    
    .home-button:hover {
        background: var(--accent-hover);
    }
`;
document.head.appendChild(browserStyles);