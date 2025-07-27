// Window Manager - Handles all window operations
class WindowManager {
    constructor() {
        this.windows = new Map();
        this.zIndexCounter = 100;
        this.activeWindow = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragData = null;
        this.resizeData = null;
        this.windowContainer = null;
    }

    init() {
        console.log('🪟 Initializing Window Manager...');
        this.windowContainer = document.getElementById('windowsContainer');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events for mobile
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Listen for taskbar context actions
        document.addEventListener('taskbarContextAction', (e) => {
            this.handleTaskbarContextAction(e.detail.action, e.detail.windowId);
        });
        
        // Listen for taskbar button clicks
        document.addEventListener('taskbarButtonClick', (e) => {
            this.handleTaskbarButtonClick(e.detail.windowId);
        });
    }
    
    handleTaskbarContextAction(action, windowId) {
        switch (action) {
            case 'restore':
                this.restoreWindow(windowId);
                break;
            case 'minimize':
                this.minimizeWindow(windowId);
                break;
            case 'maximize':
                this.toggleMaximizeWindow(windowId);
                break;
            case 'close':
                this.closeWindow(windowId);
                break;
        }
    }
    
    handleTaskbarButtonClick(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        if (windowData.isMinimized) {
            this.restoreWindow(windowId);
        } else if (this.activeWindow === windowId) {
            this.minimizeWindow(windowId);
        } else {
            this.focusWindow(windowId);
        }
    }

