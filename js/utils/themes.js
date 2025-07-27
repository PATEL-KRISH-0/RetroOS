// Theme Manager - Handles theme switching and customization
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = {
            default: {
                name: 'Default',
                colors: {
                    primary: '#4f46e5',
                    secondary: '#10b981',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    surface: '#ffffff',
                    text: '#1e293b',
                    textSecondary: '#64748b',
                    border: '#e2e8f0',
                    accent: '#4f46e5'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    primary: '#6366f1',
                    secondary: '#10b981',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    surface: '#1e293b',
                    text: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    border: '#334155',
                    accent: '#6366f1'
                }
            },
            ocean: {
                name: 'Ocean',
                colors: {
                    primary: '#0891b2',
                    secondary: '#06b6d4',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    surface: '#ffffff',
                    text: '#0f172a',
                    textSecondary: '#475569',
                    border: '#cbd5e1',
                    accent: '#0891b2'
                }
            },
            forest: {
                name: 'Forest',
                colors: {
                    primary: '#059669',
                    secondary: '#10b981',
                    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                    surface: '#ffffff',
                    text: '#064e3b',
                    textSecondary: '#6b7280',
                    border: '#d1d5db',
                    accent: '#059669'
                }
            },
            sunset: {
                name: 'Sunset',
                colors: {
                    primary: '#ea580c',
                    secondary: '#f59e0b',
                    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    surface: '#ffffff',
                    text: '#7c2d12',
                    textSecondary: '#a3a3a3',
                    border: '#e5e5e5',
                    accent: '#ea580c'
                }
            },
            purple: {
                name: 'Purple',
                colors: {
                    primary: '#7c3aed',
                    secondary: '#a855f7',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    surface: '#ffffff',
                    text: '#581c87',
                    textSecondary: '#6b7280',
                    border: '#e5e7eb',
                    accent: '#7c3aed'
                }
            },
            retro: {
                name: 'Retro',
                colors: {
                    primary: '#ec4899',
                    secondary: '#f472b6',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    surface: '#fdf2f8',
                    text: '#831843',
                    textSecondary: '#9ca3af',
                    border: '#f3e8ff',
                    accent: '#ec4899'
                }
            },
            minimal: {
                name: 'Minimal',
                colors: {
                    primary: '#374151',
                    secondary: '#6b7280',
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    surface: '#ffffff',
                    text: '#111827',
                    textSecondary: '#6b7280',
                    border: '#e5e7eb',
                    accent: '#374151'
                }
            }
        };
        
        this.customThemes = new Map();
    }

    init() {
        console.log('🎨 Initializing Theme Manager...');
        this.loadSavedTheme();
        this.setupThemeEventListeners();
    }

    setupThemeEventListeners() {
        // Listen for theme change events
        document.addEventListener('themeChange', (e) => {
            this.setTheme(e.detail.theme);
        });
        
        // Listen for custom theme creation
        document.addEventListener('createCustomTheme', (e) => {
            this.createCustomTheme(e.detail.name, e.detail.colors);
        });
    }

    setTheme(themeName) {
        const theme = this.themes[themeName] || this.customThemes.get(themeName);
        
        if (!theme) {
            console.warn(`Theme "${themeName}" not found`);
            return false;
        }
        
        this.currentTheme = themeName;
        this.applyTheme(theme);
        this.saveTheme(themeName);
        
        // Emit theme changed event
        const event = new CustomEvent('themeChanged', {
            detail: { theme: themeName, colors: theme.colors }
        });
        document.dispatchEvent(event);
        
        return true;
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(`--theme-${property}`, value);
        });
        
        // Update main color variables
        root.style.setProperty('--primary-bg', theme.colors.background);
        root.style.setProperty('--secondary-bg', theme.colors.surface);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--accent-hover', this.adjustColor(theme.colors.accent, -20));
        root.style.setProperty('--text-primary', theme.colors.text);
        root.style.setProperty('--text-secondary', theme.colors.textSecondary);
        root.style.setProperty('--border-color', theme.colors.border);
        
        // Update desktop background
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.background = theme.colors.background;
        }
        
        // Update taskbar
        this.updateTaskbarTheme(theme);
        
        // Update windows
        this.updateWindowsTheme(theme);
        
        // Add theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.currentTheme}`);
    }

    updateTaskbarTheme(theme) {
        const taskbar = document.getElementById('taskbar');
        if (taskbar) {
            // Taskbar uses glass effect, so we adjust opacity based on theme
            if (this.currentTheme === 'dark') {
                taskbar.style.background = 'rgba(30, 41, 59, 0.95)';
            } else {
                taskbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    }

    updateWindowsTheme(theme) {
        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            // Windows maintain their own styling but can be influenced by theme
            const header = window.querySelector('.window-header');
            if (header && window.classList.contains('active')) {
                header.style.background = `linear-gradient(135deg, ${theme.colors.accent} 0%, ${this.adjustColor(theme.colors.accent, -20)} 100%)`;
            }
        });
    }

    createCustomTheme(name, colors) {
        const customTheme = {
            name: name,
            colors: {
                primary: colors.primary || '#4f46e5',
                secondary: colors.secondary || '#10b981',
                background: colors.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                surface: colors.surface || '#ffffff',
                text: colors.text || '#1e293b',
                textSecondary: colors.textSecondary || '#64748b',
                border: colors.border || '#e2e8f0',
                accent: colors.accent || colors.primary || '#4f46e5'
            }
        };
        
        this.customThemes.set(name, customTheme);
        this.saveCustomThemes();
        
        return customTheme;
    }

    deleteCustomTheme(name) {
        if (this.customThemes.has(name)) {
            this.customThemes.delete(name);
            this.saveCustomThemes();
            
            // If current theme is being deleted, switch to default
            if (this.currentTheme === name) {
                this.setTheme('default');
            }
            
            return true;
        }
        return false;
    }

    getAllThemes() {
        const allThemes = { ...this.themes };
        
        this.customThemes.forEach((theme, name) => {
            allThemes[name] = theme;
        });
        
        return allThemes;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeColors(themeName = this.currentTheme) {
        const theme = this.themes[themeName] || this.customThemes.get(themeName);
        return theme ? theme.colors : null;
    }

    adjustColor(color, amount) {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;
        
        if (col.length === 3) {
            // Convert 3-digit hex to 6-digit
            const expanded = col.split('').map(c => c + c).join('');
            return this.adjustColor('#' + expanded, amount);
        }
        
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        
        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }

    generateColorPalette(baseColor) {
        const palette = {};
        const amounts = [-40, -20, 0, 20, 40];
        const names = ['darker', 'dark', 'base', 'light', 'lighter'];
        
        amounts.forEach((amount, index) => {
            palette[names[index]] = this.adjustColor(baseColor, amount);
        });
        
        return palette;
    }

    createThemeFromImage(imageData) {
        // Extract dominant colors from image (simplified)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        // Sample colors from different areas
        const colors = [];
        for (let i = 0; i < 5; i++) {
            const x = Math.floor((canvas.width / 5) * i);
            const y = Math.floor(canvas.height / 2);
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = '#' + [pixel[0], pixel[1], pixel[2]]
                .map(c => c.toString(16).padStart(2, '0'))
                .join('');
            colors.push(hex);
        }
        
        // Create theme from extracted colors
        return this.createCustomTheme('Generated', {
            primary: colors[0],
            secondary: colors[1],
            accent: colors[2],
            background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0'
        });
    }

    exportTheme(themeName = this.currentTheme) {
        const theme = this.themes[themeName] || this.customThemes.get(themeName);
        
        if (!theme) return null;
        
        return {
            name: theme.name,
            colors: { ...theme.colors },
            version: '2.0.0',
            created: new Date().toISOString()
        };
    }

    importTheme(themeData) {
        if (!themeData || !themeData.name || !themeData.colors) {
            throw new Error('Invalid theme data');
        }
        
        return this.createCustomTheme(themeData.name, themeData.colors);
    }

    async saveTheme(themeName) {
        try {
            if (window.retroOS && window.retroOS.storage) {
                await window.retroOS.storage.save('current-theme', themeName);
            } else {
                localStorage.setItem('retroos-current-theme', themeName);
            }
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    async loadSavedTheme() {
        try {
            await this.loadCustomThemes(); // Load custom themes first
            
            let savedTheme;
            
            if (window.retroOS && window.retroOS.storage) {
                savedTheme = await window.retroOS.storage.load('current-theme');
            } else {
                savedTheme = localStorage.getItem('retroos-current-theme');
            }
            
            if (savedTheme && (this.themes[savedTheme] || this.customThemes.has(savedTheme))) {
                this.setTheme(savedTheme);
            } else {
                this.setTheme('default');
            }
        } catch (error) {
            console.error('Failed to load saved theme:', error);
            this.setTheme('default');
        }
    }

    async saveCustomThemes() {
        try {
            const customThemesData = Array.from(this.customThemes.entries());
            
            if (window.retroOS && window.retroOS.storage) {
                await window.retroOS.storage.save('custom-themes', customThemesData);
            } else {
                localStorage.setItem('retroos-custom-themes', JSON.stringify(customThemesData));
            }
        } catch (error) {
            console.error('Failed to save custom themes:', error);
        }
    }

    async loadCustomThemes() {
        try {
            let customThemesData;
            
            if (window.retroOS && window.retroOS.storage) {
                customThemesData = await window.retroOS.storage.load('custom-themes');
            } else {
                const stored = localStorage.getItem('retroos-custom-themes');
                customThemesData = stored ? JSON.parse(stored) : null;
            }
            
            if (customThemesData && Array.isArray(customThemesData)) {
                this.customThemes = new Map(customThemesData);
            }
        } catch (error) {
            console.error('Failed to load custom themes:', error);
        }
    }

    // Auto theme based on time of day
    setAutoTheme() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 18) {
            // Daytime - use light theme
            this.setTheme('default');
        } else {
            // Nighttime - use dark theme
            this.setTheme('dark');
        }
    }

    // Theme based on system preference
    setSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('default');
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.setTheme(e.matches ? 'dark' : 'default');
            });
        }
    }

    // Get theme suggestions based on current theme
    getThemeSuggestions() {
        const suggestions = [];
        const currentColors = this.getThemeColors();
        
        if (!currentColors) return suggestions;
        
        // Suggest complementary themes
        Object.entries(this.themes).forEach(([name, theme]) => {
            if (name !== this.currentTheme) {
                const similarity = this.calculateColorSimilarity(currentColors, theme.colors);
                if (similarity > 0.3 && similarity < 0.8) {
                    suggestions.push({
                        name: name,
                        theme: theme,
                        similarity: similarity
                    });
                }
            }
        });
        
        return suggestions.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
    }

    calculateColorSimilarity(colors1, colors2) {
        // Simple color similarity calculation
        const keys = ['primary', 'secondary', 'accent'];
        let totalSimilarity = 0;
        
        keys.forEach(key => {
            if (colors1[key] && colors2[key]) {
                const sim = this.colorSimilarity(colors1[key], colors2[key]);
                totalSimilarity += sim;
            }
        });
        
        return totalSimilarity / keys.length;
    }

    colorSimilarity(color1, color2) {
        // Convert hex to RGB and calculate similarity
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        const rDiff = Math.abs(rgb1.r - rgb2.r);
        const gDiff = Math.abs(rgb1.g - rgb2.g);
        const bDiff = Math.abs(rgb1.b - rgb2.b);
        
        const maxDiff = 255 * 3;
        const totalDiff = rDiff + gDiff + bDiff;
        
        return 1 - (totalDiff / maxDiff);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}