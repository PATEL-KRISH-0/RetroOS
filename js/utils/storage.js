// Storage Manager - Handles data persistence
class StorageManager {
    constructor() {
        this.prefix = 'retroos_';
        this.compressionEnabled = false; // Disable compression for better compatibility
        this.dbName = 'RetroOSDB';
        this.dbVersion = 2;
    }

    async save(key, data) {
        try {
            // Try IndexedDB first, fallback to localStorage
            try {
                await this.saveToIndexedDB(key, data);
                return true;
            } catch (idbError) {
                console.warn('IndexedDB failed, falling back to localStorage:', idbError);
                const serialized = JSON.stringify(data);
                const prefixedKey = this.prefix + key;
                localStorage.setItem(prefixedKey, serialized);
                return true;
            }
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    async load(key) {
        try {
            // Try IndexedDB first, fallback to localStorage
            try {
                const result = await this.loadFromIndexedDB(key);
                return result;
            } catch (idbError) {
                console.warn('IndexedDB failed, falling back to localStorage:', idbError);
                const prefixedKey = this.prefix + key;
                const stored = localStorage.getItem(prefixedKey);
                return stored ? JSON.parse(stored) : null;
            }
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }
    
    async saveToIndexedDB(key, data) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('storage')) {
                    db.createObjectStore('storage');
                }
                // Create all required object stores
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files');
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
            
            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(['storage'], 'readwrite');
                const store = transaction.objectStore('storage');
                const putRequest = store.put(data, this.prefix + key);
                
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async loadFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('storage')) {
                    db.createObjectStore('storage');
                }
                // Create all required object stores
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files');
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            };
            
            request.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction(['storage'], 'readonly');
                const store = transaction.objectStore('storage');
                const getRequest = store.get(this.prefix + key);
                
                getRequest.onsuccess = () => resolve(getRequest.result || null);
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    async remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.removeItem(prefixedKey);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    async clear() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    async getStorageInfo() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            let totalSize = 0;
            
            const items = keys.map(key => {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;
                
                return {
                    key: key.replace(this.prefix, ''),
                    size: size,
                    lastModified: new Date().toISOString() // Simulated
                };
            });
            
            return {
                items: items,
                totalSize: totalSize,
                itemCount: items.length,
                quota: this.getStorageQuota()
            };
        } catch (error) {
            console.error('Storage info error:', error);
            return null;
        }
    }

    getStorageQuota() {
        // Estimate localStorage quota (usually 5-10MB)
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                used: total,
                estimated: 5 * 1024 * 1024 // 5MB estimate
            };
        } catch {
            return { used: 0, estimated: 5 * 1024 * 1024 };
        }
    }

    // Simple compression using LZ-string-like algorithm
    compress(str) {
        if (!this.compressionEnabled) return str;
        
        try {
            // Simple run-length encoding for demo
            return str.replace(/(.)\1+/g, (match, char) => {
                return match.length > 3 ? `${char}${match.length}` : match;
            });
        } catch {
            return str;
        }
    }

    decompress(str) {
        if (!this.compressionEnabled) return str;
        
        try {
            // Reverse the simple run-length encoding
            return str.replace(/(.)\d+/g, (match, char) => {
                const count = parseInt(match.slice(1));
                return char.repeat(count);
            });
        } catch {
            return str;
        }
    }

    // Export data for backup
    async exportData() {
        try {
            const info = await this.getStorageInfo();
            const data = {};
            
            for (const item of info.items) {
                data[item.key] = await this.load(item.key);
            }
            
            return {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                data: data
            };
        } catch (error) {
            console.error('Export error:', error);
            return null;
        }
    }

    // Import data from backup
    async importData(exportedData) {
        try {
            if (!exportedData || !exportedData.data) {
                throw new Error('Invalid export data');
            }
            
            let imported = 0;
            let failed = 0;
            
            for (const [key, value] of Object.entries(exportedData.data)) {
                const success = await this.save(key, value);
                if (success) {
                    imported++;
                } else {
                    failed++;
                }
            }
            
            return {
                imported: imported,
                failed: failed,
                total: Object.keys(exportedData.data).length
            };
        } catch (error) {
            console.error('Import error:', error);
            return null;
        }
    }

    // Cleanup old data
    async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
        try {
            const info = await this.getStorageInfo();
            const now = Date.now();
            let cleaned = 0;
            
            for (const item of info.items) {
                const age = now - new Date(item.lastModified).getTime();
                if (age > maxAge) {
                    await this.remove(item.key);
                    cleaned++;
                }
            }
            
            return cleaned;
        } catch (error) {
            console.error('Cleanup error:', error);
            return 0;
        }
    }

    // Check if storage is available
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // Get storage usage percentage
    getUsagePercentage() {
        try {
            const quota = this.getStorageQuota();
            return Math.round((quota.used / quota.estimated) * 100);
        } catch {
            return 0;
        }
    }
}