// ============================================
// UI - Uporabniski vmesnik, animacije, pomocniki
// ============================================

const UI = {
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            section.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    showLoading(text = 'Nalagam...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    },

    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    confetti() {
        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#f472b6'];
        for (let i = 0; i < 40; i++) {
            const el = document.createElement('div');
            el.className = 'confetti';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.animationDelay = Math.random() * 2 + 's';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            el.style.width = (6 + Math.random() * 8) + 'px';
            el.style.height = (6 + Math.random() * 8) + 'px';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 5000);
        }
    },

    formatMarkdown(text) {
        return text
            .replace(/### (.+)/g, '<h4>$1</h4>')
            .replace(/## (.+)/g, '<h3>$1</h3>')
            .replace(/# (.+)/g, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)/gm, '<li>$2</li>')
            .replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }
};
