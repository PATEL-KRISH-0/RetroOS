// Text Editor Application
class TextEditor {
    constructor() {
        this.content = '';
        this.fileName = 'Untitled.txt';
        this.isModified = false;
        this.fontSize = 14;
        this.fontFamily = 'Monaco, Menlo, Ubuntu Mono, monospace';
        this.wordWrap = true;
        this.lineNumbers = false;
        this.undoStack = [];
        this.redoStack = [];
        this.savedContent = ''; // Track saved content
    }

    getWindowConfig() {
        return {
            title: 'Text Editor',
            icon: 'ri-file-text-line',
            width: 700,
            height: 500
        };
    }

    render() {
        return `
            <div class="text-editor-content">
                <div class="text-editor-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-button" data-action="new" title="New">
                            <i class="ri-file-add-line"></i>
                            New
                        </button>
                        <button class="toolbar-button" data-action="open" title="Open">
                            <i class="ri-folder-open-line"></i>
                            Open
                        </button>
                        <button class="toolbar-button" data-action="save" title="Save">
                            <i class="ri-save-line"></i>
                            Save
                        </button>
                        <button class="toolbar-button" data-action="save-as" title="Save As">
                            <i class="ri-save-3-line"></i>
                            Save As
                        </button>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-button" data-action="undo" title="Undo">
                            <i class="ri-arrow-go-back-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="redo" title="Redo">
                            <i class="ri-arrow-go-forward-line"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="format-group">
                        <button class="format-button" data-action="bold" title="Bold">
                            <i class="ri-bold"></i>
                        </button>
                        <button class="format-button" data-action="italic" title="Italic">
                            <i class="ri-italic"></i>
                        </button>
                        <button class="format-button" data-action="underline" title="Underline">
                            <i class="ri-underline"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="toolbar-group">
                        <select class="font-size-select">
                            <option value="10">10px</option>
                            <option value="12">12px</option>
                            <option value="14" selected>14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                            <option value="20">20px</option>
                            <option value="24">24px</option>
                        </select>
                        
                        <button class="toolbar-button" data-action="word-wrap" title="Toggle Word Wrap">
                            <i class="ri-text-wrap"></i>
                        </button>
                        
                        <button class="toolbar-button" data-action="line-numbers" title="Toggle Line Numbers">
                            <i class="ri-hashtag"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="toolbar-group">
                        <button class="toolbar-button" data-action="find" title="Find">
                            <i class="ri-search-line"></i>
                            Find
                        </button>
                        <button class="toolbar-button" data-action="replace" title="Replace">
                            <i class="ri-find-replace-line"></i>
                            Replace
                        </button>
                    </div>
                </div>
                
                <div class="editor-container">
                    <div class="line-numbers" style="display: none;"></div>
                    <textarea class="text-editor-area" placeholder="Start typing your text here..."></textarea>
                </div>
                
                <div class="editor-status">
                    <div class="status-left">
                        <span class="file-status">${this.fileName}</span>
                        <span class="modified-indicator" style="display: none;">●</span>
                    </div>
                    <div class="status-right">
                        <span class="cursor-position">Line 1, Column 1</span>
                        <span class="word-count">0 words</span>
                        <span class="char-count">0 characters</span>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        
        // Check if opened with a file
        if (window.retroOS && window.retroOS.currentFileData) {
            this.loadFileContent(window.retroOS.currentFileData);
            window.retroOS.currentFileData = null; // Clear after use
        }
        
        this.setupEventListeners();
        this.updateTitle();
        
        // Focus on text area
        setTimeout(() => {
            const textArea = document.querySelector(`#${windowId} .text-editor-area`);
            if (textArea) textArea.focus();
        }, 100);
    }
    
    loadFileContent(file) {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        textArea.value = file.content || '';
        this.content = file.content || '';
        this.savedContent = file.content || '';
        this.fileName = file.name || 'Untitled.txt';
        this.isModified = false;
        
        this.updateTitle();
        this.hideModifiedIndicator();
        this.updateWordCount();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('File Opened', `"${this.fileName}" opened successfully`, 'success');
        }
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        const textArea = window.querySelector('.text-editor-area');
        
        // Toolbar actions
        window.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleToolbarAction(button.dataset.action);
            });
        });
        
        // Format buttons
        window.querySelectorAll('.format-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleFormatAction(button.dataset.action);
            });
        });
        
        // Font size change
        const fontSizeSelect = window.querySelector('.font-size-select');
        fontSizeSelect.addEventListener('change', () => {
            this.changeFontSize(parseInt(fontSizeSelect.value));
        });
        
        // Text area events
        textArea.addEventListener('input', () => {
            this.handleTextChange();
        });
        
        textArea.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        textArea.addEventListener('selectionchange', () => {
            this.updateCursorPosition();
        });
        
        // Update cursor position on click
        textArea.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.newFile();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.openFile();
                        break;
                    case 's':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.saveAsFile();
                        } else {
                            this.saveFile();
                        }
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'f':
                        e.preventDefault();
                        this.showFindDialog();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showReplaceDialog();
                        break;
                }
            }
        });
    }

    handleToolbarAction(action) {
        switch (action) {
            case 'new':
                this.newFile();
                break;
            case 'open':
                this.openFile();
                break;
            case 'save':
                this.saveFile();
                break;
            case 'save-as':
                this.saveAsFile();
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'word-wrap':
                this.toggleWordWrap();
                break;
            case 'line-numbers':
                this.toggleLineNumbers();
                break;
            case 'find':
                this.showFindDialog();
                break;
            case 'replace':
                this.showReplaceDialog();
                break;
        }
    }

    handleFormatAction(action) {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        
        if (start === end) return; // No selection
        
        const selectedText = textArea.value.substring(start, end);
        let formattedText = selectedText;
        
        switch (action) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
        }
        
        this.replaceSelection(formattedText);
    }

    replaceSelection(newText) {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        
        const before = textArea.value.substring(0, start);
        const after = textArea.value.substring(end);
        
        textArea.value = before + newText + after;
        textArea.selectionStart = start;
        textArea.selectionEnd = start + newText.length;
        
        this.handleTextChange();
    }

    handleTextChange() {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        this.content = textArea.value;
        this.isModified = true;
        
        this.updateWordCount();
        this.updateTitle();
        this.showModifiedIndicator();
        
        // Add to undo stack
        this.addToUndoStack();
    }

    handleKeyDown(e) {
        // Tab key handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const textArea = e.target;
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            
            // Insert tab character
            textArea.value = textArea.value.substring(0, start) + '\t' + textArea.value.substring(end);
            textArea.selectionStart = textArea.selectionEnd = start + 1;
            
            this.handleTextChange();
        }
    }

    newFile() {
        if (this.isModified) {
            const save = confirm('Do you want to save changes to the current file?');
            if (save) {
                this.saveFile();
            }
        }
        
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        textArea.value = '';
        this.content = '';
        this.fileName = 'Untitled.txt';
        this.isModified = false;
        this.undoStack = [];
        this.redoStack = [];
        
        this.updateTitle();
        this.hideModifiedIndicator();
        this.updateWordCount();
    }

    openFile() {
        // Simulate file opening
        try {
            this.getFromStorage('text-files').then(savedFiles => {
                const files = savedFiles || {};
                const fileNames = Object.keys(files);
            
                if (fileNames.length === 0) {
                    // Default files if none saved
                    const defaultFiles = [
                        { name: 'readme.txt', content: 'Welcome to RetroOS!\n\nThis is a sample text file.\n\nYou can edit this content and save it.' },
                        { name: 'notes.txt', content: 'Meeting Notes\n============\n\n- Discuss project timeline\n- Review budget\n- Plan next steps' },
                        { name: 'todo.txt', content: 'TODO List\n=========\n\n☐ Complete project documentation\n☐ Test all features\n☐ Deploy to production\n☑ Create user manual' }
                    ];
                    const selectedFile = defaultFiles[Math.floor(Math.random() * defaultFiles.length)];
                    this.loadFileContent(selectedFile);
                } else {
                    // Show file selection dialog
                    const fileList = fileNames.map((name, index) => `${index + 1}. ${name}`).join('\n');
                    const choice = prompt(`Select a file to open:\n\n${fileList}\n\nEnter the number:`);
                    const fileIndex = parseInt(choice) - 1;
                
                    if (fileIndex >= 0 && fileIndex < fileNames.length) {
                        const fileName = fileNames[fileIndex];
                        const fileData = files[fileName];
                        this.loadFileContent({ name: fileName, content: fileData.content });
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load files:', error);
            // Fallback to default files
            const files = [
                { name: 'readme.txt', content: 'Welcome to RetroOS!\n\nThis is a sample text file.\n\nYou can edit this content and save it.' }
            ];
            this.loadFileContent(files[0]);
        }
    }
    
    async getFromStorage(key) {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('RetroOSDB', 1);
                
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('files')) {
                        db.createObjectStore('files');
                    }
                };
                
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    const transaction = db.transaction(['files'], 'readonly');
                    const store = transaction.objectStore('files');
                    const getRequest = store.get(key);
                    
                    getRequest.onsuccess = () => {
                        resolve(getRequest.result);
                    };
                    
                    getRequest.onerror = () => {
                        resolve(null);
                    };
                };
                
                request.onerror = () => {
                    resolve(null);
                };
            } catch (error) {
                resolve(null);
            }
        });
    }

    async saveToStorage(key, data) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('RetroOSDB', 1);
                
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('files')) {
                        db.createObjectStore('files');
                    }
                };
                
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    const transaction = db.transaction(['files'], 'readwrite');
                    const store = transaction.objectStore('files');
                    const putRequest = store.put(data, key);
                    
                    putRequest.onsuccess = () => {
                        resolve();
                    };
                    
                    putRequest.onerror = () => {
                        reject(putRequest.error);
                    };
                };
                
                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    async saveFile() {
        // Simulate file saving
        this.savedContent = this.content;
        this.isModified = false;
        this.hideModifiedIndicator();
        this.updateTitle();
        
        // Actually save to localStorage for persistence
        try {
            const savedFiles = await this.getFromStorage('text-files') || {};
            savedFiles[this.fileName] = {
                content: this.content,
                modified: new Date().toISOString()
            };
            await this.saveToStorage('text-files', savedFiles);
        } catch (error) {
            console.error('Failed to save file:', error);
        }
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('File Saved', `"${this.fileName}" saved successfully`, 'success');
        }
    }

    saveAsFile() {
        const newFileName = prompt('Enter file name:', this.fileName);
        if (newFileName) {
            this.fileName = newFileName;
            this.saveFile();
        }
    }

    undo() {
        if (this.undoStack.length > 0) {
            const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
            this.redoStack.push(textArea.value);
            textArea.value = this.undoStack.pop();
            this.content = textArea.value;
            this.updateWordCount();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
            this.undoStack.push(textArea.value);
            textArea.value = this.redoStack.pop();
            this.content = textArea.value;
            this.updateWordCount();
        }
    }

    addToUndoStack() {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        
        // Limit undo stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        
        // Don't add if it's the same as the last entry
        if (this.undoStack.length === 0 || this.undoStack[this.undoStack.length - 1] !== textArea.value) {
            this.undoStack.push(textArea.value);
        }
        
        // Clear redo stack when new changes are made
        this.redoStack = [];
    }

    changeFontSize(size) {
        this.fontSize = size;
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        textArea.style.fontSize = `${size}px`;
    }

    toggleWordWrap() {
        this.wordWrap = !this.wordWrap;
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        textArea.style.whiteSpace = this.wordWrap ? 'pre-wrap' : 'pre';
        
        const button = document.querySelector(`#${this.windowId} [data-action="word-wrap"]`);
        button.classList.toggle('active', this.wordWrap);
    }

    toggleLineNumbers() {
        this.lineNumbers = !this.lineNumbers;
        const lineNumbersDiv = document.querySelector(`#${this.windowId} .line-numbers`);
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        
        if (this.lineNumbers) {
            lineNumbersDiv.style.display = 'block';
            textArea.style.paddingLeft = '50px';
            this.updateLineNumbers();
        } else {
            lineNumbersDiv.style.display = 'none';
            textArea.style.paddingLeft = 'var(--spacing-lg)';
        }
        
        const button = document.querySelector(`#${this.windowId} [data-action="line-numbers"]`);
        button.classList.toggle('active', this.lineNumbers);
    }

    updateLineNumbers() {
        if (!this.lineNumbers) return;
        
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        const lineNumbersDiv = document.querySelector(`#${this.windowId} .line-numbers`);
        
        const lines = textArea.value.split('\n').length;
        const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
        
        lineNumbersDiv.textContent = lineNumbers;
    }

    updateCursorPosition() {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        const cursorPos = textArea.selectionStart;
        const textBeforeCursor = textArea.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        const positionSpan = document.querySelector(`#${this.windowId} .cursor-position`);
        if (positionSpan) {
            positionSpan.textContent = `Line ${currentLine}, Column ${currentColumn}`;
        }
    }

    updateWordCount() {
        const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
        const text = textArea.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;
        
        const wordCountSpan = document.querySelector(`#${this.windowId} .word-count`);
        const charCountSpan = document.querySelector(`#${this.windowId} .char-count`);
        
        if (wordCountSpan) wordCountSpan.textContent = `${words} words`;
        if (charCountSpan) charCountSpan.textContent = `${characters} characters`;
        
        if (this.lineNumbers) {
            this.updateLineNumbers();
        }
    }

    updateTitle() {
        const windowHeader = document.querySelector(`#${this.windowId} .window-title`);
        if (windowHeader) {
            const title = `${this.fileName}${this.isModified ? ' *' : ''} - Text Editor`;
            windowHeader.innerHTML = `<i class="ri-file-text-line"></i>${title}`;
        }
    }

    showModifiedIndicator() {
        const indicator = document.querySelector(`#${this.windowId} .modified-indicator`);
        if (indicator) {
            indicator.style.display = 'inline';
        }
    }

    hideModifiedIndicator() {
        const indicator = document.querySelector(`#${this.windowId} .modified-indicator`);
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showFindDialog() {
        const searchTerm = prompt('Find:');
        if (searchTerm) {
            const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
            const content = textArea.value;
            const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
            
            if (index !== -1) {
                textArea.focus();
                textArea.setSelectionRange(index, index + searchTerm.length);
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Found', `"${searchTerm}" found`, 'success');
                }
            } else {
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Not Found', `"${searchTerm}" not found`, 'warning');
                }
            }
        }
    }

    showReplaceDialog() {
        const searchTerm = prompt('Find:');
        if (searchTerm) {
            const replaceTerm = prompt('Replace with:');
            if (replaceTerm !== null) {
                const textArea = document.querySelector(`#${this.windowId} .text-editor-area`);
                const newContent = textArea.value.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
                textArea.value = newContent;
                this.handleTextChange();
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Replaced', `"${searchTerm}" replaced with "${replaceTerm}"`, 'success');
                }
            }
        }
    }

    cleanup() {
        // Clean up any resources
        this.undoStack = [];
        this.redoStack = [];
    }
}