// Code Editor Application
class CodeEditor {
    constructor() {
        this.files = new Map();
        this.activeFile = null;
        this.language = 'javascript';
        this.theme = 'dark';
        this.fontSize = 14;
        this.tabSize = 2;
        this.wordWrap = false;
        this.lineNumbers = true;
        this.autoComplete = true;
        this.minimap = false;
    }

    getWindowConfig() {
        return {
            title: 'Code Editor',
            icon: 'ri-code-line',
            width: 900,
            height: 700
        };
    }

    render() {
        return `
            <div class="code-editor-content">
                <div class="code-editor-toolbar">
                    <div class="toolbar-section">
                        <button class="toolbar-button" data-action="new" title="New File">
                            <i class="ri-file-add-line"></i>
                            New
                        </button>
                        <button class="toolbar-button" data-action="open" title="Open File">
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
                    
                    <div class="toolbar-section">
                        <button class="toolbar-button" data-action="undo" title="Undo">
                            <i class="ri-arrow-go-back-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="redo" title="Redo">
                            <i class="ri-arrow-go-forward-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="find" title="Find">
                            <i class="ri-search-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="replace" title="Replace">
                            <i class="ri-find-replace-line"></i>
                        </button>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="toolbar-section">
                        <select class="language-select" title="Language">
                            <option value="javascript">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="json">JSON</option>
                            <option value="markdown">Markdown</option>
                        </select>
                        
                        <select class="theme-select" title="Theme">
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="monokai">Monokai</option>
                            <option value="github">GitHub</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="toolbar-section">
                        <button class="toolbar-button" data-action="run" title="Run Code">
                            <i class="ri-play-line"></i>
                            Run
                        </button>
                        <button class="toolbar-button" data-action="format" title="Format Code">
                            <i class="ri-code-s-slash-line"></i>
                            Format
                        </button>
                        <button class="toolbar-button" data-action="settings" title="Settings">
                            <i class="ri-settings-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="editor-workspace">
                    <div class="file-explorer">
                        <div class="explorer-header">
                            <h4>Explorer</h4>
                            <button class="explorer-action" data-action="new-folder" title="New Folder">
                                <i class="ri-folder-add-line"></i>
                            </button>
                        </div>
                        <div class="file-tree">
                            <div class="folder-item expanded" data-path="/">
                                <i class="ri-folder-open-line"></i>
                                <span>Project</span>
                            </div>
                            <div class="file-list">
                                ${this.renderFileList()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="editor-main">
                        <div class="file-tabs">
                            ${this.renderFileTabs()}
                        </div>
                        
                        <div class="editor-container">
                            <div class="line-numbers"></div>
                            <textarea class="code-editor-area" placeholder="// Start coding here..."></textarea>
                            ${this.minimap ? '<div class="editor-minimap"></div>' : ''}
                        </div>
                        
                        <div class="editor-footer">
                            <div class="footer-left">
                                <span class="cursor-position">Ln 1, Col 1</span>
                                <span class="selection-info"></span>
                                <span class="file-encoding">UTF-8</span>
                            </div>
                            <div class="footer-right">
                                <span class="language-indicator">${this.language.toUpperCase()}</span>
                                <span class="tab-size">Spaces: ${this.tabSize}</span>
                                <span class="line-ending">LF</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="output-panel" style="display: none;">
                        <div class="output-header">
                            <h4>Output</h4>
                            <div class="output-actions">
                                <button class="output-action" data-action="clear" title="Clear">
                                    <i class="ri-delete-bin-line"></i>
                                </button>
                                <button class="output-action" data-action="close" title="Close">
                                    <i class="ri-close-line"></i>
                                </button>
                            </div>
                        </div>
                        <div class="output-content">
                            <div class="output-text"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupEventListeners();
        this.createDefaultFile();
        this.applyTheme();
        this.updateLineNumbers();
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        const editor = window.querySelector('.code-editor-area');
        
        // Toolbar actions
        window.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleToolbarAction(button.dataset.action);
            });
        });
        
        // Language and theme selectors
        const languageSelect = window.querySelector('.language-select');
        const themeSelect = window.querySelector('.theme-select');
        
        languageSelect.addEventListener('change', () => {
            this.setLanguage(languageSelect.value);
        });
        
        themeSelect.addEventListener('change', () => {
            this.setTheme(themeSelect.value);
        });
        
        // Editor events
        editor.addEventListener('input', () => {
            this.handleTextChange();
        });
        
        editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        editor.addEventListener('scroll', () => {
            this.syncLineNumbers();
        });
        
        editor.addEventListener('selectionchange', () => {
            this.updateCursorPosition();
        });
        
        editor.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        // File explorer
        window.querySelectorAll('.explorer-action').forEach(button => {
            button.addEventListener('click', () => {
                this.handleExplorerAction(button.dataset.action);
            });
        });
        
        // Output panel actions
        window.querySelectorAll('.output-action').forEach(button => {
            button.addEventListener('click', () => {
                this.handleOutputAction(button.dataset.action);
            });
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
                    case 'f':
                        e.preventDefault();
                        this.showFindDialog();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showReplaceDialog();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.runCode();
                        break;
                    case '/':
                        e.preventDefault();
                        this.toggleComment();
                        break;
                }
            }
            
            // F5 for run
            if (e.key === 'F5') {
                e.preventDefault();
                this.runCode();
            }
        });
    }

    createDefaultFile() {
        const defaultContent = this.getDefaultContent('javascript');
        const file = {
            name: 'main.js',
            content: defaultContent,
            language: 'javascript',
            modified: false,
            path: '/main.js'
        };
        
        this.files.set('main.js', file);
        this.activeFile = 'main.js';
        this.loadFileContent(file);
        this.updateFileTabs();
    }

    getDefaultContent(language) {
        const templates = {
            javascript: `// Welcome to RetroOS Code Editor
console.log('Hello, RetroOS!');

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate and display fibonacci sequence
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RetroOS Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to RetroOS</h1>
        <p>This is a sample HTML page created in the RetroOS Code Editor.</p>
    </div>
</body>
</html>`,
            css: `/* RetroOS Stylesheet */
:root {
    --primary-color: #4f46e5;
    --secondary-color: #10b981;
    --background: #f8fafc;
    --text: #1e293b;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
}`,
            python: `# Welcome to RetroOS Code Editor
print("Hello, RetroOS!")

def fibonacci(n):
    """Calculate fibonacci number recursively"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def fibonacci_iterative(n):
    """Calculate fibonacci number iteratively (more efficient)"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Calculate and display fibonacci sequence
print("Fibonacci sequence (first 10 numbers):")
for i in range(10):
    print(f"F({i}) = {fibonacci_iterative(i)}")

# Example class
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def get_history(self):
        return self.history

# Usage example
calc = Calculator()
result = calc.add(5, 3)
print(f"5 + 3 = {result}")`,
            json: `{
  "name": "retroos-project",
  "version": "1.0.0",
  "description": "A project created in RetroOS Code Editor",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [
    "retroos",
    "javascript",
    "web"
  ],
  "author": "RetroOS User",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}`
        };
        
        return templates[language] || '// Start coding here...';
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
            case 'find':
                this.showFindDialog();
                break;
            case 'replace':
                this.showReplaceDialog();
                break;
            case 'run':
                this.runCode();
                break;
            case 'format':
                this.formatCode();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    newFile() {
        const fileName = prompt('Enter file name:', 'untitled.js') || 'untitled.js';
        const extension = fileName.split('.').pop().toLowerCase();
        const language = this.getLanguageFromExtension(extension);
        
        const file = {
            name: fileName,
            content: this.getDefaultContent(language),
            language: language,
            modified: false,
            path: `/${fileName}`
        };
        
        this.files.set(fileName, file);
        this.activeFile = fileName;
        this.loadFileContent(file);
        this.updateFileTabs();
        this.updateFileList();
    }

    openFile() {
        try {
            const savedFiles = JSON.parse(localStorage.getItem('retroos-code-files') || '{}');
            const fileNames = Object.keys(savedFiles);
            
            if (fileNames.length === 0) {
                // Default files if none saved
                const sampleFiles = [
                    { name: 'app.js', language: 'javascript', content: 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n    res.send("Hello from RetroOS!");\n});\n\napp.listen(3000, () => {\n    console.log("Server running on port 3000");\n});' },
                    { name: 'style.css', language: 'css', content: '.header {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    padding: 2rem;\n    text-align: center;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 2rem;\n}' },
                    { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>RetroOS App</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="header">\n        <h1>Welcome to RetroOS</h1>\n    </div>\n    <div class="container">\n        <p>This is a sample HTML file.</p>\n    </div>\n</body>\n</html>' }
                ];
                const selectedFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
                this.loadSelectedFile(selectedFile);
            } else {
                // Show file selection dialog
                const fileList = fileNames.map((name, index) => `${index + 1}. ${name}`).join('\n');
                const choice = prompt(`Select a file to open:\n\n${fileList}\n\nEnter the number:`);
                const fileIndex = parseInt(choice) - 1;
                
                if (fileIndex >= 0 && fileIndex < fileNames.length) {
                    const fileName = fileNames[fileIndex];
                    const fileData = savedFiles[fileName];
                    this.loadSelectedFile({
                        name: fileName,
                        content: fileData.content,
                        language: fileData.language
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load files:', error);
            // Fallback to default file
            this.loadSelectedFile({
                name: 'app.js',
                language: 'javascript',
                content: 'console.log("Hello from RetroOS!");'
            });
        }
    }
    
    loadSelectedFile(selectedFile) {
        
        const file = {
            name: selectedFile.name,
            content: selectedFile.content,
            language: selectedFile.language,
            modified: false,
            path: `/${selectedFile.name}`
        };
        
        this.files.set(selectedFile.name, file);
        this.activeFile = selectedFile.name;
        this.loadFileContent(file);
        this.updateFileTabs();
        this.updateFileList();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('File Opened', `${selectedFile.name} loaded successfully`, 'success');
        }
    }

    saveFile() {
        if (this.activeFile) {
            const file = this.files.get(this.activeFile);
            if (file) {
                file.modified = false;
                
                // Actually save to localStorage for persistence
                try {
                    const savedFiles = JSON.parse(localStorage.getItem('retroos-code-files') || '{}');
                    savedFiles[file.name] = {
                        content: file.content,
                        language: file.language,
                        modified: new Date().toISOString()
                    };
                    localStorage.setItem('retroos-code-files', JSON.stringify(savedFiles));
                } catch (error) {
                    console.error('Failed to save file:', error);
                }
                
                this.updateFileTabs();
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('File Saved', `${file.name} saved successfully`, 'success');
                }
            }
        }
    }

    saveAsFile() {
        if (this.activeFile) {
            const newName = prompt('Save as:', this.activeFile);
            if (newName && newName !== this.activeFile) {
                const file = this.files.get(this.activeFile);
                const newFile = { ...file, name: newName, path: `/${newName}` };
                
                this.files.set(newName, newFile);
                this.activeFile = newName;
                this.saveFile(); // Save the new file
                this.updateFileTabs();
                this.updateFileList();
            }
        }
    }

    runCode() {
        if (!this.activeFile) return;
        
        const file = this.files.get(this.activeFile);
        if (!file) return;
        
        this.showOutputPanel();
        const outputText = document.querySelector(`#${this.windowId} .output-text`);
        
        try {
            switch (file.language) {
                case 'javascript':
                    this.runJavaScript(file.content, outputText);
                    break;
                case 'html':
                    this.runHTML(file.content, outputText);
                    break;
                case 'python':
                    this.runPython(file.content, outputText);
                    break;
                default:
                    outputText.innerHTML = `<div class="output-line info">Language "${file.language}" execution not supported in demo mode.</div>`;
            }
        } catch (error) {
            outputText.innerHTML = `<div class="output-line error">Error: ${error.message}</div>`;
        }
    }

