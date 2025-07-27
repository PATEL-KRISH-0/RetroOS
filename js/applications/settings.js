// Settings Application
class Settings {
    constructor() {
        this.currentSection = 'appearance';
        this.settings = {
            appearance: {
                theme: 'light',
                wallpaper: 0,
                accentColor: '#4f46e5',
                fontSize: 'medium',
                animations: true
            },
            system: {
                notifications: true,
                sounds: true,
                autoSave: true,
                language: 'en',
                timezone: 'auto'
            },
            privacy: {
                analytics: false,
                crashReports: true,
                locationServices: false,
                cookies: 'essential'
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                reduceMotion: false,
                screenReader: false
            }
        };
    }

    getWindowConfig() {
        return {
            title: 'Settings',
            icon: 'ri-settings-line',
            width: 800,
            height: 600
        };
    }

    render() {
        return `
            <div class="settings-content">
                <div class="settings-sidebar">
                    <div class="settings-nav">
                        <div class="settings-nav-item active" data-section="appearance">
                            <i class="ri-palette-line"></i>
                            <span>Appearance</span>
                        </div>
                        <div class="settings-nav-item" data-section="system">
                            <i class="ri-computer-line"></i>
                            <span>System</span>
                        </div>
                        <div class="settings-nav-item" data-section="privacy">
                            <i class="ri-shield-user-line"></i>
                            <span>Privacy</span>
                        </div>
                        <div class="settings-nav-item" data-section="accessibility">
                            <i class="ri-accessibility-line"></i>
                            <span>Accessibility</span>
                        </div>
                        <div class="settings-nav-item" data-section="about">
                            <i class="ri-information-line"></i>
                            <span>About</span>
                        </div>
                    </div>
                </div>
                
                <div class="settings-main">
                    <div id="settingsContent">
                        ${this.renderSection(this.currentSection)}
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Navigation
        window.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchSection(item.dataset.section);
                
                // Update active state
                window.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Setting controls
        this.setupSectionEventListeners();
    }

    setupSectionEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Toggle switches
        window.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.toggleSetting(toggle.dataset.setting, toggle.dataset.category);
            });
        });
        
        // Select dropdowns
        window.querySelectorAll('.setting-select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateSetting(select.dataset.setting, select.dataset.category, select.value);
            });
        });
        
        // Color picker
        const colorPicker = window.querySelector('.accent-color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('change', () => {
                this.updateSetting('accentColor', 'appearance', colorPicker.value);
                this.applyAccentColor(colorPicker.value);
            });
        }
        
        // Wallpaper selection
        window.querySelectorAll('.wallpaper-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectWallpaper(parseInt(option.dataset.wallpaper));
                
                // Update active state
                window.querySelectorAll('.wallpaper-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Theme selection
        window.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectTheme(option.dataset.theme);
                
                // Update active state
                window.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Reset buttons
        window.querySelectorAll('.reset-button').forEach(button => {
            button.addEventListener('click', () => {
                this.resetSection(button.dataset.section);
            });
        });
    }

    switchSection(section) {
        this.currentSection = section;
        const content = document.querySelector(`#${this.windowId} #settingsContent`);
        if (content) {
            content.innerHTML = this.renderSection(section);
            this.setupSectionEventListeners();
        }
    }

    renderSection(section) {
        switch (section) {
            case 'appearance':
                return this.renderAppearanceSection();
            case 'system':
                return this.renderSystemSection();
            case 'privacy':
                return this.renderPrivacySection();
            case 'accessibility':
                return this.renderAccessibilitySection();
            case 'about':
                return this.renderAboutSection();
            default:
                return '<div>Section not found</div>';
        }
    }

