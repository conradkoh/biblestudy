const fs = require('node:fs');
const path = require('node:path');

// Read the NIV JSON file
const nivData = require(path.join(__dirname, '../assets/bible-en/niv.json'));

// Define the book names and their order
const bookNames = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
];

// Create the KJV-format structure
const formattedBible = {
  translation: 'New International Version',
  abbreviation: 'niv',
  description: 'New International Version',
  lang: 'en',
  language: 'English',
  direction: 'LTR',
  encoding: 'UTF-8',
  books: [],
};

// Convert each book
let bookNumber = 1;
for (const [bookKey, chapters] of Object.entries(nivData)) {
  // Find the proper book name from our list
  const properBookName = bookNames.find((name) =>
    name.toLowerCase().includes(bookKey),
  );
  if (!properBookName) continue;

  const book = {
    nr: bookNumber,
    name: properBookName,
    chapters: [],
  };

  // Convert each chapter
  chapters.forEach((verses, chapterIndex) => {
    const chapter = {
      chapter: chapterIndex + 1,
      name: `${properBookName} ${chapterIndex + 1}`,
      verses: [],
    };

    // Convert each verse
    verses.forEach((text, verseIndex) => {
      chapter.verses.push({
        chapter: chapterIndex + 1,
        verse: verseIndex + 1,
        name: `${properBookName} ${chapterIndex + 1}:${verseIndex + 1}`,
        text: text,
      });
    });

    book.chapters.push(chapter);
  });

  formattedBible.books.push(book);
  bookNumber++;
}

// Write the formatted data to a new file
fs.writeFileSync(
  path.join(__dirname, '../assets/bible-en/niv-formatted.json'),
  JSON.stringify(formattedBible, null, 2),
  'utf8',
);

console.log('Conversion completed! Check niv-formatted.json');
