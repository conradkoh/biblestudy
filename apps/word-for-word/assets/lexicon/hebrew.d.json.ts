declare const hebrewLexicon: {
  word: string;
  strongs: string;
  data: {
    comment?: string;
    see?: string[];
    derive?: string;
    def?: {
      short?: string;
      long?: (string | string[])[];
    };
  };
}[];
export default hebrewLexicon;
