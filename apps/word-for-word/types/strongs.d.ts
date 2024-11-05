// CREDIT: openscriptures/strongs
declare module "@/src/libraries/strongs" {
  declare const strongs: Record<
    string,
    {
      derivation: string; // of Hebrew origin (H085);
      kjv_def: string; // Abraham
      lemma: string; // Ἀβραάμ
      strongs_def: string; // Abraham, the Hebrew patriarch
      // hebrew
      xlit?: string;
      pron?: string;
      // greek
      translit?: string;
    }
  >;
  export default strongs;
}