    renderAppearanceSection() {
        return `
            <div class="settings-section">
                <h3>Appearance</h3>
                <p>Customize the look and feel of RetroOS</p>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Theme</h4>
                        <p>Choose between light and dark themes</p>
                    </div>
                    <div class="theme-selector">
                        <div class="theme-option ${this.settings.appearance.theme === 'light' ? 'active' : ''}" data-theme="light">
                            <div class="theme-preview light-theme">
                                <div class="theme-header"></div>
                                <div class="theme-content"></div>
                            </div>
                            <span>Light</span>
                        </div>
                        <div class="theme-option ${this.settings.appearance.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                            <div class="theme-preview dark-theme">
                                <div class="theme-header"></div>
                                <div class="theme-content"></div>
                            </div>
                            <span>Dark</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Accent Color</h4>
                        <p>Choose your preferred accent color</p>
                    </div>
                    <div class="accent-color-container">
                        <input type="color" class="accent-color-picker" value="${this.settings.appearance.accentColor}">
                        <div class="color-presets">
                            <div class="color-preset" style="background: #4f46e5;" data-color="#4f46e5"></div>
                            <div class="color-preset" style="background: #059669;" data-color="#059669"></div>
                            <div class="color-preset" style="background: #dc2626;" data-color="#dc2626"></div>
                            <div class="color-preset" style="background: #7c3aed;" data-color="#7c3aed"></div>
                            <div class="color-preset" style="background: #ea580c;" data-color="#ea580c"></div>
                            <div class="color-preset" style="background: #0891b2;" data-color="#0891b2"></div>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Wallpaper</h4>
                        <p>Select your desktop wallpaper</p>
                    </div>
                    <div class="wallpaper-grid">
                        ${this.renderWallpaperOptions()}
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Font Size</h4>
                        <p>Adjust the system font size</p>
                    </div>
                    <select class="setting-select" data-setting="fontSize" data-category="appearance">
                        <option value="small" ${this.settings.appearance.fontSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${this.settings.appearance.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${this.settings.appearance.fontSize === 'large' ? 'selected' : ''}>Large</option>
                        <option value="extra-large" ${this.settings.appearance.fontSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Animations</h4>
                        <p>Enable or disable system animations</p>
                    </div>
                    <div class="toggle-switch ${this.settings.appearance.animations ? 'active' : ''}" data-setting="animations" data-category="appearance"></div>
                </div>
                
                <div class="setting-actions">
                    <button class="reset-button" data-section="appearance">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    renderSystemSection() {
        return `
            <div class="settings-section">
                <h3>System</h3>
                <p>Configure system behavior and preferences</p>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Notifications</h4>
                        <p>Show system notifications</p>
                    </div>
                    <div class="toggle-switch ${this.settings.system.notifications ? 'active' : ''}" data-setting="notifications" data-category="system"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>System Sounds</h4>
                        <p>Play sounds for system events</p>
                    </div>
                    <div class="toggle-switch ${this.settings.system.sounds ? 'active' : ''}" data-setting="sounds" data-category="system"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Auto Save</h4>
                        <p>Automatically save your work</p>
                    </div>
                    <div class="toggle-switch ${this.settings.system.autoSave ? 'active' : ''}" data-setting="autoSave" data-category="system"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Language</h4>
                        <p>System display language</p>
                    </div>
                    <select class="setting-select" data-setting="language" data-category="system">
                        <option value="en" ${this.settings.system.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="es" ${this.settings.system.language === 'es' ? 'selected' : ''}>Español</option>
                        <option value="fr" ${this.settings.system.language === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="de" ${this.settings.system.language === 'de' ? 'selected' : ''}>Deutsch</option>
                        <option value="ja" ${this.settings.system.language === 'ja' ? 'selected' : ''}>日本語</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Time Zone</h4>
                        <p>System time zone setting</p>
                    </div>
                    <select class="setting-select" data-setting="timezone" data-category="system">
                        <option value="auto" ${this.settings.system.timezone === 'auto' ? 'selected' : ''}>Auto-detect</option>
                        <option value="utc" ${this.settings.system.timezone === 'utc' ? 'selected' : ''}>UTC</option>
                        <option value="est" ${this.settings.system.timezone === 'est' ? 'selected' : ''}>Eastern Time</option>
                        <option value="pst" ${this.settings.system.timezone === 'pst' ? 'selected' : ''}>Pacific Time</option>
                        <option value="gmt" ${this.settings.system.timezone === 'gmt' ? 'selected' : ''}>GMT</option>
                    </select>
                </div>
                
                <div class="system-info">
                    <h4>System Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Version:</span>
                            <span>RetroOS 2.0.0</span>
                        </div>
                        <div class="info-item">
                            <span>Build:</span>
                            <span>20240115</span>
                        </div>
                        <div class="info-item">
                            <span>Kernel:</span>
                            <span>WebKernel 5.0</span>
                        </div>
                        <div class="info-item">
                            <span>Architecture:</span>
                            <span>x64</span>
                        </div>
                        <div class="info-item">
                            <span>Memory:</span>
                            <span>${Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024)}MB</span>
                        </div>
                        <div class="info-item">
                            <span>Storage:</span>
                            <span>Unlimited</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-actions">
                    <button class="reset-button" data-section="system">Reset to Defaults</button>
                    <button class="export-button">Export Settings</button>
                    <button class="import-button">Import Settings</button>
                </div>
            </div>
        `;
    }

    renderPrivacySection() {
        return `
            <div class="settings-section">
                <h3>Privacy & Security</h3>
                <p>Control your privacy and security settings</p>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Analytics</h4>
                        <p>Help improve RetroOS by sharing usage data</p>
                    </div>
                    <div class="toggle-switch ${this.settings.privacy.analytics ? 'active' : ''}" data-setting="analytics" data-category="privacy"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Crash Reports</h4>
                        <p>Automatically send crash reports to help fix issues</p>
                    </div>
                    <div class="toggle-switch ${this.settings.privacy.crashReports ? 'active' : ''}" data-setting="crashReports" data-category="privacy"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Location Services</h4>
                        <p>Allow apps to access your location</p>
                    </div>
                    <div class="toggle-switch ${this.settings.privacy.locationServices ? 'active' : ''}" data-setting="locationServices" data-category="privacy"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Cookies</h4>
                        <p>Control how cookies are handled</p>
                    </div>
                    <select class="setting-select" data-setting="cookies" data-category="privacy">
                        <option value="all" ${this.settings.privacy.cookies === 'all' ? 'selected' : ''}>Allow All</option>
                        <option value="essential" ${this.settings.privacy.cookies === 'essential' ? 'selected' : ''}>Essential Only</option>
                        <option value="none" ${this.settings.privacy.cookies === 'none' ? 'selected' : ''}>Block All</option>
                    </select>
                </div>
                
                <div class="privacy-actions">
                    <h4>Data Management</h4>
                    <div class="action-buttons">
                        <button class="action-button">Clear Cache</button>
                        <button class="action-button">Clear Cookies</button>
                        <button class="action-button">Clear History</button>
                        <button class="action-button danger">Delete All Data</button>
                    </div>
                </div>
                
                <div class="setting-actions">
                    <button class="reset-button" data-section="privacy">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    renderAccessibilitySection() {
        return `
            <div class="settings-section">
                <h3>Accessibility</h3>
                <p>Make RetroOS more accessible for everyone</p>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>High Contrast</h4>
                        <p>Increase contrast for better visibility</p>
                    </div>
                    <div class="toggle-switch ${this.settings.accessibility.highContrast ? 'active' : ''}" data-setting="highContrast" data-category="accessibility"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Large Text</h4>
                        <p>Increase text size throughout the system</p>
                    </div>
                    <div class="toggle-switch ${this.settings.accessibility.largeText ? 'active' : ''}" data-setting="largeText" data-category="accessibility"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Reduce Motion</h4>
                        <p>Minimize animations and transitions</p>
                    </div>
                    <div class="toggle-switch ${this.settings.accessibility.reduceMotion ? 'active' : ''}" data-setting="reduceMotion" data-category="accessibility"></div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Screen Reader Support</h4>
                        <p>Enable enhanced screen reader compatibility</p>
                    </div>
                    <div class="toggle-switch ${this.settings.accessibility.screenReader ? 'active' : ''}" data-setting="screenReader" data-category="accessibility"></div>
                </div>
                
                <div class="accessibility-info">
                    <h4>Keyboard Shortcuts</h4>
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <span class="shortcut-keys">Alt + Tab</span>
                            <span class="shortcut-desc">Switch between windows</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">Ctrl + Alt + T</span>
                            <span class="shortcut-desc">Open terminal</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">F11</span>
                            <span class="shortcut-desc">Toggle fullscreen</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">Escape</span>
                            <span class="shortcut-desc">Close menus</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-actions">
                    <button class="reset-button" data-section="accessibility">Reset to Defaults</button>
                </div>
            </div>
        `;
    }

    renderAboutSection() {
        return `
            <div class="settings-section">
                <div class="about-header">
                    <div class="about-logo">
                        <i class="ri-computer-line"></i>
                    </div>
                    <h2>RetroOS</h2>
                    <p class="version">Version 2.0.0 Advanced Edition</p>
                </div>
                
                <div class="about-content">
                    <div class="about-section">
                        <h4>About RetroOS</h4>
                        <p>RetroOS is a complete operating system that runs entirely in your web browser. Built with modern web technologies, it provides a nostalgic yet powerful computing experience.</p>
                    </div>
                    
                    <div class="about-section">
                        <h4>Features</h4>
                        <ul>
                            <li>Complete desktop environment</li>
                            <li>Multiple built-in applications</li>
                            <li>Advanced window management</li>
                            <li>Customizable themes and wallpapers</li>
                            <li>File system simulation</li>
                            <li>Terminal with command support</li>
                            <li>Responsive design for all devices</li>
                        </ul>
                    </div>
                    
                    <div class="about-section">
                        <h4>System Information</h4>
                        <div class="system-specs">
                            <div class="spec-item">
                                <span>Browser:</span>
                                <span>${navigator.userAgent.split(' ')[0]}</span>
                            </div>
                            <div class="spec-item">
                                <span>Platform:</span>
                                <span>${navigator.platform}</span>
                            </div>
                            <div class="spec-item">
                                <span>Screen Resolution:</span>
                                <span>${screen.width} × ${screen.height}</span>
                            </div>
                            <div class="spec-item">
                                <span>Color Depth:</span>
                                <span>${screen.colorDepth}-bit</span>
                            </div>
                            <div class="spec-item">
                                <span>Language:</span>
                                <span>${navigator.language}</span>
                            </div>
                            <div class="spec-item">
                                <span>Online:</span>
                                <span>${navigator.onLine ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h4>Legal</h4>
                        <p>© 2024 RetroOS. All rights reserved. This software is provided as-is without any warranties.</p>
                    </div>
                </div>
                
                <div class="about-actions">
                    <button class="action-button">Check for Updates</button>
                    <button class="action-button">View License</button>
                    <button class="action-button">Report Issue</button>
                </div>
            </div>
        `;
    }

    renderWallpaperOptions() {
        const wallpapers = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        
        return wallpapers.map((wallpaper, index) => `
            <div class="wallpaper-option ${index === this.settings.appearance.wallpaper ? 'active' : ''}" 
                 data-wallpaper="${index}" 
                 style="background: ${wallpaper};">
                <div class="wallpaper-check">
                    <i class="ri-check-line"></i>
                </div>
            </div>
        `).join('');
    }

    toggleSetting(setting, category) {
        this.settings[category][setting] = !this.settings[category][setting];
        this.saveSettings();
        this.applySetting(setting, category, this.settings[category][setting]);
        
        // Update toggle visual state
        const toggle = document.querySelector(`#${this.windowId} [data-setting="${setting}"][data-category="${category}"]`);
        if (toggle) {
            toggle.classList.toggle('active', this.settings[category][setting]);
        }
    }

    updateSetting(setting, category, value) {
        this.settings[category][setting] = value;
        this.saveSettings();
        this.applySetting(setting, category, value);
    }

    applySetting(setting, category, value) {
        switch (`${category}.${setting}`) {
            case 'appearance.theme':
                this.applyTheme(value);
                break;
            case 'appearance.accentColor':
                this.applyAccentColor(value);
                break;
            case 'appearance.fontSize':
                this.applyFontSize(value);
                break;
            case 'appearance.animations':
                this.applyAnimations(value);
                break;
            case 'system.notifications':
                this.applyNotifications(value);
                break;
            case 'accessibility.highContrast':
                this.applyHighContrast(value);
                break;
            case 'accessibility.largeText':
                this.applyLargeText(value);
                break;
            case 'accessibility.reduceMotion':
                this.applyReduceMotion(value);
                break;
        }
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Setting Updated', `${setting} has been updated`, 'success');
        }
    }

    selectWallpaper(index) {
        this.settings.appearance.wallpaper = index;
        this.saveSettings();
        
        if (window.retroOS && window.retroOS.desktop) {
            window.retroOS.desktop.currentWallpaper = index;
            window.retroOS.desktop.changeWallpaper();
        }
    }

    selectTheme(theme) {
        this.settings.appearance.theme = theme;
        this.saveSettings();
        this.applyTheme(theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--primary-bg', 'linear-gradient(135deg, #1e293b 0%, #334155 100%)');
            document.documentElement.style.setProperty('--secondary-bg', '#1e293b');
            document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
            document.documentElement.style.setProperty('--border-color', '#334155');
        } else {
            document.documentElement.style.setProperty('--primary-bg', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            document.documentElement.style.setProperty('--secondary-bg', '#f8fafc');
            document.documentElement.style.setProperty('--text-primary', '#1e293b');
            document.documentElement.style.setProperty('--text-secondary', '#64748b');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        }
    }

    applyAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        
        // Calculate hover color (slightly darker)
        const hoverColor = this.adjustColor(color, -20);
        document.documentElement.style.setProperty('--accent-hover', hoverColor);
    }

    applyFontSize(size) {
        const sizes = {
            'small': '12px',
            'medium': '14px',
            'large': '16px',
            'extra-large': '18px'
        };
        
        document.documentElement.style.fontSize = sizes[size] || sizes.medium;
    }

    applyAnimations(enabled) {
        if (enabled) {
            document.documentElement.style.setProperty('--transition-fast', '0.15s ease-out');
            document.documentElement.style.setProperty('--transition-normal', '0.3s ease-out');
            document.documentElement.style.setProperty('--transition-slow', '0.5s ease-out');
        } else {
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
        }
    }

    applyNotifications(enabled) {
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.enabled = enabled;
        }
    }
    
    applySounds(enabled) {
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.soundEnabled = enabled;
        }
        
        // Apply to all sound-producing components
        document.documentElement.style.setProperty('--sounds-enabled', enabled ? '1' : '0');
    }
    
