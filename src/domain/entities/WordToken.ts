import { ContentType } from "../enums/ContentType";

export class WordToken {
  readonly word: string;
  readonly displayWord: string;
  readonly index: number;
  readonly orpIndex: number;
  readonly contentType: ContentType;
  readonly blockIndex: number;

  constructor(params: {
    word: string;
    index: number;
    contentType: ContentType;
    blockIndex: number;
  }) {
    this.validate(params);
    this.word = params.word;
    this.displayWord = WordToken.stripMarkdownSyntax(params.word);
    this.index = params.index;
    this.contentType = params.contentType;
    this.blockIndex = params.blockIndex;
    this.orpIndex = WordToken.calculateOrpIndex(this.displayWord);
  }

  private validate(params: { word: string; index: number }): void {
    if (!params.word) {
      throw new Error("WordToken word is required");
    }
    if (params.index < 0) {
      throw new Error("WordToken index must be non-negative");
    }
  }

  static stripMarkdownSyntax(word: string): string {
    let cleaned = word;
    cleaned = cleaned.replace(/^\*{1,3}|\*{1,3}$/g, "");
    cleaned = cleaned.replace(/^_{1,3}|_{1,3}$/g, "");
    cleaned = cleaned.replace(/^~~|~~$/g, "");
    cleaned = cleaned.replace(/^`|`$/g, "");
    cleaned = cleaned.replace(/^#{1,6}\s?/, "");
    cleaned = cleaned.replace(/^\[([^\]]*)\]\([^)]*\)$/, "$1");
    cleaned = cleaned.replace(/^!\[([^\]]*)\]\([^)]*\)$/, "$1");
    return cleaned || word;
  }

  static calculateOrpIndex(word: string): number {
    const length = word.length;
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
  }

  get hasPunctuation(): boolean {
    return /[.!?]$/.test(this.displayWord);
  }

  get hasClausePunctuation(): boolean {
    return /[,;:]$/.test(this.displayWord);
  }

  get isLongWord(): boolean {
    return this.displayWord.length > 8;
  }
}
