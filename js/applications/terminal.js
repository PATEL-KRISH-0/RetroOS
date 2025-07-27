// Terminal Application
class Terminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentDirectory = '/home/user';
        this.environmentVars = {
            USER: 'retroos-user',
            HOME: '/home/user',
            PATH: '/bin:/usr/bin:/usr/local/bin',
            SHELL: '/bin/bash',
            TERM: 'xterm-256color'
        };
        this.processes = [];
        this.aliases = {
            'll': 'ls -la',
            'la': 'ls -a',
            'cls': 'clear',
            'dir': 'ls'
        };
    }

    getWindowConfig() {
        return {
            title: 'Terminal',
            icon: 'ri-terminal-line',
            width: 700,
            height: 500
        };
    }

    render() {
        return `
            <div class="terminal-content">
                <div class="terminal-header">
                    <div class="terminal-title">RetroOS Terminal</div>
                    <div class="terminal-controls">
                        <div class="terminal-control minimize"></div>
                        <div class="terminal-control maximize"></div>
                        <div class="terminal-control close"></div>
                    </div>
                </div>
                
                <div class="terminal-output" id="terminalOutput">
                    <div class="terminal-line">
                        <span style="color: #60a5fa;">RetroOS Terminal v2.0.0</span>
                    </div>
                    <div class="terminal-line">
                        <span style="color: #10b981;">Copyright (c) 2024 RetroOS. All rights reserved.</span>
                    </div>
                    <div class="terminal-line"></div>
                    <div class="terminal-line">
                        <span style="color: #f59e0b;">Type 'help' for available commands.</span>
                    </div>
                    <div class="terminal-line"></div>
                </div>
                
                <div class="terminal-input-line">
                    <span class="terminal-prompt">${this.getPrompt()}</span>
                    <input type="text" class="terminal-input" autofocus autocomplete="off" spellcheck="false">
                    <span class="terminal-cursor"></span>
                </div>
            </div>
        `;
    }

    init(windowId) {
        this.windowId = windowId;
        this.setupEventListeners();
        
        // Focus on input
        setTimeout(() => {
            const input = document.querySelector(`#${windowId} .terminal-input`);
            if (input) input.focus();
        }, 100);
    }

    setupEventListeners() {
        const window = document.getElementById(this.windowId);
        const input = window.querySelector('.terminal-input');
        const output = window.querySelector('.terminal-output');
        
        input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    this.executeCommand(input.value.trim());
                    input.value = '';
                    this.historyIndex = -1;
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1, input);
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1, input);
                    break;
                    
                case 'Tab':
                    e.preventDefault();
                    this.autoComplete(input);
                    break;
                    
                case 'l':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.clearScreen();
                    }
                    break;
                    
                case 'c':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.interruptCommand();
                    }
                    break;
            }
        });
        
        // Keep input focused
        window.addEventListener('click', () => {
            input.focus();
        });
        
        // Scroll to bottom when new content is added
        const observer = new MutationObserver(() => {
            output.scrollTop = output.scrollHeight;
        });
        observer.observe(output, { childList: true });
    }

    getPrompt() {
        const user = this.environmentVars.USER;
        const hostname = 'retroos';
        const dir = this.currentDirectory.replace(this.environmentVars.HOME, '~');
        return `<span style="color: #10b981;">${user}@${hostname}</span>:<span style="color: #3b82f6;">${dir}</span>$ `;
    }

    executeCommand(commandLine) {
        if (!commandLine) {
            this.addPromptLine();
            return;
        }
        
        // Add command to history
        this.commandHistory.unshift(commandLine);
        if (this.commandHistory.length > 100) {
            this.commandHistory.pop();
        }
        
        // Display command
        this.addOutputLine(`${this.getPrompt()}${commandLine}`);
        
        // Parse command
        const parts = this.parseCommand(commandLine);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Check for aliases
        const aliasedCommand = this.aliases[command];
        if (aliasedCommand) {
            const aliasedParts = this.parseCommand(aliasedCommand);
            this.executeBuiltinCommand(aliasedParts[0], [...aliasedParts.slice(1), ...args]);
        } else {
            this.executeBuiltinCommand(command, args);
        }
        
        this.addPromptLine();
    }

    parseCommand(commandLine) {
        // Simple command parsing (doesn't handle quotes properly, but good enough for demo)
        return commandLine.trim().split(/\s+/);
    }

    executeBuiltinCommand(command, args) {
        switch (command) {
            case 'help':
                this.showHelp();
                break;
                
            case 'clear':
            case 'cls':
                this.clearScreen();
                break;
                
            case 'ls':
            case 'dir':
                this.listDirectory(args);
                break;
                
            case 'cd':
                this.changeDirectory(args[0] || this.environmentVars.HOME);
                break;
                
            case 'pwd':
                this.addOutputLine(this.currentDirectory);
                break;
                
            case 'mkdir':
                this.makeDirectory(args[0]);
                break;
                
            case 'rmdir':
                this.removeDirectory(args[0]);
                break;
                
            case 'touch':
                this.createFile(args[0]);
                break;
                
            case 'rm':
                this.removeFile(args[0]);
                break;
                
            case 'cat':
                this.displayFile(args[0]);
                break;
                
            case 'echo':
                this.addOutputLine(args.join(' '));
                break;
                
            case 'date':
                this.addOutputLine(new Date().toString());
                break;
                
            case 'whoami':
                this.addOutputLine(this.environmentVars.USER);
                break;
                
            case 'uname':
                this.showSystemInfo(args);
                break;
                
            case 'ps':
                this.showProcesses();
                break;
                
            case 'top':
                this.showSystemResources();
                break;
                
            case 'history':
                this.showCommandHistory();
                break;
                
            case 'env':
                this.showEnvironmentVariables();
                break;
                
            case 'export':
                this.setEnvironmentVariable(args);
                break;
                
            case 'alias':
                this.manageAliases(args);
                break;
                
            case 'which':
                this.findCommand(args[0]);
                break;
                
            case 'man':
                this.showManual(args[0]);
                break;
                
            case 'grep':
                this.grepCommand(args);
                break;
                
            case 'find':
                this.findFiles(args);
                break;
                
            case 'wget':
            case 'curl':
                this.downloadFile(args[0]);
                break;
                
            case 'ping':
                this.pingHost(args[0]);
                break;
                
            case 'neofetch':
                this.showNeofetch();
                break;
                
            case 'cowsay':
                this.cowsay(args.join(' '));
                break;
                
            case 'fortune':
                this.showFortune();
                break;
                
            case 'matrix':
                this.startMatrix();
                break;
                
            case 'exit':
            case 'quit':
                this.exitTerminal();
                break;
                
            default:
                if (window.retroOS && window.retroOS.system) {
                    const systemResult = window.retroOS.system.executeSystemCommand(command, args);
                    if (systemResult) {
                        this.addOutputLine(systemResult);
                    } else {
                        this.addOutputLine(`bash: ${command}: command not found`);
                        this.addOutputLine(`Type 'help' for available commands.`);
                    }
                } else {
                    this.addOutputLine(`bash: ${command}: command not found`);
                }
                break;
        }
    }

    showHelp() {
        const helpText = `
<span style="color: #60a5fa;">Available Commands:</span>

<span style="color: #10b981;">File Operations:</span>
  ls, dir          - List directory contents
  cd [path]        - Change directory
  pwd              - Print working directory
  mkdir [name]     - Create directory
  rmdir [name]     - Remove directory
  touch [file]     - Create file
  rm [file]        - Remove file
  cat [file]       - Display file contents

<span style="color: #10b981;">System Information:</span>
  date             - Show current date and time
  whoami           - Show current user
  uname [-a]       - Show system information
  ps               - Show running processes
  top              - Show system resources
  env              - Show environment variables
  neofetch         - Show system info with ASCII art

<span style="color: #10b981;">Utilities:</span>
  echo [text]      - Display text
  history          - Show command history
  clear, cls       - Clear screen
  grep [pattern]   - Search for patterns
  find [name]      - Find files
  which [cmd]      - Locate command
  man [cmd]        - Show manual for command

<span style="color: #10b981;">Network:</span>
  ping [host]      - Ping a host
  wget [url]       - Download file
  curl [url]       - Transfer data from server

<span style="color: #10b981;">Fun:</span>
  cowsay [text]    - ASCII cow says text
  fortune          - Display random quote
  matrix           - Matrix effect

<span style="color: #f59e0b;">Keyboard Shortcuts:</span>
  Ctrl+L           - Clear screen
  Ctrl+C           - Interrupt command
  Up/Down Arrow    - Navigate command history
  Tab              - Auto-complete

<span style="color: #f59e0b;">Tips:</span>
  - Use 'ls -la' for detailed file listing
  - Use 'cd ..' to go up one directory
  - Use 'cd ~' to go to home directory
        `;
        
        this.addOutputLine(helpText);
    }

    listDirectory(args) {
        const showHidden = args.includes('-a') || args.includes('-la');
        const longFormat = args.includes('-l') || args.includes('-la');
        
        const files = [
            { name: 'Documents', type: 'directory', size: 4096, modified: '2024-01-15 10:30' },
            { name: 'Downloads', type: 'directory', size: 4096, modified: '2024-01-14 15:45' },
            { name: 'Pictures', type: 'directory', size: 4096, modified: '2024-01-13 09:20' },
            { name: 'readme.txt', type: 'file', size: 1024, modified: '2024-01-12 14:15' },
            { name: 'script.sh', type: 'file', size: 512, modified: '2024-01-11 11:30' }
        ];
        
        if (showHidden) {
            files.unshift(
                { name: '.', type: 'directory', size: 4096, modified: '2024-01-15 10:30' },
                { name: '..', type: 'directory', size: 4096, modified: '2024-01-15 10:30' },
                { name: '.bashrc', type: 'file', size: 256, modified: '2024-01-10 08:00' },
                { name: '.profile', type: 'file', size: 128, modified: '2024-01-10 08:00' }
            );
        }
        
        if (longFormat) {
            files.forEach(file => {
                const permissions = file.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = file.size.toString().padStart(8);
                const color = file.type === 'directory' ? '#3b82f6' : '#e2e8f0';
                this.addOutputLine(`${permissions} 1 user user ${size} ${file.modified} <span style="color: ${color};">${file.name}</span>`);
            });
        } else {
            const fileNames = files.map(file => {
                const color = file.type === 'directory' ? '#3b82f6' : '#e2e8f0';
                return `<span style="color: ${color};">${file.name}</span>`;
            });
            this.addOutputLine(fileNames.join('  '));
        }
    }

    changeDirectory(path) {
        if (!path || path === '~') {
            this.currentDirectory = this.environmentVars.HOME;
        } else if (path === '..') {
            const parts = this.currentDirectory.split('/').filter(p => p);
            if (parts.length > 1) {
                parts.pop();
                this.currentDirectory = '/' + parts.join('/');
            } else {
                this.currentDirectory = '/';
            }
        } else if (path.startsWith('/')) {
            this.currentDirectory = path;
        } else {
            this.currentDirectory = `${this.currentDirectory}/${path}`.replace('//', '/');
        }
        
        this.updatePrompt();
    }

    makeDirectory(name) {
        if (name) {
            this.addOutputLine(`mkdir: created directory '${name}'`);
        } else {
            this.addOutputLine('mkdir: missing operand');
        }
    }

    removeDirectory(name) {
        if (name) {
            this.addOutputLine(`rmdir: removed directory '${name}'`);
        } else {
            this.addOutputLine('rmdir: missing operand');
        }
    }

    createFile(name) {
        if (name) {
            this.addOutputLine(`touch: created file '${name}'`);
        } else {
            this.addOutputLine('touch: missing operand');
        }
    }

    removeFile(name) {
        
        if (name) {
            this.addOutputLine(`rm: removed file '${name}'`);
        } else {
            this.addOutputLine('rm: missing operand');
        }
    }

    displayFile(name) {
        if (!name) {
            this.addOutputLine('cat: missing operand');
            return;
        }
        
        const sampleFiles = {
            'readme.txt': `Welcome to RetroOS!

This is a sample text file demonstrating the cat command.

RetroOS is a modern operating system running in your browser.
It features a complete desktop environment with multiple applications.

Enjoy exploring!`,
            'script.sh': `#!/bin/bash

echo "Hello from RetroOS!"
echo "Current date: $(date)"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"`,
            '.bashrc': `# RetroOS Bash Configuration

export PS1="\\u@\\h:\\w\\$ "
export PATH="/bin:/usr/bin:/usr/local/bin"

alias ll='ls -la'
alias la='ls -a'
alias cls='clear'

echo "Welcome to RetroOS Terminal!"`
        };
        
        if (sampleFiles[name]) {
            this.addOutputLine(sampleFiles[name]);
        } else {
            this.addOutputLine(`cat: ${name}: No such file or directory`);
        }
    }

    showSystemInfo(args) {
        if (args.includes('-a')) {
            this.addOutputLine('RetroOS 2.0.0 WebKernel x86_64 GNU/Linux');
        } else {
            this.addOutputLine('RetroOS');
        }
    }

    showProcesses() {
        const processes = [
            'PID  COMMAND',
            '1    systemd',
            '2    kthreadd',
            '3    rcu_gp',
            '123  retroos-desktop',
            '124  retroos-taskbar',
            '125  retroos-terminal',
            '126  retroos-filemanager'
        ];
        
        processes.forEach(process => {
            this.addOutputLine(process);
        });
    }

    showSystemResources() {
        if (window.retroOS && window.retroOS.system) {
            const systemInfo = window.retroOS.system.getSystemInfo();
            this.addOutputLine(`System Resources:
CPU Usage: ${Math.round(systemInfo.resources.cpu)}%
Memory Usage: ${Math.round(systemInfo.resources.memory)}%
Disk Usage: ${Math.round(systemInfo.resources.disk)}%
Network Usage: ${Math.round(systemInfo.resources.network)}%

Uptime: ${Math.round(systemInfo.uptime / 1000)}s
Active Processes: ${systemInfo.processes}`);
        }
    }

    showCommandHistory() {
        this.commandHistory.forEach((cmd, index) => {
            this.addOutputLine(`${this.commandHistory.length - index}  ${cmd}`);
        });
    }

    showEnvironmentVariables() {
        Object.entries(this.environmentVars).forEach(([key, value]) => {
            this.addOutputLine(`${key}=${value}`);
        });
    }

    setEnvironmentVariable(args) {
        if (args.length === 0) {
            this.showEnvironmentVariables();
            return;
        }
        
        const assignment = args[0];
        const [key, value] = assignment.split('=');
        
        if (key && value) {
            this.environmentVars[key] = value;
            this.addOutputLine(`export: ${key}=${value}`);
        } else {
            this.addOutputLine('export: invalid assignment');
        }
    }

    manageAliases(args) {
        if (args.length === 0) {
            Object.entries(this.aliases).forEach(([alias, command]) => {
                this.addOutputLine(`alias ${alias}='${command}'`);
            });
        } else {
            const assignment = args.join(' ');
            const [alias, command] = assignment.split('=');
            
            if (alias && command) {
                this.aliases[alias] = command.replace(/'/g, '');
                this.addOutputLine(`alias: ${alias}='${command}'`);
            } else {
                this.addOutputLine('alias: invalid syntax');
            }
        }
    }

    findCommand(command) {
        const paths = ['/bin', '/usr/bin', '/usr/local/bin'];
        const found = paths.find(path => Math.random() > 0.5); // Simulate finding
        
        if (found) {
            this.addOutputLine(`${found}/${command}`);
        } else {
            this.addOutputLine(`which: no ${command} in (${this.environmentVars.PATH})`);
        }
    }

    showManual(command) {
        const manuals = {
            'ls': 'ls - list directory contents\n\nSYNOPSIS\n    ls [OPTION]... [FILE]...\n\nDESCRIPTION\n    List information about the FILEs (the current directory by default).',
            'cd': 'cd - change directory\n\nSYNOPSIS\n    cd [DIRECTORY]\n\nDESCRIPTION\n    Change the current working directory to DIRECTORY.',
            'cat': 'cat - concatenate files and print on the standard output\n\nSYNOPSIS\n    cat [OPTION]... [FILE]...\n\nDESCRIPTION\n    Concatenate FILE(s) to standard output.'
        };
        
        if (manuals[command]) {
            this.addOutputLine(manuals[command]);
        } else {
            this.addOutputLine(`man: no manual entry for ${command}`);
        }
    }

    grepCommand(args) {
        if (args.length < 1) {
            this.addOutputLine('grep: missing pattern');
            return;
        }
        
        const pattern = args[0];
        this.addOutputLine(`grep: searching for pattern "${pattern}"`);
        this.addOutputLine('grep: sample match found in file.txt');
    }

    findFiles(args) {
        if (args.length < 1) {
            this.addOutputLine('find: missing search term');
            return;
        }
        
        const searchTerm = args[0];
        const results = [
            `./Documents/${searchTerm}.txt`,
            `./Downloads/${searchTerm}.zip`,
            `./Pictures/${searchTerm}.jpg`
        ];
        
        results.forEach(result => {
            this.addOutputLine(result);
        });
    }

    downloadFile(url) {
        if (!url) {
            this.addOutputLine('wget: missing URL');
            return;
        }
        
        this.addOutputLine(`--${new Date().toISOString()}--  ${url}`);
        this.addOutputLine('Resolving example.com... 93.184.216.34');
        this.addOutputLine('Connecting to example.com|93.184.216.34|:80... connected.');
        this.addOutputLine('HTTP request sent, awaiting response... 200 OK');
        this.addOutputLine('Length: 1024 (1.0K) [text/html]');
        this.addOutputLine('Saving to: \'index.html\'');
        this.addOutputLine('');
        this.addOutputLine('index.html      100%[===================>]   1.00K  --.-KB/s    in 0s');
        this.addOutputLine('');
        this.addOutputLine(`${new Date().toISOString()} (1.00 KB/s) - 'index.html' saved [1024/1024]`);
    }

    pingHost(host) {
        if (!host) {
            this.addOutputLine('ping: missing host');
            return;
        }
        
        this.addOutputLine(`PING ${host} (93.184.216.34) 56(84) bytes of data.`);
        
        let count = 0;
        const pingInterval = setInterval(() => {
            count++;
            const time = (Math.random() * 50 + 10).toFixed(1);
            this.addOutputLine(`64 bytes from ${host} (93.184.216.34): icmp_seq=${count} ttl=64 time=${time} ms`);
            
            if (count >= 4) {
                clearInterval(pingInterval);
                this.addOutputLine('');
                this.addOutputLine(`--- ${host} ping statistics ---`);
                this.addOutputLine(`${count} packets transmitted, ${count} received, 0% packet loss`);
                this.addPromptLine();
            }
        }, 1000);
    }

    showNeofetch() {
        const ascii = `
<span style="color: #60a5fa;">                   -\`                </span>    <span style="color: #10b981;">retroos-user</span>@<span style="color: #10b981;">retroos</span>
<span style="color: #60a5fa;">                  .o+\`               </span>    -------------------------
<span style="color: #60a5fa;">                 \`ooo/               </span>    <span style="color: #10b981;">OS</span>: RetroOS 2.0.0 x86_64
<span style="color: #60a5fa;">                \`+oooo:              </span>    <span style="color: #10b981;">Host</span>: WebContainer
<span style="color: #60a5fa;">               \`+oooooo:             </span>    <span style="color: #10b981;">Kernel</span>: WebKernel 5.0.0
<span style="color: #60a5fa;">               -+oooooo+:            </span>    <span style="color: #10b981;">Uptime</span>: ${Math.round((Date.now() - (window.retroOS?.system?.startTime || Date.now())) / 60000)} mins
<span style="color: #60a5fa;">             \`/:-:++oooo+:           </span>    <span style="color: #10b981;">Packages</span>: 1337 (npm)
<span style="color: #60a5fa;">            \`/++++/+++++++:          </span>    <span style="color: #10b981;">Shell</span>: bash 5.1.16
<span style="color: #60a5fa;">           \`/++++++++++++++:         </span>    <span style="color: #10b981;">Resolution</span>: ${window.screen.width}x${window.screen.height}
<span style="color: #60a5fa;">          \`/+++ooooooooooooo/\`       </span>    <span style="color: #10b981;">DE</span>: RetroOS Desktop
<span style="color: #60a5fa;">         ./ooosssso++osssssso+\`      </span>    <span style="color: #10b981;">WM</span>: RetroOS Window Manager
<span style="color: #60a5fa;">        .oossssso-\`\`\`\`/ossssss+\`     </span>    <span style="color: #10b981;">Theme</span>: RetroOS [GTK3]
<span style="color: #60a5fa;">       -osssssso.      :ssssssso.    </span>    <span style="color: #10b981;">Icons</span>: Remix [GTK3]
<span style="color: #60a5fa;">      :osssssss/        osssso+++.   </span>    <span style="color: #10b981;">Terminal</span>: RetroOS Terminal
<span style="color: #60a5fa;">     /ossssssss/        +ssssooo/-   </span>    <span style="color: #10b981;">CPU</span>: WebAssembly Engine
<span style="color: #60a5fa;">   \`/ossssso+/:-        -:/+osssso+- </span>    <span style="color: #10b981;">Memory</span>: ${Math.round((window.performance?.memory?.usedJSHeapSize || 0) / 1024 / 1024)}MB / ${Math.round((window.performance?.memory?.totalJSHeapSize || 0) / 1024 / 1024)}MB
<span style="color: #60a5fa;">  \`+sso+:-\`                 \`.-/+oso:</span>
<span style="color: #60a5fa;"> \`++:.                           \`-/+/</span>    <span style="color: #ef4444;">█</span><span style="color: #f59e0b;">█</span><span style="color: #10b981;">█</span><span style="color: #3b82f6;">█</span><span style="color: #8b5cf6;">█</span><span style="color: #ec4899;">█</span><span style="color: #06b6d4;">█</span><span style="color: #84cc16;">█</span>
<span style="color: #60a5fa;"> .\`                                 \`</span>
        `;
        
        this.addOutputLine(ascii);
    }

    cowsay(text) {
        if (!text) text = 'Hello from RetroOS!';
        
        const bubble = this.createSpeechBubble(text);
        const cow = `
${bubble}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
        `;
        
        this.addOutputLine(`<span style="color: #f59e0b;">${cow}</span>`);
    }

    createSpeechBubble(text) {
        const maxWidth = 40;
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxWidth) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    lines.push(word);
                }
            } else {
                currentLine += word + ' ';
            }
        });
        
        if (currentLine) {
            lines.push(currentLine.trim());
        }
        
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const border = '-'.repeat(maxLineLength + 2);
        
        let bubble = ` ${border}\n`;
        
        lines.forEach((line, index) => {
            const padding = ' '.repeat(maxLineLength - line.length);
            if (lines.length === 1) {
                bubble += `< ${line}${padding} >\n`;
            } else if (index === 0) {
                bubble += `/ ${line}${padding} \\\n`;
            } else if (index === lines.length - 1) {
                bubble += `\\ ${line}${padding} /\n`;
            } else {
                bubble += `| ${line}${padding} |\n`;
            }
        });
        
        bubble += ` ${border}`;
        return bubble;
    }

    showFortune() {
        const fortunes = [
            "The best way to predict the future is to invent it. - Alan Kay",
            "Code is like humor. When you have to explain it, it's bad. - Cory House",
            "First, solve the problem. Then, write the code. - John Johnson",
            "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
            "In order to be irreplaceable, one must always be different. - Coco Chanel",
            "Java is to JavaScript what car is to Carpet. - Chris Heilmann",
            "Knowledge is power. - Francis Bacon",
            "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code. - Dan Salomon",
            "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away. - Antoine de Saint-Exupery",
            "Ruby is rubbish! PHP is phpantastic! - Nikita Popov"
        ];
        
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        this.addOutputLine(`<span style="color: #a78bfa;">${randomFortune}</span>`);
    }

    startMatrix() {
        this.addOutputLine('<span style="color: #10b981;">Entering the Matrix...</span>');
        this.addOutputLine('<span style="color: #10b981;">Press Ctrl+C to exit</span>');
        
        const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        let matrixInterval;
        
        const startMatrix = () => {
            matrixInterval = setInterval(() => {
                let line = '';
                for (let i = 0; i < 50; i++) {
                    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                    const color = Math.random() > 0.7 ? '#ffffff' : '#10b981';
                    line += `<span style="color: ${color};">${char}</span>`;
                }
                this.addOutputLine(line);
            }, 100);
        };
        
        setTimeout(startMatrix, 1000);
        
        // Store interval for cleanup
        this.matrixInterval = matrixInterval;
    }

    interruptCommand() {
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
            this.matrixInterval = null;
            this.addOutputLine('<span style="color: #ef4444;">^C</span>');
            this.addOutputLine('<span style="color: #10b981;">Exited the Matrix</span>');
            this.addPromptLine();
        }
    }

    exitTerminal() {
        this.addOutputLine('<span style="color: #f59e0b;">Goodbye!</span>');
        
        setTimeout(() => {
            if (window.retroOS) {
                window.retroOS.closeApplication(this.windowId);
            }
        }, 1000);
    }

    navigateHistory(direction, input) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === -1) {
            // Up arrow
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            }
        } else {
            // Down arrow
            if (this.historyIndex > -1) {
                this.historyIndex--;
            }
        }
        
        if (this.historyIndex === -1) {
            input.value = '';
        } else {
            input.value = this.commandHistory[this.historyIndex];
        }
    }

    autoComplete(input) {
        const commands = [
            'help', 'clear', 'ls', 'cd', 'pwd', 'mkdir', 'rmdir', 'touch', 'rm', 'cat',
            'echo', 'date', 'whoami', 'uname', 'ps', 'top', 'history', 'env', 'export',
            'alias', 'which', 'man', 'grep', 'find', 'wget', 'curl', 'ping', 'neofetch',
            'cowsay', 'fortune', 'matrix', 'exit'
        ];
        
        const currentValue = input.value;
        const matches = commands.filter(cmd => cmd.startsWith(currentValue));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutputLine(matches.join('  '));
            this.addPromptLine();
        }
    }

    clearScreen() {
        const output = document.querySelector(`#${this.windowId} .terminal-output`);
        if (output) {
            output.innerHTML = '';
        }
    }

    addOutputLine(text) {
        const output = document.querySelector(`#${this.windowId} .terminal-output`);
        if (output) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = text;
            output.appendChild(line);
        }
    }

    addPromptLine() {
        this.updatePrompt();
    }

    updatePrompt() {
        const promptElement = document.querySelector(`#${this.windowId} .terminal-prompt`);
        if (promptElement) {
            promptElement.innerHTML = this.getPrompt();
        }
    }

    cleanup() {
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
        }
    }
}