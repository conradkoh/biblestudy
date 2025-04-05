import type { GetBibleTranslation } from "../../apps/word-for-word/assets/bible-en/kjv.d.json";
const kjv: GetBibleTranslation = require("../../apps/word-for-word/assets/bible-en/kjv.jsonc");
const niv: GetBibleTranslation = require("../../apps/word-for-word/assets/bible-en/niv.jsonc");

const delimiters = new Set<string>();

function findDelimiters(bible: GetBibleTranslation) {
  for (const book of bible.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        for (const char of verse.text) {
          if (!char.match(/[a-zA-Z0-9]/)) {
            delimiters.add(char);
          }
        }
      }
    }
  }
}

findDelimiters(kjv);
findDelimiters(niv);

const array = Array.from(delimiters);
array.sort();

import fs from "node:fs";

fs.writeFileSync("../bible-delimiters.json", JSON.stringify(array, null, 2));
