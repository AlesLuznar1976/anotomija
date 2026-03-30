// ============================================
// Flashcards - Modul za ucne kartice (z/brez slik)
// ============================================

const Flashcards = {
    currentTopic: null,
    cards: [],
    currentIndex: 0,
    known: [],
    unknown: [],
    isFlipped: false,
    withImages: false,

    async start(topic, withImages = false) {
        this.currentTopic = topic;
        this.withImages = withImages;
        this.currentIndex = 0;
        this.known = [];
        this.unknown = [];
        this.isFlipped = false;

        UI.showSection('section-flashcards');
        const title = withImages ? `Kartice s slikami: ${topic.name}` : `Kartice: ${topic.name}`;
        document.getElementById('flashcards-title').textContent = title;
        document.getElementById('flashcards-summary').classList.add('hidden');
        document.getElementById('flashcard-container').style.display = '';
        document.querySelector('.flashcard-actions').style.display = '';

        // Toggle image mode class on flashcard
        document.getElementById('flashcard').classList.toggle('has-image', withImages);

        UI.showLoading('AI pripravlja kartice...');
        try {
            const count = withImages ? Math.min(topic.images?.length || 10, 12) : 10;
            this.cards = await API.generateFlashcards(topic, count, withImages);
            this.renderCard();
        } catch (err) {
            document.getElementById('flashcard-term').textContent = 'Napaka: ' + err.message;
            document.getElementById('flashcard-img').style.display = 'none';
            UI.toast(err.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    renderCard() {
        if (this.currentIndex >= this.cards.length) {
            this.showSummary();
            return;
        }

        const card = this.cards[this.currentIndex];
        this.isFlipped = false;
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.remove('flipped');

        document.getElementById('flashcard-term').textContent = card.term;
        document.getElementById('flashcard-definition').textContent = card.definition;
        document.getElementById('flashcards-progress-text').textContent =
            `${this.currentIndex + 1} / ${this.cards.length}`;

        // Show/hide image on back
        const imgEl = document.getElementById('flashcard-img');
        if (card.image) {
            imgEl.src = card.image;
            imgEl.style.display = '';
        } else {
            imgEl.style.display = 'none';
            imgEl.src = '';
        }
    },

    flip() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.toggle('flipped', this.isFlipped);
    },

    markKnown() {
        if (this.currentIndex < this.cards.length) {
            this.known.push(this.cards[this.currentIndex]);
            this.currentIndex++;
            this.renderCard();
        }
    },

    markUnknown() {
        if (this.currentIndex < this.cards.length) {
            this.unknown.push(this.cards[this.currentIndex]);
            this.currentIndex++;
            this.renderCard();
        }
    },

    showSummary() {
        Progress.recordFlashcards(this.currentTopic.id, this.known.length, this.cards.length);

        document.getElementById('flashcard-container').style.display = 'none';
        document.querySelector('.flashcard-actions').style.display = 'none';

        const summary = document.getElementById('flashcards-summary');
        summary.classList.remove('hidden');
        document.getElementById('fc-summary-text').textContent =
            `Znas: ${this.known.length} / ${this.cards.length}. Ne znas: ${this.unknown.length}.`;

        const retryBtn = document.getElementById('btn-fc-retry');
        retryBtn.style.display = this.unknown.length > 0 ? '' : 'none';
    },

    retryUnknown() {
        if (this.unknown.length === 0) return;
        this.cards = [...this.unknown];
        this.unknown = [];
        this.known = [];
        this.currentIndex = 0;
        this.isFlipped = false;

        document.getElementById('flashcards-summary').classList.add('hidden');
        document.getElementById('flashcard-container').style.display = '';
        document.querySelector('.flashcard-actions').style.display = '';
        document.getElementById('flashcard').classList.toggle('has-image', this.withImages);
        this.renderCard();
    },

    init() {
        document.getElementById('flashcard').addEventListener('click', () => this.flip());
        document.getElementById('btn-fc-know').addEventListener('click', () => this.markKnown());
        document.getElementById('btn-fc-dont-know').addEventListener('click', () => this.markUnknown());
        document.getElementById('btn-fc-retry').addEventListener('click', () => this.retryUnknown());
        document.getElementById('btn-fc-home').addEventListener('click', () => {
            UI.showSection('section-home');
            Progress.renderOverview();
        });
        document.getElementById('btn-back-flashcards').addEventListener('click', () => {
            UI.showSection('section-home');
        });
    }
};