    applyAutoSave(enabled) {
        if (window.retroOS) {
            window.retroOS.autoSaveEnabled = enabled;
            
            if (enabled) {
                // Start auto-save interval
                window.retroOS.autoSaveInterval = setInterval(() => {
                    window.retroOS.saveSystemState();
                }, 30000); // Every 30 seconds
            } else {
                // Stop auto-save interval
                if (window.retroOS.autoSaveInterval) {
                    clearInterval(window.retroOS.autoSaveInterval);
                }
            }
        }
    }

    applyHighContrast(enabled) {
        document.documentElement.classList.toggle('high-contrast', enabled);
    }

    applyLargeText(enabled) {
        document.documentElement.classList.toggle('large-text', enabled);
    }

    applyReduceMotion(enabled) {
        document.documentElement.classList.toggle('reduce-motion', enabled);
    }

    adjustColor(color, amount) {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        
        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }

    resetSection(section) {
        if (confirm(`Reset all ${section} settings to defaults?`)) {
            const defaults = {
                appearance: {
                    theme: 'light',
                    wallpaper: 0,
                    accentColor: '#4f46e5',
                    fontSize: 'medium',
                    animations: true
                },
                system: {
                    notifications: true,
                    sounds: true,
                    autoSave: true,
                    language: 'en',
                    timezone: 'auto'
                },
                privacy: {
                    analytics: false,
                    crashReports: true,
                    locationServices: false,
                    cookies: 'essential'
                },
                accessibility: {
                    highContrast: false,
                    largeText: false,
                    reduceMotion: false,
                    screenReader: false
                }
            };
            
            this.settings[section] = { ...defaults[section] };
            this.saveSettings();
            this.switchSection(section); // Refresh the section
            
            // Apply all settings in the section
            Object.entries(this.settings[section]).forEach(([setting, value]) => {
                this.applySetting(setting, section, value);
            });
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Settings Reset', `${section} settings have been reset to defaults`, 'success');
            }
        }
    }

    loadSettings() {
        try {
            this.getFromStorage('settings').then(savedSettings => {
                if (savedSettings) {
                    this.settings = { ...this.settings, ...savedSettings };
                    
                    // Apply loaded settings
                    Object.entries(this.settings).forEach(([category, categorySettings]) => {
                        Object.entries(categorySettings).forEach(([setting, value]) => {
                            this.applySetting(setting, category, value);
                        });
                    });
                }
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            await this.saveToStorage('settings', this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    async getFromStorage(key) {
        if (window.retroOS && window.retroOS.storage) {
            return await window.retroOS.storage.load(key);
        }
        return null;
    }

    async saveToStorage(key, data) {
        if (window.retroOS && window.retroOS.storage) {
            return await window.retroOS.storage.save(key, data);
        }
        return false;
    }
    cleanup() {
        // Clean up any resources
        this.saveSettings();
    }
}

// Add settings-specific styles
const settingsStyles = document.createElement('style');
settingsStyles.textContent = `
    .theme-selector {
        display: flex;
        gap: var(--spacing-lg);
    }
    
    .theme-option {
        cursor: pointer;
        text-align: center;
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        border: 2px solid transparent;
        transition: all var(--transition-normal);
    }
    
    .theme-option.active {
        border-color: var(--accent-color);
    }
    
    .theme-preview {
        width: 80px;
        height: 60px;
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-sm);
        overflow: hidden;
        border: 1px solid var(--border-color);
    }
    
    .light-theme {
        background: white;
    }
    
    .light-theme .theme-header {
        height: 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .light-theme .theme-content {
        height: 40px;
        background: white;
    }
    
    .dark-theme {
        background: #1e293b;
    }
    
    .dark-theme .theme-header {
        height: 20px;
        background: #334155;
        border-bottom: 1px solid #475569;
    }
    
    .dark-theme .theme-content {
        height: 40px;
        background: #1e293b;
    }
    
    .accent-color-container {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .accent-color-picker {
        width: 50px;
        height: 40px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
    }
    
    .color-presets {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .color-preset {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
    }
    
    .color-preset:hover {
        transform: scale(1.1);
        box-shadow: var(--shadow-md);
    }
    
    .wallpaper-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-md);
    }
    
    .wallpaper-option {
        aspect-ratio: 16/9;
        border-radius: var(--radius-md);
        cursor: pointer;
        border: 3px solid transparent;
        transition: all var(--transition-normal);
        position: relative;
        overflow: hidden;
    }
    
    .wallpaper-option:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-lg);
    }
    
    .wallpaper-option.active {
        border-color: var(--accent-color);
    }
    
    .wallpaper-check {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        width: 24px;
        height: 24px;
        background: var(--accent-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        opacity: 0;
        transition: all var(--transition-fast);
    }
    
    .wallpaper-option.active .wallpaper-check {
        opacity: 1;
    }
    
    .setting-select {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: white;
        font-size: 0.875rem;
        min-width: 150px;
    }
    
    .setting-actions {
        margin-top: var(--spacing-xl);
        padding-top: var(--spacing-xl);
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: var(--spacing-md);
    }
    
    .reset-button {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
    }
    
    .reset-button:hover {
        background: #dc2626;
    }
    
    .export-button, .import-button {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-weight: 500;
    }
    
    .export-button:hover, .import-button:hover {
        background: var(--accent-hover);
    }
    
    .system-info, .privacy-actions, .accessibility-info {
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-top: var(--spacing-xl);
    }
    
    .info-grid, .shortcuts-grid, .system-specs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
        margin-top: var(--spacing-md);
    }
    
    .info-item, .shortcut-item, .spec-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }
    
    .info-item span:first-child,
    .shortcut-item span:first-child,
    .spec-item span:first-child {
        color: var(--text-secondary);
    }
    
    .shortcut-keys {
        background: var(--accent-color);
        color: white;
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .action-buttons {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        flex-wrap: wrap;
    }
    
    .action-button {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: 0.875rem;
    }
    
    .action-button:hover {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-hover);
    }
    
    .action-button.danger {
        border-color: #ef4444;
        color: #ef4444;
    }
    
    .action-button.danger:hover {
        background: #ef4444;
        color: white;
    }
    
    .about-header {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
    }
    
    .about-logo {
        font-size: 4rem;
        color: var(--accent-color);
        margin-bottom: var(--spacing-lg);
    }
    
    .about-header h2 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
        background: linear-gradient(45deg, var(--accent-color), #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .version {
        font-size: 1.1rem;
        color: var(--text-secondary);
    }
    
    .about-content {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .about-section {
        margin-bottom: var(--spacing-xl);
    }
    
    .about-section h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }
    
    .about-section p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--spacing-md);
    }
    
    .about-section ul {
        list-style: none;
        padding: 0;
    }
    
    .about-section li {
        padding: var(--spacing-xs) 0;
        color: var(--text-secondary);
        position: relative;
        padding-left: var(--spacing-lg);
    }
    
    .about-section li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--accent-color);
        font-weight: bold;
    }
    
    .about-actions {
        text-align: center;
        margin-top: var(--spacing-2xl);
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        flex-wrap: wrap;
    }
`;
document.head.appendChild(settingsStyles);