    createWindow(config) {
        const windowId = `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const windowElement = document.createElement('div');
        windowElement.className = 'window window-enter';
        windowElement.id = windowId;
        
        // Set initial position and size
        const initialX = 100 + (this.windows.size * 30);
        const initialY = 50 + (this.windows.size * 30);
        
        windowElement.style.left = `${initialX}px`;
        windowElement.style.top = `${initialY}px`;
        windowElement.style.width = `${config.width || 600}px`;
        windowElement.style.height = `${config.height || 400}px`;
        windowElement.style.zIndex = ++this.zIndexCounter;

        windowElement.innerHTML = `
            <div class="window-header" data-window-id="${windowId}">
                <div class="window-title">
                    <i class="${config.icon || 'ri-window-line'}"></i>
                    ${config.title || 'Untitled'}
                </div>
                <div class="window-controls">
                    <button class="window-control minimize" data-action="minimize" title="Minimize">
                        <i class="ri-subtract-line"></i>
                    </button>
                    <button class="window-control maximize" data-action="maximize" title="Maximize">
                        <i class="ri-checkbox-blank-line"></i>
                    </button>
                    <button class="window-control close" data-action="close" title="Close">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
            </div>
            <div class="window-content">${config.content || ''}</div>
            <div class="resize-handle n"></div>
            <div class="resize-handle s"></div>
            <div class="resize-handle e"></div>
            <div class="resize-handle w"></div>
            <div class="resize-handle ne"></div>
            <div class="resize-handle nw"></div>
            <div class="resize-handle se"></div>
            <div class="resize-handle sw"></div>
        `;

        // Add window control event listeners
        const controls = windowElement.querySelectorAll('.window-control');
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleWindowControl(windowId, control.dataset.action);
            });
        });

        this.windowContainer.appendChild(windowElement);
        
        // Store window data
        const windowData = {
            id: windowId,
            element: windowElement,
            title: config.title || 'Untitled',
            icon: config.icon || 'ri-window-line',
            appName: config.appName,
            isMinimized: false,
            isMaximized: false,
            normalState: {
                left: initialX,
                top: initialY,
                width: config.width || 600,
                height: config.height || 400
            }
        };
        
        this.windows.set(windowId, windowData);
        this.focusWindow(windowId);
        
        // Remove entrance animation class after animation completes
        setTimeout(() => {
            windowElement.classList.remove('window-enter');
        }, 300);
        
        return windowId;
    }

    handleWindowControl(windowId, action) {
        switch (action) {
            case 'minimize':
                this.minimizeWindow(windowId);
                break;
            case 'maximize':
                this.toggleMaximizeWindow(windowId);
                break;
            case 'close':
                this.closeWindow(windowId);
                break;
        }
    }

    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || windowData.isMinimized) return;

        windowData.element.classList.add('minimized');
        windowData.isMinimized = true;
        
        // Focus next available window
        this.focusNextWindow();
        
        // Update taskbar
        this.emitWindowEvent('windowMinimized', windowData);
    }

    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || !windowData.isMinimized) return;

        windowData.element.classList.remove('minimized');
        windowData.isMinimized = false;
        this.focusWindow(windowId);
        
        this.emitWindowEvent('windowRestored', windowData);
    }

    toggleMaximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (windowData.isMaximized) {
            // Restore
            windowData.element.classList.remove('maximized');
            const normal = windowData.normalState;
            windowData.element.style.left = `${normal.left}px`;
            windowData.element.style.top = `${normal.top}px`;
            windowData.element.style.width = `${normal.width}px`;
            windowData.element.style.height = `${normal.height}px`;
            windowData.isMaximized = false;
            
            // Update maximize button icon
            const maximizeBtn = windowData.element.querySelector('.maximize i');
            if (maximizeBtn) maximizeBtn.className = 'ri-checkbox-blank-line';
            
            this.emitWindowEvent('windowRestored', windowData);
        } else {
            // Maximize
            windowData.normalState = {
                left: parseInt(windowData.element.style.left),
                top: parseInt(windowData.element.style.top),
                width: parseInt(windowData.element.style.width),
                height: parseInt(windowData.element.style.height)
            };
            
            windowData.element.classList.add('maximized');
            windowData.isMaximized = true;
            
            // Update maximize button icon
            const maximizeBtn = windowData.element.querySelector('.maximize i');
            if (maximizeBtn) maximizeBtn.className = 'ri-checkbox-multiple-blank-line';
            
            this.emitWindowEvent('windowMaximized', windowData);
        }
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        // Add exit animation
        windowData.element.classList.add('window-exit');
        
        setTimeout(() => {
            windowData.element.remove();
            this.windows.delete(windowId);
            
            // Focus next available window
            if (this.activeWindow === windowId) {
                this.focusNextWindow();
            }
            
            this.emitWindowEvent('windowClosed', windowData);
        }, 200);
    }

    focusWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData || windowData.isMinimized) return;

        // Remove active state from all windows
        this.windows.forEach((data) => {
            data.element.classList.remove('active');
        });

        // Set new active window
        windowData.element.style.zIndex = ++this.zIndexCounter;
        windowData.element.classList.add('active');
        this.activeWindow = windowId;
        
        this.emitWindowEvent('windowFocused', windowData);
    }

    focusNextWindow() {
        const visibleWindows = Array.from(this.windows.values())
            .filter(w => !w.isMinimized)
            .sort((a, b) => parseInt(b.element.style.zIndex) - parseInt(a.element.style.zIndex));
        
        if (visibleWindows.length > 0) {
            this.focusWindow(visibleWindows[0].id);
        } else {
            this.activeWindow = null;
        }
    }

    cycleWindows() {
        const visibleWindows = Array.from(this.windows.values())
            .filter(w => !w.isMinimized);
        
        if (visibleWindows.length <= 1) return;
        
        const currentIndex = visibleWindows.findIndex(w => w.id === this.activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        
        this.focusWindow(visibleWindows[nextIndex].id);
    }

    handleMouseDown(e) {
        const windowHeader = e.target.closest('.window-header');
        const resizeHandle = e.target.closest('.resize-handle');
        const window = e.target.closest('.window');
        
        if (windowHeader && !e.target.closest('.window-control')) {
            const windowId = windowHeader.dataset.windowId;
            const windowData = this.windows.get(windowId);
            
            if (windowData && !windowData.isMaximized) {
                // Check for Ctrl key for constrained dragging
                const isCtrlPressed = e.ctrlKey || e.metaKey;
                
                this.isDragging = true;
                this.focusWindow(windowId);
                
                const rect = windowData.element.getBoundingClientRect();
                this.dragData = {
                    windowId: windowId,
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top,
                    constrainToViewport: isCtrlPressed
                };
                
                windowData.element.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
            }
        } else if (resizeHandle && window) {
            const windowId = window.id;
            const windowData = this.windows.get(windowId);
            
            if (windowData && !windowData.isMaximized) {
                this.isResizing = true;
                this.focusWindow(windowId);
                
                const rect = window.getBoundingClientRect();
                this.resizeData = {
                    windowId: windowId,
                    startX: e.clientX,
                    startY: e.clientY,
                    startWidth: rect.width,
                    startHeight: rect.height,
                    startLeft: rect.left,
                    startTop: rect.top,
                    handle: resizeHandle.classList[1]
                };
                
                document.body.style.userSelect = 'none';
            }
        } else if (window) {
            this.focusWindow(window.id);
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.dragData) {
            const windowData = this.windows.get(this.dragData.windowId);
            if (windowData) {
                let x = e.clientX - this.dragData.offsetX;
                let y = e.clientY - this.dragData.offsetY;
                
                // Constrain to viewport if Ctrl is pressed or window would go off-screen
                if (this.dragData.constrainToViewport || x < -200 || y < 0) {
                    const windowRect = windowData.element.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight - 60; // Account for taskbar
                    
                    x = Math.max(-200, Math.min(viewportWidth - 100, x));
                    y = Math.max(0, Math.min(viewportHeight - 50, y));
                }
                
                windowData.element.style.left = `${x}px`;
                windowData.element.style.top = `${y}px`;
            }
        } else if (this.isResizing && this.resizeData) {
            this.handleResize(e);
        }
    }

    handleResize(e) {
        const { windowId, startX, startY, startWidth, startHeight, startLeft, startTop, handle } = this.resizeData;
        const windowData = this.windows.get(windowId);
        
        if (!windowData) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        // Calculate new dimensions based on resize handle
        if (handle.includes('e')) {
            newWidth = Math.max(300, startWidth + deltaX);
        }
        if (handle.includes('w')) {
            newWidth = Math.max(300, startWidth - deltaX);
            newLeft = startLeft + (startWidth - newWidth);
        }
        if (handle.includes('s')) {
            newHeight = Math.max(200, startHeight + deltaY);
        }
        if (handle.includes('n')) {
            newHeight = Math.max(200, startHeight - deltaY);
            newTop = Math.max(0, startTop + (startHeight - newHeight));
        }
        
        // Apply new dimensions
        windowData.element.style.width = `${newWidth}px`;
        windowData.element.style.height = `${newHeight}px`;
        windowData.element.style.left = `${newLeft}px`;
        windowData.element.style.top = `${newTop}px`;
    }

    handleMouseUp() {
        if (this.isDragging && this.dragData) {
            const windowData = this.windows.get(this.dragData.windowId);
            if (windowData) {
                windowData.element.style.cursor = '';
            }
        }
        
        this.isDragging = false;
        this.isResizing = false;
        this.dragData = null;
        this.resizeData = null;
        document.body.style.userSelect = '';
    }

    // Touch event handlers for mobile support
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            e.target.dispatchEvent(mouseEvent);
        }
    }

    handleTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true
            });
            document.dispatchEvent(mouseEvent);
        }
    }

    handleTouchEnd(e) {
        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true
        });
        document.dispatchEvent(mouseEvent);
    }

    getWindow(windowId) {
        return this.windows.get(windowId);
    }

    findWindowByApp(appName) {
        return Array.from(this.windows.values()).find(w => w.appName === appName);
    }

    getAllWindows() {
        return Array.from(this.windows.values());
    }

    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.closeWindow(id));
    }

    getState() {
        return Array.from(this.windows.entries()).map(([id, data]) => ({
            id: id,
            appName: data.appName,
            title: data.title,
            icon: data.icon,
            position: {
                left: parseInt(data.element.style.left),
                top: parseInt(data.element.style.top)
            },
            size: {
                width: parseInt(data.element.style.width),
                height: parseInt(data.element.style.height)
            },
            isMinimized: data.isMinimized,
            isMaximized: data.isMaximized
        }));
    }

    emitWindowEvent(eventType, windowData) {
        const event = new CustomEvent('windowEvent', {
            detail: { type: eventType, window: windowData }
        });
        document.dispatchEvent(event);
    }
}