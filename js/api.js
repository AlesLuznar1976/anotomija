// ============================================
// API - Anthropic Claude API integracija
// ============================================

const API = {
    KEY_STORAGE: 'anatomij-ai-apikey',
    MODEL: 'claude-sonnet-4-6',
    API_URL: 'https://api.anthropic.com/v1/messages',

    getKey() {
        return localStorage.getItem(this.KEY_STORAGE) || '';
    },

    setKey(key) {
        localStorage.setItem(this.KEY_STORAGE, key);
    },

    hasKey() {
        return !!this.getKey();
    },

    async callClaude(prompt, maxTokens = 4000) {
        const key = this.getKey();
        if (!key) throw new Error('API kljuc ni nastavljen.');

        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: this.MODEL,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error('Neveljaven API kljuc.');
            if (response.status === 429) throw new Error('Prekoracena omejitev zahtevkov. Pocakaj nekaj sekund.');
            throw new Error(err.error?.message || `Napaka API (${response.status})`);
        }

        const data = await response.json();
        const textBlock = data.content?.find(b => b.type === 'text');
        return textBlock?.text || '';
    },

    async validateKey(key) {
        const prev = this.getKey();
        this.setKey(key);
        try {
            await this.callClaude('Odgovori samo z besedo "ok".', 10);
            return true;
        } catch {
            this.setKey(prev);
            return false;
        }
    },

    async generateLesson(topic) {
        const prompt = `Si profesor anatomije. Pripravi kratko lekcijo (5-8 odstavkov) o temi "${topic.name}: ${topic.description}" v slovenscini.

Vsebina naj vsebuje:
- Uvod v temo
- Kljucne anatomske strukture
- Funkcije in delovanje
- Klinicni pomen
- Zanimivosti

Uporabi naslove (## in ###) in poudarke (**krepko**). Pisi jasno in razumljivo za studente.`;

        return await this.callClaude(prompt, 3000);
    },

    async generateQuiz(topic, count = 8) {
        const prompt = `Si profesor anatomije. Generiraj kviz o temi "${topic.name}: ${topic.description}" v slovenscini.

Generiraj natanko ${count} vprasanj v JSON formatu. Mesaj razlicne tipe:
- "mc" (multiple choice) - 3-4 vprasanja
- "tf" (true/false) - 2-3 vprasanja
- "open" (odprti odgovor) - 1-2 vprasanja

Format JSON (brez dodatnega besedila, samo JSON):
[
  {
    "type": "mc",
    "question": "Vprasanje?",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Razlaga pravilnega odgovora."
  },
  {
    "type": "tf",
    "question": "Trditev za presojo?",
    "correct": true,
    "explanation": "Razlaga."
  },
  {
    "type": "open",
    "question": "Vprasanje za odprti odgovor?",
    "answer": "Pricakovani odgovor (kljucne tocke).",
    "explanation": "Podrobna razlaga."
  }
]

Kljucne besede teme: ${topic.keywords.join(', ')}
Vprasanja naj bodo razlicna in pokrivajo razlicne vidike teme. Odgovori SAMO z JSON.`;

        const response = await this.callClaude(prompt, 4000);
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('Ni JSON odgovora');
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            throw new Error('Napaka pri razclenitvanju vprasanj: ' + e.message);
        }
    },

    async evaluateAnswer(question, userAnswer) {
        const prompt = `Oceni odgovor studenta na vprasanje iz anatomije. Odgovori v slovenscini.

Vprasanje: ${question}
Odgovor studenta: ${userAnswer}

Oceni ali je odgovor pravilen, delno pravilen ali napacen.
Odgovori v JSON formatu (samo JSON):
{
  "correct": true/false,
  "partial": true/false,
  "feedback": "Podrobna razlaga in popravki."
}`;

        const response = await this.callClaude(prompt, 500);
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Ni JSON');
            return JSON.parse(jsonMatch[0]);
        } catch {
            return { correct: false, partial: false, feedback: 'Napaka pri ocenjevanju. Poskusi znova.' };
        }
    },

    async generateFlashcards(topic, count = 10, withImages = false) {
        const prompt = `Si profesor anatomije. Generiraj ${count} kartic (flashcards) za ucenje teme "${topic.name}: ${topic.description}" v slovenscini.

Format JSON (brez dodatnega besedila, samo JSON):
[
  {
    "term": "Pojem ali struktura",
    "definition": "Jasna in jedrnata razlaga pojma (1-3 stavki)."
  }
]

Kljucne besede: ${topic.keywords.join(', ')}
Kartice naj pokrivajo razlicne vidike teme. Odgovori SAMO z JSON.`;

        const response = await this.callClaude(prompt, 3000);
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('Ni JSON');
            let cards = JSON.parse(jsonMatch[0]);

            // Assign random images to cards if requested
            if (withImages && topic.images && topic.images.length > 0) {
                const shuffledImages = [...topic.images].sort(() => Math.random() - 0.5);
                cards = cards.map((card, i) => ({
                    ...card,
                    image: shuffledImages[i % shuffledImages.length]
                }));
            }

            return cards;
        } catch (e) {
            throw new Error('Napaka pri generiranju kartic: ' + e.message);
        }
    }
};
