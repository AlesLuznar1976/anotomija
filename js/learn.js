// ============================================
// Learn - Ucenje s karticami in slikami
// ============================================

const Learn = {
    currentTopic: null,
    cards: [],
    currentIndex: 0,
    known: 0,
    total: 0,
    isFlipped: false,

    async start(topic) {
        this.currentTopic = topic;
        this.currentIndex = 0;
        this.known = 0;
        this.isFlipped = false;

        UI.showSection('section-learn');
        document.getElementById('learn-title').textContent = topic.name;
        document.getElementById('learn-flashcards').innerHTML = '';

        const count = Math.min(topic.images?.length || 10, 15);

        UI.showLoading('AI pripravlja ucne kartice...');
        try {
            this.cards = await API.generateFlashcards(topic, count, true);
            this.total = this.cards.length;
            this.buildUI();
            this.renderCard();
        } catch (err) {
            document.getElementById('learn-flashcards').innerHTML =
                `<p style="color:var(--danger)">Napaka: ${err.message}</p>`;
            UI.toast(err.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    buildUI() {
        const container = document.getElementById('learn-flashcards');
        container.innerHTML = `
            <div class="inline-fc-progress">
                <span id="inline-fc-progress-text">1 / ${this.total}</span>
                <span id="inline-fc-score" class="inline-fc-score"></span>
            </div>
            <div class="inline-fc-container">
                <div id="inline-fc-card" class="flashcard has-image">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <p id="inline-fc-term"></p>
                            <small>Klikni za odgovor</small>
                        </div>
                        <div class="flashcard-back">
                            <img id="inline-fc-img" class="flashcard-back-img" src="" alt="" style="display:none">
                            <p id="inline-fc-definition"></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="inline-fc-actions">
                <button id="inline-fc-dont-know" class="btn btn-danger">Ne znam</button>
                <button id="inline-fc-know" class="btn btn-success">Znam</button>
            </div>
            <div id="inline-fc-done" class="inline-fc-done hidden"></div>
        `;

        document.getElementById('inline-fc-card').addEventListener('click', () => this.flip());
        document.getElementById('inline-fc-know').addEventListener('click', () => this.mark(true));
        document.getElementById('inline-fc-dont-know').addEventListener('click', () => this.mark(false));
    },

    renderCard() {
        if (this.currentIndex >= this.cards.length) {
            this.showSummary();
            return;
        }

        const card = this.cards[this.currentIndex];
        this.isFlipped = false;
        document.getElementById('inline-fc-card').classList.remove('flipped');

        document.getElementById('inline-fc-term').textContent = card.term;
        document.getElementById('inline-fc-definition').textContent = card.definition;
        document.getElementById('inline-fc-progress-text').textContent =
            `${this.currentIndex + 1} / ${this.total}`;

        const imgEl = document.getElementById('inline-fc-img');
        if (card.image) {
            imgEl.src = card.image;
            imgEl.style.display = '';
        } else {
            imgEl.style.display = 'none';
        }
    },

    flip() {
        this.isFlipped = !this.isFlipped;
        document.getElementById('inline-fc-card').classList.toggle('flipped', this.isFlipped);
    },

    mark(known) {
        if (known) this.known++;
        this.currentIndex++;
        document.getElementById('inline-fc-score').textContent = `${this.known} pravilnih`;
        this.renderCard();
    },

    showSummary() {
        const percent = Math.round((this.known / this.total) * 100);

        document.querySelector('.inline-fc-container').style.display = 'none';
        document.querySelector('.inline-fc-actions').style.display = 'none';

        const done = document.getElementById('inline-fc-done');
        done.classList.remove('hidden');

        let icon = percent >= 80 ? '\uD83C\uDF89' : percent >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCDA';
        done.innerHTML = `
            <div class="inline-fc-result">
                <span class="inline-fc-icon">${icon}</span>
                <span class="inline-fc-result-text">Rezultat: ${this.known} / ${this.total} (${percent}%)</span>
            </div>
            <div style="margin-top:1.5rem; display:flex; gap:1rem; justify-content:center;">
                <button class="btn btn-primary" onclick="Learn.start(Learn.currentTopic)">Ponovi</button>
                <button class="btn btn-secondary" onclick="if(Learn.currentTopic) Quiz.start(Learn.currentTopic)">Preveri znanje</button>
                <button class="btn btn-secondary" onclick="UI.showSection('section-home')">Domov</button>
            </div>
        `;

        if (percent >= 80) UI.confetti();
        Progress.recordFlashcards(this.currentTopic.id, this.known, this.total);
    },

    init() {
        document.getElementById('btn-back-learn').addEventListener('click', () => {
            UI.showSection('section-home');
        });
    }
};
