// ============================================
// App - Glavni modul, navigacija, inicializacija
// ============================================

const App = {
    selectedTopic: null,

    init() {
        Learn.init();
        Quiz.init();
        Flashcards.init();
        this.initSetup();
        this.initHome();
        this.initSettings();

        // Check if API key exists
        if (API.hasKey()) {
            UI.showSection('section-home');
            this.renderTopics();
            Progress.renderOverview();
        } else {
            UI.showSection('section-setup');
        }
    },

    initSetup() {
        const keyInput = document.getElementById('api-key-input');
        const toggleBtn = document.getElementById('toggle-key-visibility');

        // Load saved key
        keyInput.value = API.getKey();

        toggleBtn.addEventListener('click', () => {
            keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
        });

        document.getElementById('btn-save-key').addEventListener('click', async () => {
            const key = keyInput.value.trim();
            if (!key) {
                UI.toast('Vnesi API kljuc.', 'error');
                return;
            }

            UI.showLoading('Preverjam API kljuc...');
            const valid = await API.validateKey(key);
            UI.hideLoading();

            if (valid) {
                UI.toast('API kljuc shranjen!', 'success');
                UI.showSection('section-home');
                this.renderTopics();
                Progress.renderOverview();
            } else {
                UI.toast('Neveljaven API kljuc. Preveri in poskusi znova.', 'error');
            }
        });
    },

    initHome() {
        document.getElementById('btn-learn').addEventListener('click', () => {
            if (this.selectedTopic) Learn.start(this.selectedTopic);
        });

        document.getElementById('btn-quiz').addEventListener('click', () => {
            if (this.selectedTopic) Quiz.start(this.selectedTopic);
        });

        document.getElementById('btn-flashcards').addEventListener('click', () => {
            if (this.selectedTopic) Flashcards.start(this.selectedTopic, false);
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('settings-api-key').value = API.getKey();
            UI.showSection('section-settings');
        });
    },

    initSettings() {
        const settingsKeyInput = document.getElementById('settings-api-key');
        document.getElementById('toggle-settings-key').addEventListener('click', () => {
            settingsKeyInput.type = settingsKeyInput.type === 'password' ? 'text' : 'password';
        });

        document.getElementById('btn-update-key').addEventListener('click', async () => {
            const key = settingsKeyInput.value.trim();
            if (!key) {
                UI.toast('Vnesi API kljuc.', 'error');
                return;
            }

            UI.showLoading('Preverjam API kljuc...');
            const valid = await API.validateKey(key);
            UI.hideLoading();

            if (valid) {
                UI.toast('API kljuc posodobljen!', 'success');
            } else {
                UI.toast('Neveljaven API kljuc.', 'error');
            }
        });

        document.getElementById('btn-clear-data').addEventListener('click', () => {
            if (confirm('Ali res zelis ponastavi vse podatke?')) {
                Progress.clear();
                localStorage.removeItem(API.KEY_STORAGE);
                UI.toast('Podatki ponastavljeni.', 'info');
                UI.showSection('section-setup');
                document.getElementById('api-key-input').value = '';
            }
        });

        document.getElementById('btn-back-settings').addEventListener('click', () => {
            UI.showSection('section-home');
        });
    },

    renderTopics() {
        const grid = document.getElementById('topics-grid');
        grid.innerHTML = '';

        TOPICS.forEach(topic => {
            const stats = Progress.getTopicStats(topic.id);
            const percent = stats.totalQuestions > 0
                ? Math.round((stats.totalScore / stats.totalQuestions) * 100)
                : 0;

            const card = document.createElement('div');
            card.className = 'topic-card';
            card.dataset.id = topic.id;
            card.innerHTML = `
                <div class="topic-icon">${topic.icon}</div>
                <h3>${topic.name}</h3>
                <p>${topic.description}</p>
                ${stats.quizzes > 0 ? `
                    <div class="topic-progress">
                        <div class="topic-progress-fill" style="width:${percent}%"></div>
                    </div>
                ` : ''}
            `;

            card.addEventListener('click', () => this.selectTopic(topic));
            grid.appendChild(card);
        });
    },

    selectTopic(topic) {
        this.selectedTopic = topic;

        document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
        const card = document.querySelector(`.topic-card[data-id="${topic.id}"]`);
        if (card) card.classList.add('selected');

        const actions = document.getElementById('topic-actions');
        actions.classList.remove('hidden');
        document.getElementById('selected-topic-name').textContent = topic.name;
        document.getElementById('selected-topic-desc').textContent = topic.description;
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
