// Image Editor Application
class ImageEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.lastX = 0;
        this.lastY = 0;
        this.undoStack = [];
        this.redoStack = [];
        this.layers = [];
        this.currentLayer = 0;
    }

    getWindowConfig() {
        return {
            title: 'Image Editor',
            icon: 'ri-image-edit-line',
            width: 900,
            height: 700
        };
    }

    render() {
        return `
            <div class="image-editor-content">
                <div class="image-editor-toolbar">
                    <div class="tool-group">
                        <div class="tool-section">
                            <label>Tools:</label>
                            <button class="tool-button active" data-tool="brush" title="Brush">
                                <i class="ri-brush-line"></i>
                            </button>
                            <button class="tool-button" data-tool="pencil" title="Pencil">
                                <i class="ri-pencil-line"></i>
                            </button>
                            <button class="tool-button" data-tool="eraser" title="Eraser">
                                <i class="ri-eraser-line"></i>
                            </button>
                            <button class="tool-button" data-tool="line" title="Line">
                                <i class="ri-subtract-line"></i>
                            </button>
                            <button class="tool-button" data-tool="rectangle" title="Rectangle">
                                <i class="ri-rectangle-line"></i>
                            </button>
                            <button class="tool-button" data-tool="circle" title="Circle">
                                <i class="ri-circle-line"></i>
                            </button>
                            <button class="tool-button" data-tool="text" title="Text">
                                <i class="ri-text"></i>
                            </button>
                            <button class="tool-button" data-tool="fill" title="Fill">
                                <i class="ri-paint-bucket-line"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="tool-group">
                        <div class="tool-section">
                            <label>Size:</label>
                            <input type="range" class="brush-size-slider" min="1" max="50" value="5">
                            <span class="brush-size-display">5px</span>
                        </div>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="color-palette">
                        <label>Colors:</label>
                        <input type="color" class="color-picker" value="#000000">
                        <div class="color-swatches">
                            <div class="color-swatch active" style="background: #000000;" data-color="#000000"></div>
                            <div class="color-swatch" style="background: #ffffff;" data-color="#ffffff"></div>
                            <div class="color-swatch" style="background: #ff0000;" data-color="#ff0000"></div>
                            <div class="color-swatch" style="background: #00ff00;" data-color="#00ff00"></div>
                            <div class="color-swatch" style="background: #0000ff;" data-color="#0000ff"></div>
                            <div class="color-swatch" style="background: #ffff00;" data-color="#ffff00"></div>
                            <div class="color-swatch" style="background: #ff00ff;" data-color="#ff00ff"></div>
                            <div class="color-swatch" style="background: #00ffff;" data-color="#00ffff"></div>
                            <div class="color-swatch" style="background: #ffa500;" data-color="#ffa500"></div>
                            <div class="color-swatch" style="background: #800080;" data-color="#800080"></div>
                        </div>
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="tool-group">
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
                    </div>
                    
                    <div class="toolbar-separator"></div>
                    
                    <div class="tool-group">
                        <button class="toolbar-button" data-action="undo" title="Undo">
                            <i class="ri-arrow-go-back-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="redo" title="Redo">
                            <i class="ri-arrow-go-forward-line"></i>
                        </button>
                        <button class="toolbar-button" data-action="clear" title="Clear Canvas">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="editor-workspace">
                    <div class="canvas-container">
                        <canvas class="image-canvas" width="800" height="600"></canvas>
                        <div class="canvas-overlay"></div>
                    </div>
                    
                    <div class="editor-sidebar">
                        <div class="sidebar-section">
                            <h4>Layers</h4>
                            <div class="layers-panel">
                                <div class="layer-item active" data-layer="0">
                                    <i class="ri-eye-line"></i>
                                    <span>Background</span>
                                    <button class="layer-delete">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                </div>
                            </div>
                            <button class="add-layer-button">
                                <i class="ri-add-line"></i>
                                Add Layer
                            </button>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Filters</h4>
                            <div class="filters-panel">
                                <button class="filter-button" data-filter="blur">Blur</button>
                                <button class="filter-button" data-filter="sharpen">Sharpen</button>
                                <button class="filter-button" data-filter="grayscale">Grayscale</button>
                                <button class="filter-button" data-filter="sepia">Sepia</button>
                                <button class="filter-button" data-filter="invert">Invert</button>
                                <button class="filter-button" data-filter="brightness">Brightness</button>
                            </div>
                        </div>
                        
                        <div class="sidebar-section">
                            <h4>Canvas Info</h4>
                            <div class="canvas-info">
                                <div class="info-item">
                                    <span>Size:</span>
                                    <span>800 × 600</span>
                                </div>
                                <div class="info-item">
                                    <span>Tool:</span>
                                    <span class="current-tool">Brush</span>
                                </div>
                                <div class="info-item">
                                    <span>Color:</span>
                                    <span class="current-color">#000000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeLayers();
        this.saveState(); // Initial state for undo
    }

    setupCanvas() {
        this.canvas = document.querySelector(`#${this.windowId} .image-canvas`);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set default drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        
        // Tool selection
        window.querySelectorAll('.tool-button').forEach(button => {
            button.addEventListener('click', () => {
                this.selectTool(button.dataset.tool);
                
                // Update active state
                window.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Color selection
        const colorPicker = window.querySelector('.color-picker');
        colorPicker.addEventListener('change', (e) => {
            this.setColor(e.target.value);
        });
        
        window.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.setColor(swatch.dataset.color);
                
                // Update active state
                window.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                // Update color picker
                colorPicker.value = swatch.dataset.color;
            });
        });
        
        // Brush size
        const brushSlider = window.querySelector('.brush-size-slider');
        const brushDisplay = window.querySelector('.brush-size-display');
        
        brushSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            this.ctx.lineWidth = this.brushSize;
            brushDisplay.textContent = `${this.brushSize}px`;
        });
        
        // Toolbar actions
        window.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleToolbarAction(button.dataset.action);
            });
        });
        
        // Canvas drawing events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Filter buttons
        window.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                this.applyFilter(button.dataset.filter);
            });
        });
        
        // Layer management
        const addLayerButton = window.querySelector('.add-layer-button');
        addLayerButton.addEventListener('click', () => {
            this.addLayer();
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveImage();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newCanvas();
                        break;
                }
            }
            
            // Tool shortcuts
            switch (e.key) {
                case 'b':
                    this.selectTool('brush');
                    break;
                case 'e':
                    this.selectTool('eraser');
                    break;
                case 'l':
                    this.selectTool('line');
                    break;
                case 'r':
                    this.selectTool('rectangle');
                    break;
                case 'c':
                    this.selectTool('circle');
                    break;
                case 't':
                    this.selectTool('text');
                    break;
            }
        });
    }

    selectTool(tool) {
        this.currentTool = tool;
        this.canvas.style.cursor = this.getToolCursor(tool);
        
        // Update current tool display
        const currentToolSpan = document.querySelector(`#${this.windowId} .current-tool`);
        if (currentToolSpan) {
            currentToolSpan.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
        }
    }

    getToolCursor(tool) {
        switch (tool) {
            case 'brush':
            case 'pencil':
                return 'crosshair';
            case 'eraser':
                return 'grab';
            case 'line':
            case 'rectangle':
            case 'circle':
                return 'crosshair';
            case 'text':
                return 'text';
            case 'fill':
                return 'pointer';
            default:
                return 'default';
        }
    }

    setColor(color) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        
        // Update current color display
        const currentColorSpan = document.querySelector(`#${this.windowId} .current-color`);
        if (currentColorSpan) {
            currentColorSpan.textContent = color;
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        if (this.currentTool === 'brush' || this.currentTool === 'pencil') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        switch (this.currentTool) {
            case 'brush':
            case 'pencil':
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                break;
                
            case 'eraser':
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.arc(currentX, currentY, this.brushSize, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    handleToolbarAction(action) {
        switch (action) {
            case 'new':
                this.newCanvas();
                break;
            case 'open':
                this.openImage();
                break;
            case 'save':
                this.saveImage();
                break;
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'clear':
                this.clearCanvas();
                break;
        }
    }

    newCanvas() {
        const confirm = window.confirm('Create a new canvas? This will clear the current image.');
        if (confirm) {
            this.clearCanvas();
            this.undoStack = [];
            this.redoStack = [];
            this.saveState();
        }
    }

    openImage() {
        // Simulate opening an image
        const images = [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgSW1hZ2U8L3RleHQ+PC9zdmc+'
        ];
        
        const img = new Image();
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
            this.saveState();
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Image Opened', 'Sample image loaded successfully', 'success');
            }
        };
        img.src = images[0];
    }

    saveImage() {
        // Convert canvas to blob and simulate download
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'retroos-artwork.png';
            a.click();
            URL.revokeObjectURL(url);
            
            if (window.retroOS && window.retroOS.notifications) {
                window.retroOS.notifications.show('Image Saved', 'Artwork saved as retroos-artwork.png', 'success');
            }
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
    }

    saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        
        // Limit undo stack size
        if (this.undoStack.length > 20) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.restoreState(this.undoStack[this.undoStack.length - 1]);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.restoreState(state);
        }
    }

    restoreState(dataURL) {
        const img = new Image();
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    }

    applyFilter(filterType) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        switch (filterType) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;
                
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;
                
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;
                
            case 'brightness':
                const brightness = 30;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + brightness);
                    data[i + 1] = Math.min(255, data[i + 1] + brightness);
                    data[i + 2] = Math.min(255, data[i + 2] + brightness);
                }
                break;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Filter Applied', `${filterType} filter applied`, 'success');
        }
    }

    initializeLayers() {
        this.layers = [
            { name: 'Background', visible: true, data: this.canvas.toDataURL() }
        ];
    }

    addLayer() {
        const layerName = `Layer ${this.layers.length}`;
        this.layers.push({
            name: layerName,
            visible: true,
            data: null
        });
        
        this.updateLayersPanel();
        
        if (window.retroOS && window.retroOS.notifications) {
            window.retroOS.notifications.show('Layer Added', `${layerName} created`, 'success');
        }
    }

    updateLayersPanel() {
        const layersPanel = document.querySelector(`#${this.windowId} .layers-panel`);
        if (layersPanel) {
            layersPanel.innerHTML = this.layers.map((layer, index) => `
                <div class="layer-item ${index === this.currentLayer ? 'active' : ''}" data-layer="${index}">
                    <i class="ri-eye-line"></i>
                    <span>${layer.name}</span>
                    <button class="layer-delete">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    cleanup() {
        // Clean up any resources
        this.undoStack = [];
        this.redoStack = [];
        this.layers = [];
    }
}

// Add image editor specific styles
const imageEditorStyles = document.createElement('style');
imageEditorStyles.textContent = `
    .editor-workspace {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
    
    .canvas-container {
        flex: 1;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        padding: var(--spacing-lg);
        position: relative;
    }
    
    .image-canvas {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        cursor: crosshair;
    }
    
    .editor-sidebar {
        width: 250px;
        background: #f8fafc;
        border-left: 1px solid var(--border-color);
        padding: var(--spacing-md);
        overflow-y: auto;
    }
    
    .sidebar-section {
        margin-bottom: var(--spacing-xl);
    }
    
    .sidebar-section h4 {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
        color: var(--text-primary);
    }
    
    .tool-section {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .tool-section label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
        min-width: 40px;
    }
    
    .brush-size-slider {
        flex: 1;
        min-width: 100px;
    }
    
    .brush-size-display {
        font-size: 0.75rem;
        color: var(--text-secondary);
        min-width: 30px;
    }
    
    .color-palette {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .color-palette label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
    }
    
    .color-picker {
        width: 40px;
        height: 30px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        cursor: pointer;
    }
    
    .color-swatches {
        display: flex;
        gap: var(--spacing-xs);
        flex-wrap: wrap;
    }
    
    .layers-panel {
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
        margin-bottom: var(--spacing-sm);
    }
    
    .layer-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: white;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .layer-item:last-child {
        border-bottom: none;
    }
    
    .layer-item:hover {
        background: #f1f5f9;
    }
    
    .layer-item.active {
        background: var(--accent-color);
        color: white;
    }
    
    .layer-item span {
        flex: 1;
        font-size: 0.875rem;
    }
    
    .layer-delete {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 2px;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .layer-delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    .add-layer-button {
        width: 100%;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-size: 0.875rem;
    }
    
    .add-layer-button:hover {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-hover);
    }
    
    .filters-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-sm);
    }
    
    .filter-button {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: 0.75rem;
    }
    
    .filter-button:hover {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-hover);
    }
    
    .canvas-info {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);
    }
    
    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        font-size: 0.875rem;
    }
    
    .info-item:last-child {
        margin-bottom: 0;
    }
    
    .info-item span:first-child {
        color: var(--text-secondary);
    }
    
    .info-item span:last-child {
        font-weight: 500;
        color: var(--text-primary);
    }
`;
document.head.appendChild(imageEditorStyles);