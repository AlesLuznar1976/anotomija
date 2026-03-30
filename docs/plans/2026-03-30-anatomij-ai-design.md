# AnatomijAI - Dizajn dokument

## Povzetek
Spletna aplikacija za ucenje anatomije z AI-generiranimi vprasanji.
Anthropic Claude API generira ucne vsebine, kvize in kartice ob vsakem obisku.

## Arhitektura
- Vanilla HTML/CSS/JS, brez frameworka
- GitHub Pages hosting (brezplacno)
- Anthropic Claude API (claude-sonnet-4-6) za vsebino
- localStorage za API kljuc in napredek

## Moduli
- **topics.js** - Definicije tem (razsirljivo)
- **api.js** - Anthropic API klici
- **ui.js** - UI pomocniki, animacije
- **progress.js** - Sledenje napredku
- **learn.js** - Ucni modul (AI lekcije)
- **quiz.js** - Kviz (multiple choice, true/false, odprti odgovori)
- **flashcards.js** - Kartice z flip animacijo
- **app.js** - Navigacija, stanje, inicializacija

## Tipi vprasanj
1. Multiple choice (A/B/C/D)
2. True/False
3. Odprti odgovor (AI oceni)
4. Flashcards (pojem/razlaga)

## Dizajn
- Temno ozadje z modro-vijolicnim gradientom
- Kartice z backdrop-filter blur
- Smooth CSS animacije in prehodi
- Responsiven (mobile-first)
- Konfeti efekt za dobre rezultate
