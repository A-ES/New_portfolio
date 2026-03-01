// ============================
// SECTION NAVIGATION
// ============================
const sections = ['home', 'about', 'projects', 'skills', 'contact'];
let currentSection = 'home';

function navigateTo(sectionName) {
    // Remove active from all sections and nav items
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Activate requested section
    const sectionEl = document.getElementById(`section-${sectionName}`);
    const navEl = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
    if (sectionEl) sectionEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    currentSection = sectionName;

    // Update logo text
    const logoNames = {
        home: 'Developer',
        about: 'abrar-dev',
        projects: 'Developer',
        skills: 'Developer',
        contact: 'Developer'
    };
    document.getElementById('logo-text').textContent = logoNames[sectionName] || 'Developer';

    // Hide scroll hint after first navigation
    document.getElementById('scroll-hint').classList.add('hidden');
}

// Bottom nav clicks
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        navigateTo(btn.dataset.section);
    });
});

// ============================
// TYPEWRITER EFFECT
// ============================
const phrases = [
    'Full Stack Developer',
    'AI & Web Builder',
    'Hackathon Winner',
    'Problem Solver',
    'GDG Tech Lead'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeEl = document.getElementById('typewriter-text');

function typewrite() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
        typeEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typewrite, 500);
            return;
        }
        setTimeout(typewrite, 60);
    } else {
        typeEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
            isDeleting = true;
            setTimeout(typewrite, 2000);
            return;
        }
        setTimeout(typewrite, 100);
    }
}
setTimeout(typewrite, 1200);

// ============================
// DARK / LIGHT MODE TOGGLE
// ============================
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Restore saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
});

// ============================
// INTERACTIVE TERMINAL
// ============================
const terminalToggle = document.getElementById('terminal-toggle');
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalClose = document.getElementById('terminal-close');
const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');

const PROMPT = 'guest@abrar-portfolio:~$';
let cmdHistory = [];
let historyIndex = -1;

// Command definitions
const COMMANDS = {
    help: () => `Available commands:
  whoami          — Who is Abrar?
  about           — Bio & background
  skills          — Tech stack
  projects        — Project list
  achievements    — Awards & LeetCode
  experience      — Work experience
  contact         — Contact info
  ls              — List files
  cat [file]      — Read a file
  clear           — Clear terminal
  exit            — Close terminal`,

    whoami: () => 'Mohammed Abrar — Full Stack Developer based in Bangalore, India.',

    about: () =>
        `Name    : Mohammed Abrar
Location: Bangalore, India
Studying: @ Presidency University
Role    : Technical Lead, GDG
Goal    : Build impactful AI & web products`,

    skills: () =>
        `Frontend   : React.js, Next.js 14, TypeScript, Tailwind CSS
Backend    : Node.js, Express.js, REST APIs
Databases  : PostgreSQL, MongoDB, MySQL
AI/ML      : Gemini API, RAG, Scikit-learn
Tools      : Git, GitHub, Firebase, VS Code`,

    projects: () =>
        `ford/       — Feedback-to-Code CLI automation (JS, React, Node, GitHub API)
stylo-ai/   — AI Fashion Assistant (Next.js 14, Firebase, Gemini API)
wsga/       — Women Startup & Growth Analytics (React, Node, PostgreSQL)`,

    achievements: () =>
        `🏆 Winner   — Code and Solve Challenge, Presidency University
🥇 Top 6    — Agentathon Hackathon, PES University
🎖️  Finalist — Hack to Future, St. Joseph Engg. College
🎖️  Finalist — Quantamaze 2.0, NMIT
💻 300+     — LeetCode problems (Max Rating: 1564, Top 29% globally)`,

    experience: () =>
        `Software Dev Intern   Jun 2025 – Jul 2025
Pinnacle Labs
• Built full-stack modules with RESTful APIs
• 15+ production-ready commits
• Improved feature delivery by 25%

Tech Lead, GDG               Jan 2025 – Present
Presidency University
• Led 20+ student developers
• Organised workshops, hackathons & speaker sessions`,

    contact: () =>
        `Email  : mohammedabrar934@gmail.com
GitHub : github.com/A-ES
LinkedIn: linkedin.com/in/mohammed-abrar-ba0222304
Discord: Hades3002
Location: Bangalore, India`,

    ls: (args) => {
        if (!args || args.trim() === '') {
            return 'about.txt  contact.txt  projects/  skills.txt  achievements.txt';
        }
        const dir = args.trim().replace(/\/$/, '');
        const dirs = {
            'projects': 'ford/  stylo-ai/  wsga/',
        };
        return dirs[dir] || `ls: cannot access '${dir}': No such file or directory`;
    },

    cat: (args) => {
        if (!args) return 'cat: missing file operand';
        const file = args.trim();
        const files = {
            'about.txt': "I'm Mohammed Abrar, a Full Stack Developer in Bangalore.\nBuilding impactful products at the intersection of AI and web.",
            'contact.txt': 'Email: mohammedabrar934@gmail.com\nGitHub: github.com/A-ES\nDiscord: Hades3002',
            'skills.txt': 'React.js, Next.js, TypeScript, Node.js, PostgreSQL, MongoDB, Firebase, Gemini AI, Python, Git',
            'achievements.txt': 'Winner - Code and Solve, 300+ LeetCode (Rating 1564), Top 6 Agentathon PES, Finalist Hack to Future & Quantamaze',
        };
        return files[file] || `cat: ${file}: No such file or directory`;
    },

    clear: () => { terminalBody.innerHTML = ''; return null; },

    exit: () => { closeTerminal(); return null; },
};