    runJavaScript(code, outputElement) {
        outputElement.innerHTML = '<div class="output-line info">Running JavaScript...</div>';
        
        // Create a safe execution environment
        const originalConsole = console.log;
        const outputs = [];
        
        console.log = (...args) => {
            outputs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };
        
        try {
            // Execute the code
            eval(code);
            
            // Display outputs
            if (outputs.length > 0) {
                outputElement.innerHTML = outputs.map(output => 
                    `<div class="output-line">${output}</div>`
                ).join('');
            } else {
                outputElement.innerHTML = '<div class="output-line success">Code executed successfully (no output)</div>';
            }
        } catch (error) {
            outputElement.innerHTML = `<div class="output-line error">Error: ${error.message}</div>`;
        } finally {
            console.log = originalConsole;
        }
    }

    runHTML(code, outputElement) {
        outputElement.innerHTML = `
            <div class="output-line info">HTML Preview:</div>
            <div class="html-preview">
                <iframe srcdoc="${code.replace(/"/g, '&quot;')}" style="width: 100%; height: 300px; border: 1px solid var(--border-color); border-radius: var(--radius-md);"></iframe>
            </div>
        `;
    }

    runPython(code, outputElement) {
        // Simulate Python execution
        outputElement.innerHTML = `
            <div class="output-line info">Python execution simulated:</div>
            <div class="output-line">Hello, RetroOS!</div>
            <div class="output-line">Fibonacci sequence (first 10 numbers):</div>
            <div class="output-line">F(0) = 0</div>
            <div class="output-line">F(1) = 1</div>
            <div class="output-line">F(2) = 1</div>
            <div class="output-line">F(3) = 2</div>
            <div class="output-line">F(4) = 3</div>
            <div class="output-line">F(5) = 5</div>
            <div class="output-line">F(6) = 8</div>
            <div class="output-line">F(7) = 13</div>
            <div class="output-line">F(8) = 21</div>
            <div class="output-line">F(9) = 34</div>
            <div class="output-line success">Python code executed successfully</div>
        `;
    }

