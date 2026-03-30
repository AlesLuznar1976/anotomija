# AnatomijAI - Spletna ucna aplikacija za anatomijo

## Opis projekta
Spletna aplikacija za ucenje anatomije z AI-generiranimi vprasanji.
Uporablja Anthropic Claude API za generiranje ucnih vsebin in kvizov.

## Tehnologija
- Vanilla HTML/CSS/JS (brez frameworka)
- Anthropic Claude API (direktni fetch klici iz brskalnika)
- GitHub Pages hosting
- localStorage za persistenco (API kljuc, napredek)

## Struktura
- `index.html` - glavna stran
- `css/style.css` - stili
- `js/` - JS moduli (app, api, topics, quiz, flashcards, learn, progress, ui)

## Jezik
- Vmesnik in vsebina v slovenscini
- API klici v slovenscini (Claude odgovarja v slovenscini)

## Pomembno
- API kljuc vnese uporabnik sam (ni backend serverja)
- Vprasanja se generirajo ob vsakem obisku (vedno nova)
- Model: claude-sonnet-4-6 (optimalno za hitrost/kvaliteto)
- Teme so razsirljive - definirane v topics.js
