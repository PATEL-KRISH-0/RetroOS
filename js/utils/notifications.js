// Notification Manager - Handles system notifications
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
        this.enabled = true;
        this.sounds = {
            info: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
            error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
        };
        this.soundEnabled = true;
        this.position = 'top-right'; // top-right, top-left, bottom-right, bottom-left
    }

    show(title, message, type = 'info', duration = this.defaultDuration, actions = []) {
        if (!this.enabled) return null;

        const notification = {
            id: this.generateId(),
            title: title,
            message: message,
            type: type,
            duration: duration,
            actions: actions,
            timestamp: Date.now(),
            read: false
        };

        this.notifications.unshift(notification);
        this.displayNotification(notification);
        this.updateNotificationCenter();
        this.playSound(type);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }

        // Limit total notifications
        if (this.notifications.length > this.maxNotifications) {
            const removed = this.notifications.splice(this.maxNotifications);
            removed.forEach(n => this.removeFromDOM(n.id));
        }

        return notification.id;
    }

    displayNotification(notification) {
        const container = this.getNotificationContainer();
        const element = this.createNotificationElement(notification);
        
        container.appendChild(element);
        
        // Trigger entrance animation
        requestAnimationFrame(() => {
            element.classList.add('notification-enter');
        });

        // Add click handlers
        this.setupNotificationHandlers(element, notification);
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.id = `notification-${notification.id}`;
        
        const iconMap = {
            info: 'ri-information-line',
            success: 'ri-checkbox-circle-line',
            warning: 'ri-alert-line',
            error: 'ri-error-warning-line'
        };

        element.innerHTML = `
            <div class="notification-icon">
                <i class="${iconMap[notification.type] || iconMap.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                ${notification.actions.length > 0 ? `
                    <div class="notification-actions">
                        ${notification.actions.map(action => `
                            <button class="notification-action" data-action="${action.id}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <button class="notification-close">
                <i class="ri-close-line"></i>
            </button>
            ${notification.duration > 0 ? `
                <div class="notification-progress">
                    <div class="notification-progress-bar" style="animation-duration: ${notification.duration}ms;"></div>
                </div>
            ` : ''}
        `;

        return element;
    }

    setupNotificationHandlers(element, notification) {
        // Close button
        const closeButton = element.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.remove(notification.id);
        });

        // Action buttons
        element.querySelectorAll('.notification-action').forEach(button => {
            button.addEventListener('click', () => {
                const actionId = button.dataset.action;
                const action = notification.actions.find(a => a.id === actionId);
                
                if (action && action.callback) {
                    action.callback(notification);
                }
                
                // Auto-close after action unless specified otherwise
                if (!action || action.autoClose !== false) {
                    this.remove(notification.id);
                }
            });
        });

        // Click to mark as read
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action')) {
                this.markAsRead(notification.id);
            }
        });

        // Hover to pause auto-close
        if (notification.duration > 0) {
            const progressBar = element.querySelector('.notification-progress-bar');
            
            element.addEventListener('mouseenter', () => {
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            });
        }
    }

    remove(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Remove from array
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        
        // Remove from DOM with animation
        this.removeFromDOM(notificationId);
        
        // Update notification center
        this.updateNotificationCenter();
    }

    removeFromDOM(notificationId) {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
            element.classList.add('notification-exit');
            
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationCenter();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationCenter();
    }

    clear() {
        // Remove all notifications from DOM
        this.notifications.forEach(n => this.removeFromDOM(n.id));
        
        // Clear array
        this.notifications = [];
        
        // Update notification center
        this.updateNotificationCenter();
    }

    getNotificationContainer() {
        let container = document.getElementById('notifications');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications';
            document.body.appendChild(container);
        }
        
        // Update position class
        container.className = `notifications notifications-${this.position}`;
        
        return container;
    }

    updateNotificationCenter() {
        const center = document.getElementById('notificationCenter');
        if (!center) return;

        const list = center.querySelector('.notifications-list');
        if (!list) return;

        // Update notification count badge
        const badge = document.querySelector('.notification-badge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update notification list
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="no-notifications">
                    <i class="ri-notification-off-line"></i>
                    <p>No notifications</p>
                </div>
            `;
        } else {
            list.innerHTML = this.notifications.map(notification => `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-item-icon">
                        <i class="${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-item-content">
                        <div class="notification-item-title">${notification.title}</div>
                        <div class="notification-item-message">${notification.message}</div>
                        <div class="notification-item-time">${this.formatTime(notification.timestamp)}</div>
                    </div>
                    <button class="notification-item-close" data-id="${notification.id}">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
            `).join('');

            // Add event listeners
            list.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.markAsRead(item.dataset.id);
                });
            });

            list.querySelectorAll('.notification-item-close').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.remove(button.dataset.id);
                });
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'ri-information-line',
            success: 'ri-checkbox-circle-line',
            warning: 'ri-alert-line',
            error: 'ri-error-warning-line'
        };
        return icons[type] || icons.info;
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    playSound(type) {
        if (!this.soundEnabled || !this.sounds[type]) return;

        try {
            const audio = new Audio(this.sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
            });
        } catch (error) {
            // Ignore audio errors
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Preset notification types
    showSuccess(title, message, duration) {
        return this.show(title, message, 'success', duration);
    }

    showError(title, message, duration) {
        return this.show(title, message, 'error', duration);
    }

    showWarning(title, message, duration) {
        return this.show(title, message, 'warning', duration);
    }

    showInfo(title, message, duration) {
        return this.show(title, message, 'info', duration);
    }

    // Show notification with actions
    showWithActions(title, message, actions, type = 'info', duration = 0) {
        return this.show(title, message, type, duration, actions);
    }

    // Show persistent notification (no auto-close)
    showPersistent(title, message, type = 'info') {
        return this.show(title, message, type, 0);
    }

    // Configuration methods
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    setPosition(position) {
        this.position = position;
        
        // Update existing container
        const container = document.getElementById('notifications');
        if (container) {
            container.className = `notifications notifications-${position}`;
        }
    }

    setMaxNotifications(max) {
        this.maxNotifications = max;
        
        // Trim existing notifications if needed
        if (this.notifications.length > max) {
            const removed = this.notifications.splice(max);
            removed.forEach(n => this.removeFromDOM(n.id));
        }
    }

    // Get notification statistics
    getStats() {
        const total = this.notifications.length;
        const unread = this.notifications.filter(n => !n.read).length;
        const byType = {};
        
        this.notifications.forEach(n => {
            byType[n.type] = (byType[n.type] || 0) + 1;
        });
        
        return {
            total: total,
            unread: unread,
            read: total - unread,
            byType: byType
        };
    }

    // Export notifications for backup
    export() {
        return {
            notifications: this.notifications,
            settings: {
                enabled: this.enabled,
                soundEnabled: this.soundEnabled,
                position: this.position,
                maxNotifications: this.maxNotifications
            }
        };
    }

    // Import notifications from backup
    import(data) {
        if (data.notifications) {
            this.notifications = data.notifications;
            this.updateNotificationCenter();
        }
        
        if (data.settings) {
            this.enabled = data.settings.enabled ?? this.enabled;
            this.soundEnabled = data.settings.soundEnabled ?? this.soundEnabled;
            this.position = data.settings.position ?? this.position;
            this.maxNotifications = data.settings.maxNotifications ?? this.maxNotifications;
        }
    }
}

// Add notification-specific styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notifications {
        position: fixed;
        z-index: 4000;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        pointer-events: none;
    }
    
    .notifications-top-right {
        top: var(--spacing-xl);
        right: var(--spacing-xl);
    }
    
    .notifications-top-left {
        top: var(--spacing-xl);
        left: var(--spacing-xl);
    }
    
    .notifications-bottom-right {
        bottom: 80px;
        right: var(--spacing-xl);
    }
    
    .notifications-bottom-left {
        bottom: 80px;
        left: var(--spacing-xl);
    }
    
    .notification {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        max-width: 400px;
        min-width: 300px;
        box-shadow: var(--shadow-lg);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease-out;
    }
    
    .notification.notification-enter {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification.notification-exit {
        transform: translateX(100%);
        opacity: 0;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification {
        display: flex;
        gap: var(--spacing-md);
        align-items: flex-start;
    }
    
    .notification-icon {
        font-size: 1.25rem;
        margin-top: 2px;
    }
    
    .notification-info .notification-icon {
        color: #3b82f6;
    }
    
    .notification-success .notification-icon {
        color: #10b981;
    }
    
    .notification-warning .notification-icon {
        color: #f59e0b;
    }
    
    .notification-error .notification-icon {
        color: #ef4444;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-title {
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        font-size: 0.875rem;
    }
    
    .notification-message {
        font-size: 0.75rem;
        color: var(--text-secondary);
        line-height: 1.4;
        margin-bottom: var(--spacing-sm);
    }
    
    .notification-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .notification-action {
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .notification-action:hover {
        background: var(--accent-hover);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        margin-top: -4px;
    }
    
    .notification-close:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
    }
    
    .notification-progress-bar {
        height: 100%;
        background: var(--accent-color);
        width: 100%;
        transform-origin: left;
        animation: notificationProgress linear forwards;
    }
    
    @keyframes notificationProgress {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }
    
    .no-notifications {
        text-align: center;
        padding: var(--spacing-2xl);
        color: var(--text-secondary);
    }
    
    .no-notifications i {
        font-size: 3rem;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .notification-item.unread {
        background: rgba(79, 70, 229, 0.05);
        border-left: 3px solid var(--accent-color);
    }
    
    .notification-item-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        opacity: 0;
    }
    
    .notification-item:hover .notification-item-close {
        opacity: 1;
    }
    
    .notification-item-close:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    @media (max-width: 768px) {
        .notifications {
            left: var(--spacing-md) !important;
            right: var(--spacing-md) !important;
            top: var(--spacing-md) !important;
        }
        
        .notification {
            min-width: auto;
            max-width: none;
        }
    }
`;
document.head.appendChild(notificationStyles);