    formatCode() {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        if (!editor || !this.activeFile) return;
        
        const file = this.files.get(this.activeFile);
        if (!file) return;
        
        // Simple formatting for demonstration
        let formatted = editor.value;
        
        switch (file.language) {
            case 'javascript':
            case 'css':
                // Basic indentation
                formatted = this.formatJavaScript(formatted);
                break;
            case 'html':
                formatted = this.formatHTML(formatted);
                break;
            case 'json':
                try {
                    const parsed = JSON.parse(formatted);
                    formatted = JSON.stringify(parsed, null, 2);
                } catch (e) {
                    // Invalid JSON, keep original
                }
                break;
        }
        
        editor.value = formatted;
        this.handleTextChange();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Code Formatted', 'Code has been formatted', 'success');
        }
    }

    formatJavaScript(code) {
        // Very basic JavaScript formatting
        return code
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\{/g, ' {\n')
            .replace(/\}/g, '\n}\n')
            .replace(/;/g, ';\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    formatHTML(code) {
        // Very basic HTML formatting
        let formatted = code;
        let indent = 0;
        const lines = formatted.split('\n');
        
        return lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('</')) {
                indent = Math.max(0, indent - 1);
            }
            
            const indented = '  '.repeat(indent) + trimmed;
            
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                indent++;
            }
            
            return indented;
        }).join('\n');
    }

    setLanguage(language) {
        this.language = language;
        
        if (this.activeFile) {
            const file = this.files.get(this.activeFile);
            if (file) {
                file.language = language;
            }
        }
        
        this.updateLanguageIndicator();
        this.applySyntaxHighlighting();
    }

    setTheme(theme) {
        this.theme = theme;
        this.applyTheme();
    }

    applyTheme() {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        const container = document.querySelector(`#${this.windowId} .editor-container`);
        
        if (!editor || !container) return;
        
        const themes = {
            dark: {
                background: '#1e293b',
                color: '#e2e8f0',
                lineNumberBg: '#0f172a',
                lineNumberColor: '#64748b'
            },
            light: {
                background: '#ffffff',
                color: '#1e293b',
                lineNumberBg: '#f8fafc',
                lineNumberColor: '#64748b'
            },
            monokai: {
                background: '#272822',
                color: '#f8f8f2',
                lineNumberBg: '#1e1f1c',
                lineNumberColor: '#90908a'
            },
            github: {
                background: '#ffffff',
                color: '#24292e',
                lineNumberBg: '#fafbfc',
                lineNumberColor: '#6a737d'
            }
        };
        
        const currentTheme = themes[this.theme] || themes.dark;
        
        editor.style.background = currentTheme.background;
        editor.style.color = currentTheme.color;
        
        const lineNumbers = document.querySelector(`#${this.windowId} .line-numbers`);
        if (lineNumbers) {
            lineNumbers.style.background = currentTheme.lineNumberBg;
            lineNumbers.style.color = currentTheme.lineNumberColor;
        }
    }

    handleTextChange() {
        if (this.activeFile) {
            const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
            const file = this.files.get(this.activeFile);
            
            if (file && editor) {
                file.content = editor.value;
                file.modified = true;
                this.updateFileTabs();
                this.updateLineNumbers();
                this.updateCursorPosition();
            }
        }
    }

    handleKeyDown(e) {
        const editor = e.target;
        
        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const spaces = ' '.repeat(this.tabSize);
            
            editor.value = editor.value.substring(0, start) + spaces + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + this.tabSize;
            
            this.handleTextChange();
        }
        
        // Auto-closing brackets
        if (this.autoComplete) {
            const pairs = {
                '(': ')',
                '[': ']',
                '{': '}',
                '"': '"',
                "'": "'"
            };
            
            if (pairs[e.key]) {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                const selectedText = editor.value.substring(start, end);
                
                editor.value = editor.value.substring(0, start) + 
                              e.key + selectedText + pairs[e.key] + 
                              editor.value.substring(end);
                
                editor.selectionStart = editor.selectionEnd = start + 1;
                this.handleTextChange();
            }
        }
    }

    loadFileContent(file) {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        if (editor) {
            editor.value = file.content;
            this.setLanguage(file.language);
            this.updateLineNumbers();
            this.updateCursorPosition();
        }
    }

    updateLineNumbers() {
        if (!this.lineNumbers) return;
        
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        const lineNumbersElement = document.querySelector(`#${this.windowId} .line-numbers`);
        
        if (!editor || !lineNumbersElement) return;
        
        const lines = editor.value.split('\n').length;
        const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1)
            .map(num => `<div class="line-number">${num}</div>`)
            .join('');
        
        lineNumbersElement.innerHTML = lineNumbers;
    }

    syncLineNumbers() {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        const lineNumbers = document.querySelector(`#${this.windowId} .line-numbers`);
        
        if (editor && lineNumbers) {
            lineNumbers.scrollTop = editor.scrollTop;
        }
    }

    updateCursorPosition() {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        const positionElement = document.querySelector(`#${this.windowId} .cursor-position`);
        
        if (!editor || !positionElement) return;
        
        const cursorPos = editor.selectionStart;
        const textBeforeCursor = editor.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentColumn = lines[lines.length - 1].length + 1;
        
        positionElement.textContent = `Ln ${currentLine}, Col ${currentColumn}`;
        
        // Update selection info
        const selectionElement = document.querySelector(`#${this.windowId} .selection-info`);
        if (selectionElement) {
            const selectionLength = editor.selectionEnd - editor.selectionStart;
            if (selectionLength > 0) {
                selectionElement.textContent = `(${selectionLength} selected)`;
            } else {
                selectionElement.textContent = '';
            }
        }
    }

    updateLanguageIndicator() {
        const indicator = document.querySelector(`#${this.windowId} .language-indicator`);
        if (indicator) {
            indicator.textContent = this.language.toUpperCase();
        }
    }

    renderFileTabs() {
        return Array.from(this.files.values()).map(file => `
            <div class="file-tab ${file.name === this.activeFile ? 'active' : ''}" data-file="${file.name}">
                <i class="${this.getFileIcon(file.name)}"></i>
                <span class="tab-name">${file.name}</span>
                ${file.modified ? '<span class="modified-indicator">●</span>' : ''}
                <button class="tab-close" data-file="${file.name}">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `).join('');
    }

    renderFileList() {
        return Array.from(this.files.values()).map(file => `
            <div class="file-item" data-file="${file.name}">
                <i class="${this.getFileIcon(file.name)}"></i>
                <span>${file.name}</span>
                ${file.modified ? '<span class="file-modified">●</span>' : ''}
            </div>
        `).join('');
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        const icons = {
            js: 'ri-javascript-line',
            html: 'ri-html5-line',
            css: 'ri-css3-line',
            py: 'ri-file-code-line',
            java: 'ri-file-code-line',
            cpp: 'ri-file-code-line',
            json: 'ri-braces-line',
            md: 'ri-markdown-line',
            txt: 'ri-file-text-line'
        };
        
        return icons[extension] || 'ri-file-line';
    }

    getLanguageFromExtension(extension) {
        const languages = {
            js: 'javascript',
            html: 'html',
            css: 'css',
            py: 'python',
            java: 'java',
            cpp: 'cpp',
            json: 'json',
            md: 'markdown'
        };
        
        return languages[extension] || 'javascript';
    }

    updateFileTabs() {
        const tabsContainer = document.querySelector(`#${this.windowId} .file-tabs`);
        if (tabsContainer) {
            tabsContainer.innerHTML = this.renderFileTabs();
            this.setupTabEventListeners();
        }
    }

    updateFileList() {
        const fileList = document.querySelector(`#${this.windowId} .file-list`);
        if (fileList) {
            fileList.innerHTML = this.renderFileList();
            this.setupFileListEventListeners();
        }
    }

    setupTabEventListeners() {
        const window = document.getElementById(this.windowId);
        
        window.querySelectorAll('.file-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-close')) {
                    this.switchToFile(tab.dataset.file);
                }
            });
        });
        
        window.querySelectorAll('.tab-close').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeFile(button.dataset.file);
            });
        });
    }

    setupFileListEventListeners() {
        const window = document.getElementById(this.windowId);
        
        window.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchToFile(item.dataset.file);
            });
        });
    }

    switchToFile(fileName) {
        const file = this.files.get(fileName);
        if (file) {
            this.activeFile = fileName;
            this.loadFileContent(file);
            this.updateFileTabs();
        }
    }

    closeFile(fileName) {
        const file = this.files.get(fileName);
        if (file && file.modified) {
            const save = confirm(`Save changes to ${fileName}?`);
            if (save) {
                this.saveFile();
            }
        }
        
        this.files.delete(fileName);
        
        if (this.activeFile === fileName) {
            const remainingFiles = Array.from(this.files.keys());
            if (remainingFiles.length > 0) {
                this.switchToFile(remainingFiles[0]);
            } else {
                this.createDefaultFile();
            }
        }
        
        this.updateFileTabs();
        this.updateFileList();
    }

    showOutputPanel() {
        const outputPanel = document.querySelector(`#${this.windowId} .output-panel`);
        if (outputPanel) {
            outputPanel.style.display = 'block';
        }
    }

    hideOutputPanel() {
        const outputPanel = document.querySelector(`#${this.windowId} .output-panel`);
        if (outputPanel) {
            outputPanel.style.display = 'none';
        }
    }

    handleOutputAction(action) {
        switch (action) {
            case 'clear':
                const outputText = document.querySelector(`#${this.windowId} .output-text`);
                if (outputText) {
                    outputText.innerHTML = '';
                }
                break;
            case 'close':
                this.hideOutputPanel();
                break;
        }
    }

    showFindDialog() {
        const searchTerm = prompt('Find:');
        if (searchTerm) {
            const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
            const content = editor.value;
            const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
            
            if (index !== -1) {
                editor.focus();
                editor.setSelectionRange(index, index + searchTerm.length);
                
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
                const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
                const newContent = editor.value.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
                editor.value = newContent;
                this.handleTextChange();
                
                if (window.retroOS && window.retroOS.notifications) {
                    window.retroOS.notifications.show('Replaced', `"${searchTerm}" replaced with "${replaceTerm}"`, 'success');
                }
            }
        }
    }

    undo() {
        document.execCommand('undo');
    }

    redo() {
        document.execCommand('redo');
    }

    toggleComment() {
        const editor = document.querySelector(`#${this.windowId} .code-editor-area`);
        if (!editor) return;
        
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const lines = editor.value.split('\n');
        const startLine = editor.value.substring(0, start).split('\n').length - 1;
        const endLine = editor.value.substring(0, end).split('\n').length - 1;
        
        const commentChar = this.getCommentChar();
        
        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].trim().startsWith(commentChar)) {
                lines[i] = lines[i].replace(commentChar + ' ', '').replace(commentChar, '');
            } else {
                lines[i] = commentChar + ' ' + lines[i];
            }
        }
        
        editor.value = lines.join('\n');
        this.handleTextChange();
    }

    getCommentChar() {
        switch (this.language) {
            case 'javascript':
            case 'java':
            case 'cpp':
                return '//';
            case 'python':
                return '#';
            case 'html':
                return '<!--';
            case 'css':
                return '/*';
            default:
                return '//';
        }
    }

    applySyntaxHighlighting() {
        // Basic syntax highlighting would be implemented here
        // For demo purposes, we'll just apply the theme
        this.applyTheme();
    }

    showSettings() {
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Settings', 'Editor settings panel would open here', 'info');
        }
    }

    cleanup() {
        // Clean up any resources
        this.files.clear();
    }
}

