// System Core - Handles low-level system operations
class SystemCore {
    constructor() {
        this.startTime = Date.now();
        this.processes = new Map();
        this.systemInfo = {
            name: 'RetroOS',
            version: '2.0.0',
            build: '20240115',
            architecture: 'x64',
            kernel: 'WebKernel 5.0'
        };
        this.resources = {
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0
        };
        
        this.updateInterval = null;
    }

    init() {
        console.log('🔧 Initializing System Core...');
        this.startResourceMonitoring();
        this.initializeSystemClock();
        this.setupPerformanceMonitoring();
    }

    startResourceMonitoring() {
        this.updateInterval = setInterval(() => {
            this.updateResourceUsage();
        }, 2000);
    }

    updateResourceUsage() {
        // Simulate realistic resource usage
        this.resources.cpu = Math.max(5, Math.min(95, this.resources.cpu + (Math.random() - 0.5) * 10));
        this.resources.memory = Math.max(20, Math.min(90, this.resources.memory + (Math.random() - 0.5) * 5));
        this.resources.disk = Math.max(10, Math.min(80, this.resources.disk + (Math.random() - 0.5) * 2));
        this.resources.network = Math.random() * 100;

        // Update system monitor widget
        this.updateSystemMonitorWidget();
        
        // Emit system event
        this.emitSystemEvent('resourceUpdate', this.resources);
    }

    updateSystemMonitorWidget() {
        const cpuProgress = document.querySelector('.system-monitor .monitor-item:nth-child(1) .progress');
        const ramProgress = document.querySelector('.system-monitor .monitor-item:nth-child(2) .progress');
        const cpuText = document.querySelector('.system-monitor .monitor-item:nth-child(1) span:last-child');
        const ramText = document.querySelector('.system-monitor .monitor-item:nth-child(2) span:last-child');

        if (cpuProgress) {
            cpuProgress.style.width = `${this.resources.cpu}%`;
            cpuProgress.style.background = this.resources.cpu > 80 ? 
                'linear-gradient(90deg, #ef4444, #dc2626)' : 
                'linear-gradient(90deg, #10b981, #059669)';
        }
        
        if (ramProgress) {
            ramProgress.style.width = `${this.resources.memory}%`;
            ramProgress.style.background = this.resources.memory > 80 ? 
                'linear-gradient(90deg, #f59e0b, #d97706)' : 
                'linear-gradient(90deg, #3b82f6, #2563eb)';
        }
        
        if (cpuText) cpuText.textContent = `${Math.round(this.resources.cpu)}%`;
        if (ramText) ramText.textContent = `${Math.round(this.resources.memory)}%`;
    }

    initializeSystemClock() {
        const updateClock = () => {
            const now = new Date();
            const timeElement = document.querySelector('.system-clock .time');
            const dateElement = document.querySelector('.system-clock .date');
            
            if (timeElement) {
                timeElement.textContent = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
            
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupPerformanceMonitoring() {
        // Monitor frame rate
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.emitSystemEvent('fpsUpdate', fps);
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    createProcess(name, type = 'application') {
        const processId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const process = {
            id: processId,
            name: name,
            type: type,
            startTime: Date.now(),
            status: 'running',
            cpu: 0,
            memory: Math.random() * 50 + 10 // MB
        };
        
        this.processes.set(processId, process);
        this.emitSystemEvent('processCreated', process);
        
        return processId;
    }

    killProcess(processId) {
        const process = this.processes.get(processId);
        if (process) {
            process.status = 'terminated';
            this.processes.delete(processId);
            this.emitSystemEvent('processKilled', process);
            return true;
        }
        return false;
    }

    getSystemInfo() {
        return {
            ...this.systemInfo,
            uptime: Date.now() - this.startTime,
            processes: this.processes.size,
            resources: { ...this.resources }
        };
    }

    getProcessList() {
        return Array.from(this.processes.values());
    }

    emitSystemEvent(eventType, data) {
        const event = new CustomEvent('systemEvent', {
            detail: { type: eventType, data: data }
        });
        document.dispatchEvent(event);
    }

    // System commands for terminal
    executeSystemCommand(command, args = []) {
        switch (command.toLowerCase()) {
            case 'ps':
                return this.getProcessList().map(p => 
                    `${p.id.substr(-8)} ${p.name.padEnd(20)} ${p.status.padEnd(10)} ${Math.round(p.memory)}MB`
                ).join('\n');
                
            case 'top':
                return `System Resources:
CPU: ${Math.round(this.resources.cpu)}%
Memory: ${Math.round(this.resources.memory)}%
Disk: ${Math.round(this.resources.disk)}%
Network: ${Math.round(this.resources.network)}%

Active Processes: ${this.processes.size}
Uptime: ${Math.round((Date.now() - this.startTime) / 1000)}s`;

            case 'uname':
                return `${this.systemInfo.name} ${this.systemInfo.version} ${this.systemInfo.build} ${this.systemInfo.architecture}`;
                
            case 'uptime':
                const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);
                const hours = Math.floor(uptimeSeconds / 3600);
                const minutes = Math.floor((uptimeSeconds % 3600) / 60);
                const seconds = uptimeSeconds % 60;
                return `System uptime: ${hours}h ${minutes}m ${seconds}s`;
                
            case 'free':
                return `Memory Usage:
Total: 8192 MB
Used: ${Math.round(this.resources.memory * 81.92)} MB
Free: ${Math.round(8192 - (this.resources.memory * 81.92))} MB
Available: ${Math.round(8192 - (this.resources.memory * 81.92))} MB`;

            case 'df':
                return `Filesystem Usage:
/dev/sda1: ${Math.round(this.resources.disk)}% used
/dev/sda2: ${Math.round(Math.random() * 30 + 10)}% used`;
                
            default:
                return null;
        }
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}