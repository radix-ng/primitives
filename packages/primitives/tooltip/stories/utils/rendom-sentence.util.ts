export function generateRandomSentence(maxWordNumber = 5) {
    maxWordNumber = maxWordNumber < 1 ? 1 : maxWordNumber;
    // Example word bank
    const words = [
        'dog',
        'cat',
        'elephant',
        'banana',
        'run',
        'jump',
        'beautiful',
        'quickly',
        'slowly',
        'tree',
        'sky',
        'ocean',
        'happy',
        'sad',
        'funny'
    ];

    // Generate a random number of words (between 1 and `maxWordNumber`)
    const wordCount = Math.floor(Math.random() * Math.min(maxWordNumber, words.length)) + 1;

    // Select random words to form the sentence
    const sentence = [];
    for (let i = 0; i < wordCount; i++) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        sentence.push(randomWord);
    }

    // Capitalize the first word, trim the sentence and add a period at the end
    return (
        (sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1) + ' ' + sentence.slice(1).join(' ')).trim() + '.'
    );
}
