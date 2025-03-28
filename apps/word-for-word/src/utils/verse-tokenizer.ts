const delimiters = [" ", ".", ",", ":", ";", "\n", '"', "!", "?", "(", ")"];

function isDelimiter(word: string): boolean {
  return delimiters.includes(word);
}

export function isWord(token: string | null | undefined): boolean {
  return (
    token !== null &&
    token !== undefined &&
    !isDelimiter(token) &&
    token.length !== 0
  );
}

function getTokens(text: string): string[] {
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
