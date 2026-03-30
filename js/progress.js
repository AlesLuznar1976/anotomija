// ============================================
// Progress - Sledenje napredku
// ============================================

const Progress = {
    KEY: 'anatomij-ai-progress',

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.KEY)) || {};
        } catch {
            return {};
        }
    },

    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    recordQuiz(topicId, score, total) {
        const data = this.load();
        if (!data[topicId]) {
            data[topicId] = { quizzes: 0, totalScore: 0, totalQuestions: 0, flashcards: 0 };
        }
        data[topicId].quizzes++;
        data[topicId].totalScore += score;
        data[topicId].totalQuestions += total;
        this.save(data);
    },

    recordFlashcards(topicId, known, total) {
        const data = this.load();
        if (!data[topicId]) {
            data[topicId] = { quizzes: 0, totalScore: 0, totalQuestions: 0, flashcards: 0 };
        }
        data[topicId].flashcards++;
        this.save(data);
    },

    getTopicStats(topicId) {
        const data = this.load();
        return data[topicId] || { quizzes: 0, totalScore: 0, totalQuestions: 0, flashcards: 0 };
    },

    getOverallStats() {
        const data = this.load();
        let quizzes = 0, totalScore = 0, totalQuestions = 0, flashcards = 0;
        for (const topic of Object.values(data)) {
            quizzes += topic.quizzes;
            totalScore += topic.totalScore;
            totalQuestions += topic.totalQuestions;
            flashcards += topic.flashcards;
        }
        const avgPercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        return { quizzes, totalScore, totalQuestions, flashcards, avgPercent };
    },

    clear() {
        localStorage.removeItem(this.KEY);
    },

    renderOverview() {
        const stats = this.getOverallStats();
        const container = document.getElementById('progress-overview');
        if (stats.quizzes === 0 && stats.flashcards === 0) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = `
            <div class="progress-stat">
                <div class="stat-value">${stats.quizzes}</div>
                <div class="stat-label">Kvizov resenih</div>
            </div>
            <div class="progress-stat">
                <div class="stat-value">${stats.avgPercent}%</div>
                <div class="stat-label">Povprecje</div>
            </div>
            <div class="progress-stat">
                <div class="stat-value">${stats.flashcards}</div>
                <div class="stat-label">Kartice</div>
            </div>
        `;
    }
};
