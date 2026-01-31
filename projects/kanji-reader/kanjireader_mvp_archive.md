# KanjiReader MVP Archive

## 1. MVP Description
The current Minimum Viable Product (MVP) of KanjiReader extracts text from an image, displays the full text, and separates it into individual words, presented as tappable cards with their romaji pronunciation (e.g., "わたしは, watashiha,").

## 2. Screenshot
(Refer to the attached image in the chat for visual reference)

## 3. OCR Text
```
< Back
Results
Full text:
SUNG SDS
わたしは、なにをしたのか。それとも、なにを
しなかったのか。
それを思い出して書こうとしている。感じたこ
と、思ったことも、書こう。
毎日、似たような日かもしれないけれど、それ
はそれで、わたしは思い出して、書こう。
生きてるって、もしかして、そういうことかも
しれない。
この日のわたしは、この日にしかいない。未来
のわたしに、忘れないでと伝えよう。
糸井重里が『handwrite この日、わたしは。』の
中で
SAMSUNG SDS
Words: (tap to learn)
わたしは、
watashiha,
なにを したのか。
naniwo
shitanoka.
Scan Again
```

## 4. Problems Identified with Current Approach

-   **Contextual Understanding:**
    -   Couldn't listen to the entire text as one sentence.
    -   Scrolling word by word causes loss of context.
    -   Individual word meanings are often incorrect when taken out of sentence context (e.g., "したのか" meaning "tongue" instead of "to do").
-   **Learning Experience:**
    -   English pronunciation is not directly below the Kanji cards, which defeats the purpose of the cards for quick reference.

## 5. Ideal Configuration (Future State)

-   **Pronunciation:**
    -   English pronunciations displayed just below the extracted Japanese text.
-   **Audio Playback:**
    -   A speaker button at the end of the Japanese text to listen to the entire sentence.
-   **Translation:**
    -   The entire English translation displayed below the Japanese text and pronunciation.
-   **Word Interaction:**
    -   Tapping on a word should show a detailed card/popup with its specific meaning in context.
