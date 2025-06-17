import delimiters from '@common/bible-delimiters.json'

function isDelimiter(word: string): boolean {
  return delimiters.includes(word);
}

function sanitize(str: string) {
  return str.replaceAll(`’`, `'`);
}

export function isWord(token: string | null | undefined): boolean {
  return (
    token !== null &&
    token !== undefined &&
    !isDelimiter(token) &&
    token.length !== 0
  );
}

function getTokens(_text: string): string[] {
  const text = sanitize(_text);
  let string = "";
  const output: string[] = [];

  for (const char of text) {
    const isDelimiter = delimiters.includes(char);
    if (isDelimiter) {
      if (string.length !== 0) output.push(string);
      string = "";
      output.push(char);
    } else {
      string += char;
    }
  }

  if (string.length !== 0) output.push(string);

  return output;
}

function getWords(text: string): string[] {
  return getTokens(text).filter((word) => isWord(word));
}

export type Token = {
  text: string;
  match: boolean;
  userAttempted: boolean;
  isDelimiter: boolean;
};

export function tokeniseVerse(verse: string, userText: string): Token[] {
  const referenceTokens = getTokens(verse);
  const userWords = getWords(userText);

  function preprocess(word: string | null | undefined): string | null {
    if (!word) return null;
    return word.toLowerCase();
  }

  let referenceWord: string | null = null;
  let userWord: string | null = null;
  let userWordIndex = 0;
  const outputTokens: Token[] = [];

  for (let i = 0; i < referenceTokens.length; i++) {
    const nextReferenceTokenRaw = referenceTokens[i];
    if (!nextReferenceTokenRaw)
      throw new Error("Unexpected null reference token");
    const nextReferenceToken = preprocess(nextReferenceTokenRaw);
    const nextUserWord = userWords[userWordIndex]
      ? preprocess(userWords[userWordIndex])
      : null;

    if (isWord(nextUserWord)) userWord = nextUserWord;
    if (isWord(nextReferenceToken)) referenceWord = nextReferenceToken;

    const lastUserWordIndex = userWords.length - 1;
    const userAttempted = userWordIndex <= lastUserWordIndex;
    const isMatch = userWord === referenceWord;

    if (isWord(nextReferenceToken) && isWord(userWord)) {
      userWordIndex++;
    }

    if (isMatch) {
      userWord = null;
      referenceWord = null;
    }

    const token: Token = {
      text: nextReferenceTokenRaw,
      match: isMatch,
      userAttempted,
      isDelimiter: isDelimiter(nextReferenceTokenRaw),
    };

    outputTokens.push(token);
  }

  return outputTokens;
}

export function tokeniseVerses(verses: string[], userText: string): Token[][] {
  if (verses.length === 0) return [];

  // Combine all verses into a single text to get reference words in sequence
  const combinedVerse = verses.join(' ');
  const allReferenceTokens = getTokens(combinedVerse);
  const userWords = getWords(userText);

  function preprocess(word: string | null | undefined): string | null {
    if (!word) return null;
    return word.toLowerCase();
  }

  let referenceWord: string | null = null;
  let userWord: string | null = null;
  let userWordIndex = 0;
  const allOutputTokens: Token[] = [];

  // Process all reference tokens against user input
  for (let i = 0; i < allReferenceTokens.length; i++) {
    const nextReferenceTokenRaw = allReferenceTokens[i];
    if (!nextReferenceTokenRaw)
      throw new Error("Unexpected null reference token");
    const nextReferenceToken = preprocess(nextReferenceTokenRaw);
    const nextUserWord = userWords[userWordIndex]
      ? preprocess(userWords[userWordIndex])
      : null;

    if (isWord(nextUserWord)) userWord = nextUserWord;
    if (isWord(nextReferenceToken)) referenceWord = nextReferenceToken;

    const lastUserWordIndex = userWords.length - 1;
    const userAttempted = userWordIndex <= lastUserWordIndex;
    const isMatch = userWord === referenceWord;

    if (isWord(nextReferenceToken) && isWord(userWord)) {
      userWordIndex++;
    }

    if (isMatch) {
      userWord = null;
      referenceWord = null;
    }

    const token: Token = {
      text: nextReferenceTokenRaw,
      match: isMatch,
      userAttempted,
      isDelimiter: isDelimiter(nextReferenceTokenRaw),
    };

    allOutputTokens.push(token);
  }

  // Now split the tokens back into separate arrays for each verse
  const result: Token[][] = [];
  let tokenIndex = 0;

  for (const verse of verses) {
    const verseTokens = getTokens(verse).concat([' ']); // there is an extra space with the .join(' ') above
    const verseResult: Token[] = [];

    for (let i = 0; i < verseTokens.length; i++) {
      if (tokenIndex < allOutputTokens.length) {
        const token = allOutputTokens[tokenIndex];
        if (token) {
          verseResult.push(token);
        }
        tokenIndex++;
      }
    }

    result.push(verseResult);
  }

  return result;
}
