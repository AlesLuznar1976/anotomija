// ============================================
// Quiz - Kviz modul z 4 tipi vprasanj
// ============================================

const Quiz = {
    currentTopic: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],

    async start(topic) {
        this.currentTopic = topic;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];

        UI.showSection('section-quiz');
        document.getElementById('quiz-title').textContent = `Kviz: ${topic.name}`;
        document.getElementById('quiz-container').innerHTML = '';

        UI.showLoading('AI pripravlja vprasanja...');
        try {
            this.questions = await API.generateQuiz(topic);
            this.renderQuestion();
        } catch (err) {
            document.getElementById('quiz-container').innerHTML =
                `<p style="color:var(--danger)">Napaka: ${err.message}</p>`;
            UI.toast(err.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    updateProgress() {
        const total = this.questions.length;
        const current = this.currentIndex + 1;
        document.getElementById('quiz-progress-text').textContent = `${current} / ${total}`;
        document.getElementById('quiz-progress-bar').style.width =
            `${(current / total) * 100}%`;
    },

    renderQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const q = this.questions[this.currentIndex];
        this.updateProgress();
        const container = document.getElementById('quiz-container');

        let typeLabel, badgeClass;
        switch (q.type) {
            case 'mc': typeLabel = 'Izberi odgovor'; badgeClass = 'badge-mc'; break;
            case 'tf': typeLabel = 'Res ali ne'; badgeClass = 'badge-tf'; break;
            case 'open': typeLabel = 'Odprti odgovor'; badgeClass = 'badge-open'; break;
            default: typeLabel = 'Vprasanje'; badgeClass = 'badge-mc';
        }

        let html = `
            <div class="question-card">
                <span class="question-type-badge ${badgeClass}">${typeLabel}</span>
                <p class="question-text">${q.question}</p>
        `;

        if (q.type === 'mc') {
            html += '<div class="options-list">';
            const letters = ['A', 'B', 'C', 'D'];
            q.options.forEach((opt, i) => {
                html += `
                    <button class="option-btn" data-index="${i}">
                        <span class="option-letter">${letters[i]}</span>
                        <span>${opt}</span>
                    </button>`;
            });
            html += '</div>';
        } else if (q.type === 'tf') {
            html += `
                <div class="tf-buttons">
                    <button class="tf-btn" data-value="true">Res</button>
                    <button class="tf-btn" data-value="false">Ni res</button>
                </div>`;
        } else if (q.type === 'open') {
            html += `
                <textarea class="open-answer-area" placeholder="Vpisi svoj odgovor..."></textarea>
                <button class="btn btn-primary" id="btn-submit-open">Oddaj odgovor</button>`;
        }

        html += '<div id="feedback-area"></div></div>';
        container.innerHTML = html;

        if (q.type === 'mc') {
            container.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => this.handleMC(parseInt(btn.dataset.index)));
            });
        } else if (q.type === 'tf') {
            container.querySelectorAll('.tf-btn').forEach(btn => {
                btn.addEventListener('click', () => this.handleTF(btn.dataset.value === 'true'));
            });
        } else if (q.type === 'open') {
            document.getElementById('btn-submit-open').addEventListener('click', () => {
                const answer = container.querySelector('.open-answer-area').value.trim();
                if (answer) this.handleOpen(answer);
                else UI.toast('Vnesi odgovor.', 'error');
            });
        }
    },

    handleMC(selectedIndex) {
        const q = this.questions[this.currentIndex];
        const correct = selectedIndex === q.correct;
        const buttons = document.querySelectorAll('.option-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            const idx = parseInt(btn.dataset.index);
            if (idx === q.correct) btn.classList.add('correct');
            if (idx === selectedIndex && !correct) btn.classList.add('incorrect');
        });

        if (correct) this.score++;
        this.answers.push({ question: q.question, correct, type: 'mc' });
        this.showFeedback(correct, q.explanation);
    },

    handleTF(userAnswer) {
        const q = this.questions[this.currentIndex];
        const correct = userAnswer === q.correct;
        const buttons = document.querySelectorAll('.tf-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            const val = btn.dataset.value === 'true';
            if (val === q.correct) btn.classList.add('correct');
            if (val === userAnswer && !correct) btn.classList.add('incorrect');
        });

        if (correct) this.score++;
        this.answers.push({ question: q.question, correct, type: 'tf' });
        this.showFeedback(correct, q.explanation);
    },

    async handleOpen(userAnswer) {
        const q = this.questions[this.currentIndex];
        document.getElementById('btn-submit-open').disabled = true;
        document.querySelector('.open-answer-area').disabled = true;

        UI.showLoading('AI ocenjuje odgovor...');
        try {
            const evaluation = await API.evaluateAnswer(q.question, userAnswer);
            const correct = evaluation.correct;
            if (correct) this.score++;
            this.answers.push({ question: q.question, correct, type: 'open' });

            const feedback = evaluation.feedback || q.explanation;
            this.showFeedback(correct, feedback);
        } catch (err) {
            this.answers.push({ question: q.question, correct: false, type: 'open' });
            this.showFeedback(false, q.explanation || 'Napaka pri ocenjevanju.');
        } finally {
            UI.hideLoading();
        }
    },

    showFeedback(correct, explanation) {
        const area = document.getElementById('feedback-area');
        area.innerHTML = `
            <div class="feedback ${correct ? 'correct' : 'incorrect'}">
                <div class="feedback-title">${correct ? 'Pravilno!' : 'Napacno!'}</div>
                <p>${explanation}</p>
                <button class="btn btn-primary" id="btn-next-question">
                    ${this.currentIndex < this.questions.length - 1 ? 'Naslednje vprasanje' : 'Poglej rezultate'}
                </button>
            </div>
        `;

        document.getElementById('btn-next-question').addEventListener('click', () => {
            this.currentIndex++;
            this.renderQuestion();
        });
    },

    showResults() {
        const total = this.questions.length;
        const percent = Math.round((this.score / total) * 100);

        Progress.recordQuiz(this.currentTopic.id, this.score, total);

        let icon, message;
        if (percent >= 80) {
            icon = '\uD83C\uDF89';
            message = 'Odlicno! Snov dobro obvladas.';
            UI.confetti();
        } else if (percent >= 60) {
            icon = '\uD83D\uDC4D';
            message = 'Dobro! Se malo vaje in bo odlicno.';
        } else {
            icon = '\uD83D\uDCDA';
            message = 'Ponovi snov in poskusi znova.';
        }

        UI.showSection('section-results');
        document.getElementById('results-icon').textContent = icon;
        document.getElementById('results-score').textContent = `${this.score} / ${total} (${percent}%)`;

        let detailsHtml = `<p>${message}</p><div style="margin-top:1rem; text-align:left;">`;
        this.answers.forEach((a, i) => {
            const mark = a.correct ? '\u2705' : '\u274C';
            detailsHtml += `<p>${mark} ${a.question}</p>`;
        });
        detailsHtml += '</div>';
        document.getElementById('results-details').innerHTML = detailsHtml;
    },

    init() {
        document.getElementById('btn-back-quiz').addEventListener('click', () => {
            UI.showSection('section-home');
        });

        document.getElementById('btn-retry-quiz').addEventListener('click', () => {
            if (this.currentTopic) this.start(this.currentTopic);
        });

        document.getElementById('btn-results-home').addEventListener('click', () => {
            UI.showSection('section-home');
            Progress.renderOverview();
        });
    }
};
