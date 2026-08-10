export type TranslationId = 'YLT' | 'KJV' | 'WEB' | 'NIV' | 'ESV';

export interface BibleBook {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface BibleVerse {
  pk?: number;
  verse: number;
  text: string;
}

export type BibleChapter = BibleVerse[];

export interface BibleTranslation {
  id: TranslationId;
  name: string;
}

export interface StrongsEntry {
  topic: string;
  definition: string;
  lexeme?: string;
  transliteration?: string;
  pronunciation?: string;
  short_definition?: string;
  weight?: number;
  [key: string]: unknown;
}

export interface ParsedRef {
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

/** Application-friendly error thrown by the Bible service. */
export class BibleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BibleDataError';
  }
}