function appendOutput(cmd, output) {
    // Print the entered command line
    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.innerHTML = `<span class="term-prompt">${PROMPT}</span><span class="term-cmd"> ${escapeHtml(cmd)}</span>`;
    terminalBody.appendChild(cmdLine);

    // Print output (if any)
    if (output !== null && output !== undefined) {
        const out = document.createElement('div');
        out.className = 'terminal-output';
        out.textContent = output;
        terminalBody.appendChild(out);
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Save to history
    cmdHistory.unshift(trimmed);
    historyIndex = -1;

    const [cmd, ...argParts] = trimmed.split(/\s+/);
    const args = argParts.join(' ');
    const handler = COMMANDS[cmd.toLowerCase()];

    if (handler) {
        const output = handler(args);
        appendOutput(trimmed, output);
    } else {
        appendOutput(trimmed, `${cmd}: command not found. Type 'help' for available commands.`);
    }
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        runCommand(val);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
            historyIndex++;
            terminalInput.value = cmdHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = cmdHistory[historyIndex];
        } else {
            historyIndex = -1;
            terminalInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Basic tab completion
        const partial = terminalInput.value.trim();
        const matches = Object.keys(COMMANDS).filter(c => c.startsWith(partial));
        if (matches.length === 1) terminalInput.value = matches[0];
    }
});

// Clicking anywhere in terminal focuses input
terminalOverlay.addEventListener('click', (e) => {
    if (e.target !== terminalClose) terminalInput.focus();
});

function openTerminal() {
    terminalOverlay.classList.add('active');

    // Show welcome banner only if terminal body is empty
    if (terminalBody.children.length === 0) {
        const banner = document.createElement('div');
        banner.className = 'terminal-output terminal-welcome';
        banner.textContent = 'Welcome! Type help to see available commands.';
        terminalBody.appendChild(banner);
    }

    terminalInput.focus();
}

function closeTerminal() {
    terminalOverlay.classList.remove('active');
}

terminalToggle.addEventListener('click', openTerminal);
terminalClose.addEventListener('click', closeTerminal);

// Escape closes terminal, but don't hijack if not open
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalOverlay.classList.contains('active')) {
        e.stopPropagation();
        closeTerminal();
    }
});

// ============================
// PROJECT FILTER
// ============================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.project-card').forEach(card => {
            if (filter === 'all' || card.dataset.type === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeSlideIn 0.35s ease both';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ============================
// SCROLL HINT
// ============================
const scrollHint = document.getElementById('scroll-hint');
let scrollHintVisible = true;
setTimeout(() => {
    if (scrollHintVisible) {
        scrollHint.classList.add('hidden');
    }
}, 4000);

// ============================
// KEYBOARD SHORTCUTS
// ============================
document.addEventListener('keydown', (e) => {
    if (terminalOverlay.classList.contains('active')) return;
    const idx = sections.indexOf(currentSection);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateTo(sections[(idx + 1) % sections.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateTo(sections[(idx - 1 + sections.length) % sections.length]);
    }
});
