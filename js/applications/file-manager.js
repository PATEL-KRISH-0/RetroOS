// File Manager Application
class FileManager {
    constructor() {
        this.currentPath = '/';
        this.fileSystem = this.createFileSystem();
        this.selectedFiles = new Set();
        this.viewMode = 'grid'; // grid or list
        this.sortBy = 'name'; // name, date, size, type
        this.sortOrder = 'asc';
        this.clipboard = { files: [], operation: null }; // For copy/cut/paste
        this.navigationHistory = ['/'];
        this.historyIndex = 0;
    }

    getWindowConfig() {
        return {
            title: 'File Manager',
            icon: 'ri-folder-line',
            width: 900,
            height: 650
        };
    }

    render() {
        return `
            <div class="file-manager-content">
                <div class="file-manager-header">
                    <div class="toolbar">
                        <button class="toolbar-button" data-action="back" title="Back">
                            <i class="ri-arrow-left-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="forward" title="Forward">
                            <i class="ri-arrow-right-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="up" title="Up">
                            <i class="ri-arrow-up-line"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-button" data-action="new-folder" title="New Folder">
                            <i class="ri-folder-add-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="new-file" title="New File">
                            <i class="ri-file-add-line"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-button" data-action="copy" title="Copy">
                            <i class="ri-file-copy-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="cut" title="Cut">
                            <i class="ri-scissors-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="paste" title="Paste">
                            <i class="ri-clipboard-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="delete" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-button" data-action="grid-view" title="Grid View">
                            <i class="ri-grid-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="list-view" title="List View">
                            <i class="ri-list-check"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <input type="file" id="fileUpload" style="display: none;" multiple>
                        <button class="toolbar-button" data-action="upload" title="Upload Files">
                            <i class="ri-upload-line"></i>
                            Upload
                        </button>
                    </div>
                    <div class="breadcrumb">
                        ${this.renderBreadcrumb()}
                    </div>
                </div>
                
                <div class="file-manager-body">
                    <div class="file-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-title">Quick Access</div>
                            <div class="sidebar-item ${this.currentPath === '/desktop' ? 'active' : ''}" data-path="/desktop">
                                <i class="ri-computer-line"></i>
                                <span>Desktop</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/documents' ? 'active' : ''}" data-path="/documents">
                                <i class="ri-folder-line"></i>
                                <span>Documents</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/downloads' ? 'active' : ''}" data-path="/downloads">
                                <i class="ri-download-line"></i>
                                <span>Downloads</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/pictures' ? 'active' : ''}" data-path="/pictures">
                                <i class="ri-image-line"></i>
                                <span>Pictures</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/music' ? 'active' : ''}" data-path="/music">
                                <i class="ri-music-line"></i>
                                <span>Music</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/videos' ? 'active' : ''}" data-path="/videos">
                                <i class="ri-video-line"></i>
                                <span>Videos</span>
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <div class="sidebar-title">Devices</div>
                            <div class="sidebar-item ${this.currentPath === '/c' ? 'active' : ''}" data-path="/c">
                                <i class="ri-hard-drive-line"></i>
                                <span>Local Disk (C:)</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/d' ? 'active' : ''}" data-path="/d">
                                <i class="ri-hard-drive-line"></i>
                                <span>Data (D:)</span>
                            </div>
                            <div class="sidebar-item ${this.currentPath === '/usb' ? 'active' : ''}" data-path="/usb">
                                <i class="ri-usb-line"></i>
                                <span>USB Drive</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-content-area">
                        <div class="file-grid" id="fileGrid">
                            <!-- Files will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.loadFileSystem();
        this.setupEventListeners();
        this.loadDirectory(this.currentPath);
    }

    async loadFileSystem() {
        try {
            const saved = await this.getFromStorage('file-system');
            if (saved) {
                this.fileSystem = saved;
            }
        } catch (error) {
            console.error('Failed to load file system:', error);
        }
    }

    async saveFileSystem() {
        try {
            await this.saveToStorage('file-system', this.fileSystem);
        } catch (error) {
            console.error('Failed to save file system:', error);
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

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Toolbar actions
        window.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleToolbarAction(button.dataset.action);
            });
        });

        // File upload
        const fileUpload = window.querySelector('#fileUpload');
        fileUpload.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // Sidebar navigation
        window.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateToPath(item.dataset.path);
            });
        });
        
        // File grid interactions
        const fileGrid = window.querySelector('#fileGrid');
        fileGrid.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                this.selectFile(fileItem, e.ctrlKey || e.metaKey);
            } else {
                this.clearSelection();
            }
        });
        
        fileGrid.addEventListener('dblclick', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                this.openFile(fileItem.dataset.name, fileItem.dataset.type);
            }
        });
        
        // Context menu
        fileGrid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showFileContextMenu(e.clientX, e.clientY);
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'c':
                        e.preventDefault();
                        this.copySelected();
                        break;
                    case 'x':
                        e.preventDefault();
                        this.cutSelected();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.pasteFiles();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAll();
                        break;
                }
            } else if (e.key === 'Delete') {
                this.deleteSelected();
            }
        });
    }

    createFileSystem() {
        return {
            '/': {
                type: 'folder',
                children: {
                    'desktop': { type: 'folder', children: {} },
                    'documents': { 
                        type: 'folder', 
                        children: {
                            'readme.txt': { 
                                type: 'file', 
                                size: 1024, 
                                modified: new Date('2024-01-10'),
                                content: 'Welcome to RetroOS!\n\nThis is a sample text file.\n\nYou can edit this content and save it.'
                            },
                            'report.docx': { type: 'file', size: 15360, modified: new Date('2024-01-12') },
                            'presentation.pptx': { type: 'file', size: 2048000, modified: new Date('2024-01-14') }
                        }
                    },
                    'downloads': { 
                        type: 'folder', 
                        children: {
                            'installer.exe': { type: 'file', size: 5242880, modified: new Date('2024-01-08') },
                            'archive.zip': { type: 'file', size: 1048576, modified: new Date('2024-01-11') }
                        }
                    },
                    'pictures': { 
                        type: 'folder', 
                        children: {
                            'vacation.jpg': { 
                                type: 'file', 
                                size: 2097152, 
                                modified: new Date('2024-01-05'),
                                content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4N0NFRkE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM5NkZGO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3NreSkiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiNGRkQ3MDAiLz48cG9seWdvbiBwb2ludHM9IjUwLDIwMCAxNTAsMTUwIDI1MCwyMDAgMzUwLDEyMCA0MDAsMjAwIDQwMCwzMDAgMCwzMDAiIGZpbGw9IiMyMkM1NUUiLz48dGV4dCB4PSIyMDAiIHk9IjI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmFjYXRpb24gUGhvdG88L3RleHQ+PC9zdmc+'
                            },
                            'screenshot.png': { 
                                type: 'file', 
                                size: 512000, 
                                modified: new Date('2024-01-13'),
                                content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFmMjkzYiIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSIyNjAiIGZpbGw9IiMzNzQxNTEiIHJ4PSI4Ii8+PHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjNGY0NmU1Ii8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjcmVlbnNob3Q8L3RleHQ+PC9zdmc+'
                            },
                            'wallpaper.jpg': { 
                                type: 'file', 
                                size: 3145728, 
                                modified: new Date('2024-01-01'),
                                content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImJnIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0YmEyO3N0b3Atb3BhY2l0eToxIiAvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2JnKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XYWxscGFwZXI8L3RleHQ+PC9zdmc+'
                            }
                        }
                    },
                    'music': { 
                        type: 'folder', 
                        children: {
                            'song1.mp3': { type: 'file', size: 4194304, modified: new Date('2024-01-03') },
                            'song2.mp3': { type: 'file', size: 3932160, modified: new Date('2024-01-07') }
                        }
                    },
                    'videos': { 
                        type: 'folder', 
                        children: {
                            'movie.mp4': { type: 'file', size: 104857600, modified: new Date('2024-01-02') }
                        }
                    },
                    'c': {
                        type: 'folder',
                        children: {
                            'Program Files': { type: 'folder', children: {} },
                            'Windows': { type: 'folder', children: {} },
                            'Users': { type: 'folder', children: {} },
                            'System32': { type: 'folder', children: {} }
                        }
                    },
                    'd': {
                        type: 'folder',
                        children: {
                            'Data': { type: 'folder', children: {} },
                            'Backup': { type: 'folder', children: {} }
                        }
                    },
                    'usb': {
                        type: 'folder',
                        children: {}
                    }
                }
            }
        };
    }

    renderBreadcrumb() {
        const parts = this.currentPath.split('/').filter(p => p);
        const breadcrumbItems = ['Computer'];
        
        if (parts.length > 0) {
            breadcrumbItems.push(...parts);
        }
        
        return breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return `
                <span class="breadcrumb-item ${isLast ? 'active' : ''}" data-index="${index}">
                    ${item}
                </span>
                ${!isLast ? '<i class="ri-arrow-right-s-line"></i>' : ''}
            `;
        }).join('');
    }

    loadDirectory(path) {
        const pathParts = path.split('/').filter(p => p);
        let currentDir = this.fileSystem['/'];
        
        for (const part of pathParts) {
            if (currentDir.children && currentDir.children[part]) {
                currentDir = currentDir.children[part];
            } else {
                currentDir = { type: 'folder', children: {} };
                break;
            }
        }
        
        this.renderFiles(currentDir.children || {});
        this.updateBreadcrumb();
        this.updateSidebarActive();
    }

    renderFiles(files) {
        const fileGrid = document.querySelector(`#${this.windowId} #fileGrid`);
        if (!fileGrid) return;
        
        const fileEntries = Object.entries(files).sort((a, b) => {
            const [nameA, dataA] = a;
            const [nameB, dataB] = b;
            
            // Folders first
            if (dataA.type === 'folder' && dataB.type !== 'folder') return -1;
            if (dataA.type !== 'folder' && dataB.type === 'folder') return 1;
            
            // Then sort by selected criteria
            switch (this.sortBy) {
                case 'name':
                    return this.sortOrder === 'asc' ? 
                        nameA.localeCompare(nameB) : 
                        nameB.localeCompare(nameA);
                case 'size':
                    const sizeA = dataA.size || 0;
                    const sizeB = dataB.size || 0;
                    return this.sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
                case 'date':
                    const dateA = dataA.modified || new Date(0);
                    const dateB = dataB.modified || new Date(0);
                    return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                default:
                    return 0;
            }
        });
        
        fileGrid.innerHTML = fileEntries.map(([name, data]) => {
            const iconClass = this.getFileIcon(name, data.type);
            const sizeText = data.type === 'folder' ? '' : this.formatFileSize(data.size || 0);
            
            return `
                <div class="file-item" data-name="${name}" data-type="${data.type}">
                    <div class="file-icon ${data.type}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="file-name">${name}</div>
                    ${sizeText ? `<div class="file-size">${sizeText}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Add entrance animations
        const items = fileGrid.querySelectorAll('.file-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
            item.classList.add('animate-in');
        });
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector(`#${this.windowId} .breadcrumb`);
        if (breadcrumb) {
            breadcrumb.innerHTML = this.renderBreadcrumb();
            
            // Add click handlers for breadcrumb navigation
            breadcrumb.querySelectorAll('.breadcrumb-item').forEach((item, index) => {
                if (index > 0) { // Skip "Computer"
                    item.addEventListener('click', () => {
                        const parts = this.currentPath.split('/').filter(p => p);
                        const targetPath = '/' + parts.slice(0, index).join('/');
                        this.navigateToPath(targetPath);
                    });
                }
            });
        }
    }

    updateSidebarActive() {
        const window = document.getElementById(this.windowId);
        window.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.path === this.currentPath);
        });
    }

    getFileIcon(name, type) {
        if (type === 'folder') return 'ri-folder-line';
        
        const extension = name.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'txt':
            case 'doc':
            case 'docx':
                return 'ri-file-text-line';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return 'ri-image-line';
            case 'mp3':
            case 'wav':
            case 'flac':
                return 'ri-music-line';
            case 'mp4':
            case 'avi':
            case 'mkv':
                return 'ri-video-line';
            case 'zip':
            case 'rar':
            case '7z':
                return 'ri-file-zip-line';
            case 'exe':
            case 'msi':
                return 'ri-file-code-line';
            case 'pdf':
                return 'ri-file-pdf-line';
            case 'ppt':
            case 'pptx':
                return 'ri-slideshow-line';
            case 'xls':
            case 'xlsx':
                return 'ri-file-excel-line';
            default:
                return 'ri-file-line';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    selectFile(fileItem, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        fileItem.classList.add('selected');
        this.selectedFiles.add(fileItem);
    }

    selectAll() {
        const fileItems = document.querySelectorAll(`#${this.windowId} .file-item`);
        fileItems.forEach(item => {
            item.classList.add('selected');
            this.selectedFiles.add(item);
        });
    }

    clearSelection() {
        this.selectedFiles.forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedFiles.clear();
    }

    openFile(fileName, fileType) {
        if (fileType === 'folder') {
            this.navigateToPath(`${this.currentPath}/${fileName}`.replace('//', '/'));
        } else {
            // Get file data
            const fileData = this.getFileData(fileName);
            const extension = fileName.split('.').pop().toLowerCase();
            let appName = null;
            
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
                // Open image viewer
                this.openImageViewer(fileName, fileData);
                return;
            } else if (['mp3', 'wav', 'flac', 'mp4', 'avi', 'mkv'].includes(extension)) {
                appName = 'media-player';
            } else if (['js', 'html', 'css', 'json', 'py', 'java', 'cpp'].includes(extension)) {
                appName = 'code-editor';
            } else if (['txt', 'md', 'log'].includes(extension)) {
                appName = 'text-editor';
            } else {
                // Ask user which app to use
                const choice = prompt(`How would you like to open "${fileName}"?\n\n1. Text Editor\n2. Code Editor\n3. Cancel\n\nEnter 1, 2, or 3:`);
                switch (choice) {
                    case '1':
                        appName = 'text-editor';
                        break;
                    case '2':
                        appName = 'code-editor';
                        break;
                    default:
                        return; // Cancel
                }
            }
            
            if (appName) {
                const event = new CustomEvent('launchApplication', {
                    detail: { appName: appName, file: { name: fileName, content: fileData?.content || '' } }
                });
                document.dispatchEvent(event);
            }
        }
    }

    openImageViewer(fileName, fileData) {
        // Create image viewer modal
        const modal = document.createElement('div');
        modal.className = 'image-viewer-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="image-viewer-content">
                <div class="image-viewer-header">
                    <h3>${fileName}</h3>
                    <button class="modal-close">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
                <div class="image-viewer-body">
                    <img src="${fileData?.content || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZmFmYyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+'}" alt="${fileName}">
                </div>
                <div class="image-viewer-footer">
                    <button class="viewer-button" onclick="window.retroOS.openApplication('image-editor')">
                        <i class="ri-edit-line"></i>
                        Edit
                    </button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    getFileData(fileName) {
        const pathParts = this.currentPath.split('/').filter(p => p);
        let currentDir = this.fileSystem['/'];
        
        for (const part of pathParts) {
            if (currentDir.children && currentDir.children[part]) {
                currentDir = currentDir.children[part];
            }
        }
        
        return currentDir.children?.[fileName];
    }

    navigateToPath(path) {
        this.currentPath = path;
        this.navigationHistory = this.navigationHistory.slice(0, this.historyIndex + 1);
        this.navigationHistory.push(path);
        this.historyIndex = this.navigationHistory.length - 1;
        this.loadDirectory(path);
    }

    handleToolbarAction(action) {
        switch (action) {
            case 'back':
                this.goBack();
                break;
            case 'forward':
                this.goForward();
                break;
            case 'up':
                this.goUp();
                break;
            case 'new-folder':
                this.createNewFolder();
                break;
            case 'new-file':
                this.createNewFile();
                break;
            case 'copy':
                this.copySelected();
                break;
            case 'cut':
                this.cutSelected();
                break;
            case 'paste':
                this.pasteFiles();
                break;
            case 'delete':
                this.deleteSelected();
                break;
            case 'grid-view':
                this.setViewMode('grid');
                break;
            case 'list-view':
                this.setViewMode('list');
                break;
            case 'upload':
                this.triggerFileUpload();
                break;
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.navigationHistory[this.historyIndex];
            this.loadDirectory(this.currentPath);
        }
    }

    goForward() {
        if (this.historyIndex < this.navigationHistory.length - 1) {
            this.historyIndex++;
            this.currentPath = this.navigationHistory[this.historyIndex];
            this.loadDirectory(this.currentPath);
        }
    }

    goUp() {
        const pathParts = this.currentPath.split('/').filter(p => p);
        if (pathParts.length > 0) {
            pathParts.pop();
            const parentPath = '/' + pathParts.join('/');
            this.navigateToPath(parentPath);
        }
    }

    triggerFileUpload() {
        const fileUpload = document.querySelector(`#${this.windowId} #fileUpload`);
        fileUpload.click();
    }

    async handleFileUpload(files) {
        for (const file of files) {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const fileData = {
                    type: 'file',
                    size: file.size,
                    modified: new Date(),
                    content: e.target.result
                };
                
                // Add to current directory
                await this.addFileToCurrentDirectory(file.name, fileData);
                this.loadDirectory(this.currentPath);
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('File Uploaded', `"${file.name}" uploaded successfully`, 'success');
                }
            };
            
            if (file.type.startsWith('image/') || file.type.startsWith('text/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }
    }

    async addFileToCurrentDirectory(fileName, fileData) {
        const pathParts = this.currentPath.split('/').filter(p => p);
        let currentDir = this.fileSystem['/'];
        
        for (const part of pathParts) {
            if (currentDir.children && currentDir.children[part]) {
                currentDir = currentDir.children[part];
            }
        }
        
        if (currentDir.children) {
            currentDir.children[fileName] = fileData;
            await this.saveFileSystem();
        }
    }

    async createNewFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const folderData = {
                type: 'folder',
                children: {},
                modified: new Date()
            };
            
            await this.addFileToCurrentDirectory(folderName, folderData);
            this.loadDirectory(this.currentPath);
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Folder Created', `"${folderName}" created successfully`, 'success');
            }
        }
    }

    async createNewFile() {
        const fileName = prompt('Enter file name:');
        if (fileName) {
            const fileData = {
                type: 'file',
                size: 0,
                modified: new Date(),
                content: ''
            };
            
            await this.addFileToCurrentDirectory(fileName, fileData);
            this.loadDirectory(this.currentPath);
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('File Created', `"${fileName}" created successfully`, 'success');
            }
        }
    }

    copySelected() {
        if (this.selectedFiles.size > 0) {
            this.clipboard.files = Array.from(this.selectedFiles).map(item => ({
                name: item.dataset.name,
                type: item.dataset.type,
                data: this.getFileData(item.dataset.name)
            }));
            this.clipboard.operation = 'copy';
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Copied', `${this.selectedFiles.size} item(s) copied to clipboard`, 'success');
            }
        }
    }

    cutSelected() {
        if (this.selectedFiles.size > 0) {
            this.clipboard.files = Array.from(this.selectedFiles).map(item => ({
                name: item.dataset.name,
                type: item.dataset.type,
                data: this.getFileData(item.dataset.name)
            }));
            this.clipboard.operation = 'cut';
            
            this.selectedFiles.forEach(item => {
                item.style.opacity = '0.5';
            });
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Cut', `${this.selectedFiles.size} item(s) cut to clipboard`, 'success');
            }
        }
    }

    async pasteFiles() {
        if (this.clipboard.files.length === 0) {
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Paste', 'Nothing to paste', 'warning');
            }
            return;
        }
        
        for (const file of this.clipboard.files) {
            const newName = this.clipboard.operation === 'cut' ? file.name : `Copy of ${file.name}`;
            await this.addFileToCurrentDirectory(newName, file.data);
        }
        
        if (this.clipboard.operation === 'cut') {
            // Remove original items for cut operation
            for (const file of this.clipboard.files) {
                await this.removeFileFromDirectory(file.name);
            }
            this.clipboard.files = [];
        }
        
        this.loadDirectory(this.currentPath);
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Paste', `${this.clipboard.files.length} item(s) pasted successfully`, 'success');
        }
    }

    async removeFileFromDirectory(fileName) {
        const pathParts = this.currentPath.split('/').filter(p => p);
        let currentDir = this.fileSystem['/'];
        
        for (const part of pathParts) {
            if (currentDir.children && currentDir.children[part]) {
                currentDir = currentDir.children[part];
            }
        }
        
        if (currentDir.children && currentDir.children[fileName]) {
            delete currentDir.children[fileName];
            await this.saveFileSystem();
        }
    }

    async deleteSelected() {
        if (this.selectedFiles.size > 0) {
            const confirmed = confirm(`Are you sure you want to delete ${this.selectedFiles.size} item(s)?`);
            if (confirmed) {
                for (const item of this.selectedFiles) {
                    await this.removeFileFromDirectory(item.dataset.name);
                }
                
                this.clearSelection();
                this.loadDirectory(this.currentPath);
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Deleted', `${this.selectedFiles.size} item(s) deleted`, 'success');
                }
            }
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const fileGrid = document.querySelector(`#${this.windowId} #fileGrid`);
        
        if (mode === 'list') {
            fileGrid.classList.add('list-view');
        } else {
            fileGrid.classList.remove('list-view');
        }
    }

    showFileContextMenu(x, y) {
        // Create context menu for files
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu file-context-menu';
        contextMenu.innerHTML = `
            <div class="context-item" data-action="open">
                <i class="ri-folder-open-line"></i>
                <span>Open</span>
            </div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="copy">
                <i class="ri-file-copy-line"></i>
                <span>Copy</span>
            </div>
            <div class="context-item" data-action="cut">
                <i class="ri-scissors-line"></i>
                <span>Cut</span>
            </div>
            <div class="context-item" data-action="paste">
                <i class="ri-clipboard-line"></i>
                <span>Paste</span>
            </div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="delete">
                <i class="ri-delete-bin-line"></i>
                <span>Delete</span>
            </div>
            <div class="context-item" data-action="rename">
                <i class="ri-edit-line"></i>
                <span>Rename</span>
            </div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="properties">
                <i class="ri-information-line"></i>
                <span>Properties</span>
            </div>
        `;
        
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.zIndex = '4000';
        
        document.body.appendChild(contextMenu);
        
        // Add click handlers
        contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleToolbarAction(item.dataset.action);
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

    cleanup() {
        this.clearSelection();
        this.saveFileSystem();
    }
}