// Add code editor specific styles
const codeEditorStyles = document.createElement('style');
codeEditorStyles.textContent = `
    .editor-workspace {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
    
    .file-explorer {
        width: 200px;
        background: #f8fafc;
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
    }
    
    .explorer-header {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
    }
    
    .explorer-header h4 {
        font-size: 0.875rem;
        font-weight: 600;
        margin: 0;
    }
    
    .explorer-action {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .explorer-action:hover {
        background: var(--accent-color);
        color: white;
    }
    
    .file-tree {
        flex: 1;
        padding: var(--spacing-sm);
        overflow-y: auto;
    }
    
    .folder-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .file-list {
        margin-left: var(--spacing-lg);
    }
    
    .file-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: 0.875rem;
        position: relative;
    }
    
    .file-item:hover {
        background: white;
        box-shadow: var(--shadow-sm);
    }
    
    .file-modified {
        color: var(--accent-color);
        font-weight: bold;
        margin-left: auto;
    }
    
    .editor-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .file-tabs {
        display: flex;
        background: #f8fafc;
        border-bottom: 1px solid var(--border-color);
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    
    .file-tabs::-webkit-scrollbar {
        display: none;
    }
    
    .file-tab {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border-right: 1px solid var(--border-color);
        cursor: pointer;
        transition: all var(--transition-fast);
        background: #e2e8f0;
        font-size: 0.875rem;
        min-width: 120px;
        position: relative;
    }
    
    .file-tab.active {
        background: white;
        border-bottom: 2px solid var(--accent-color);
    }
    
    .file-tab:hover {
        background: #f1f5f9;
    }
    
    .file-tab.active:hover {
        background: white;
    }
    
    .tab-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .modified-indicator {
        color: var(--accent-color);
        font-weight: bold;
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
    
    .editor-container {
        flex: 1;
        display: flex;
        overflow: hidden;
        position: relative;
    }
    
    .line-numbers {
        width: 50px;
        background: #0f172a;
        color: #64748b;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.6;
        padding: var(--spacing-lg) var(--spacing-sm);
        text-align: right;
        user-select: none;
        overflow: hidden;
        border-right: 1px solid #334155;
    }
    
    .line-number {
        height: 22.4px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
    
    .code-editor-area {
        flex: 1;
        background: #1e293b;
        color: #e2e8f0;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.6;
        padding: var(--spacing-lg);
        border: none;
        outline: none;
        resize: none;
        tab-size: 2;
        white-space: pre;
        overflow-wrap: normal;
        overflow-x: auto;
    }
    
    .editor-footer {
        background: #f8fafc;
        border-top: 1px solid var(--border-color);
        padding: var(--spacing-sm) var(--spacing-lg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    
    .footer-left, .footer-right {
        display: flex;
        gap: var(--spacing-lg);
    }
    
    .language-select, .theme-select {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: white;
        font-size: 0.875rem;
        min-width: 100px;
    }
    
    .output-panel {
        height: 200px;
        background: #1e293b;
        border-top: 1px solid #334155;
        display: flex;
        flex-direction: column;
    }
    
    .output-header {
        background: #0f172a;
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #334155;
    }
    
    .output-header h4 {
        font-size: 0.875rem;
        font-weight: 600;
        margin: 0;
    }
    
    .output-actions {
        display: flex;
        gap: var(--spacing-sm);
    }
    
    .output-action {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .output-action:hover {
        background: #334155;
        color: white;
    }
    
    .output-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-md);
    }
    
    .output-text {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    
    .output-line {
        margin-bottom: var(--spacing-xs);
        color: #e2e8f0;
    }
    
    .output-line.error {
        color: #ef4444;
    }
    
    .output-line.success {
        color: #10b981;
    }
    
    .output-line.info {
        color: #60a5fa;
    }
    
    .html-preview {
        margin-top: var(--spacing-md);
    }
    
    @media (max-width: 768px) {
        .file-explorer {
            width: 150px;
        }
        
        .editor-footer {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: stretch;
        }
        
        .footer-left, .footer-right {
            justify-content: center;
        }
        
        .output-panel {
            height: 150px;
        }
    }
`;
document.head.appendChild(codeEditorStyles);