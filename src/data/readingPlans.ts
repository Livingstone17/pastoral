import type { TranslationId } from '../services/bible/bible.types';

export interface ReadingPlanDay {
  book: string;     // Bible book name
  bookId: number;   // Bible book ID (1-66)
  chapter: number;  // Chapter number
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  days: ReadingPlanDay[];
}

function days(entries: [string, number, number, number][]): ReadingPlanDay[] {
  return entries.map(([book, bookId, chapterStart, chapterEnd]) => {
    const result: ReadingPlanDay[] = [];
    for (let ch = chapterStart; ch <= chapterEnd; ch++) {
      result.push({ book, bookId, chapter: ch });
    }
    return result;
  }).flat();
}

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'gospels',
    title: 'The Gospels',
    description: 'Read through Matthew, Mark, Luke, and John in 60 days.',
    icon: '📖',
    days: days([
      ['Matthew', 40, 1, 28],
      ['Mark', 41, 1, 16],
      ['Luke', 42, 1, 24],
      ['John', 43, 1, 21],
    ]),
  },
  {
    id: 'psalms',
    title: 'Psalms',
    description: 'One Psalm a day — all 150 in 5 months.',
    icon: '🎵',
    days: Array.from({ length: 150 }, (_, i) => ({
      book: 'Psalms',
      bookId: 19,
      chapter: i + 1,
    })),
  },
  {
    id: 'proverbs',
    title: 'Proverbs',
    description: 'One chapter a day through all 31 Proverbs — perfect for a month.',
    icon: '💡',
    days: Array.from({ length: 31 }, (_, i) => ({
      book: 'Proverbs',
      bookId: 20,
      chapter: i + 1,
    })),
  },
  {
    id: 'nt-chronological',
    title: 'New Testament',
    description: 'Read the entire New Testament in 260 days (~9 months).',
    icon: '✝️',
    days: days([
      ['Matthew', 40, 1, 28],
      ['Mark', 41, 1, 16],
      ['Luke', 42, 1, 24],
      ['John', 43, 1, 21],
      ['Acts', 44, 1, 28],
      ['Romans', 45, 1, 16],
      ['1 Corinthians', 46, 1, 16],
      ['2 Corinthians', 47, 1, 13],
      ['Galatians', 48, 1, 6],
      ['Ephesians', 49, 1, 6],
      ['Philippians', 50, 1, 4],
      ['Colossians', 51, 1, 4],
      ['1 Thessalonians', 52, 1, 5],
      ['2 Thessalonians', 53, 1, 3],
      ['1 Timothy', 54, 1, 6],
      ['2 Timothy', 55, 1, 4],
      ['Titus', 56, 1, 3],
      ['Philemon', 57, 1, 1],
      ['Hebrews', 58, 1, 13],
      ['James', 59, 1, 5],
      ['1 Peter', 60, 1, 5],
      ['2 Peter', 61, 1, 3],
      ['1 John', 62, 1, 5],
      ['2 John', 63, 1, 1],
      ['3 John', 64, 1, 1],
      ['Jude', 65, 1, 1],
      ['Revelation', 66, 1, 22],
    ]),
  },
  {
    id: 'genesis-8',
    title: 'Genesis to 2 Samuel',
    description: 'The first 8 books of the Bible — the story of creation through kingdom.',
    icon: '🌍',
    days: days([
      ['Genesis', 1, 1, 50],
      ['Exodus', 2, 1, 40],
      ['Leviticus', 3, 1, 27],
      ['Numbers', 4, 1, 36],
      ['Deuteronomy', 5, 1, 34],
      ['Joshua', 6, 1, 24],
      ['Judges', 7, 1, 21],
      ['Ruth', 8, 1, 4],
      ['1 Samuel', 9, 1, 31],
      ['2 Samuel', 10, 1, 24],
    ]),
  },
  {
    id: 'epistles',
    title: 'Paul\'s Letters',
    description: 'All 13 Pauline epistles in 52 readings.',
    icon: '✉️',
    days: days([
      ['Romans', 45, 1, 16],
      ['1 Corinthians', 46, 1, 16],
      ['2 Corinthians', 47, 1, 13],
      ['Galatians', 48, 1, 6],
      ['Ephesians', 49, 1, 6],
      ['Philippians', 50, 1, 4],
      ['Colossians', 51, 1, 4],
      ['1 Thessalonians', 52, 1, 5],
      ['2 Thessalonians', 53, 1, 3],
      ['1 Timothy', 54, 1, 6],
      ['2 Timothy', 55, 1, 4],
      ['Titus', 56, 1, 3],
      ['Philemon', 57, 1, 1],
    ]),
  },
];

/** Curated list of well-known verses for Verse of the Day. */
export const VERSE_OF_THE_DAY: { ref: string; text: string }[] = [
  { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'Romans 8:28', text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
  { ref: 'Isaiah 40:31', text: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' },
  { ref: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
  { ref: 'Psalm 119:105', text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
  { ref: '2 Timothy 1:7', text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.' },
  { ref: 'Joshua 1:9', text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.' },
  { ref: 'Romans 12:2', text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
  { ref: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.' },
  { ref: 'Matthew 28:19-20', text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world.' },
  { ref: 'Psalm 46:10', text: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.' },
  { ref: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
  { ref: 'Ephesians 2:8-9', text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.' },
  { ref: 'Psalm 37:4', text: 'Delight thyself also in the Lord; and he shall give thee the desires of thine heart.' },
  { ref: '1 Corinthians 13:4-5', text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil.' },
  { ref: 'Colossians 3:23', text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.' },
  { ref: 'Psalm 34:18', text: 'The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.' },
  { ref: 'Micah 6:8', text: 'He hath shewed thee, O man, what is good; and what doth the Lord require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?' },
  { ref: 'Matthew 6:33', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
  { ref: 'Psalm 91:1-2', text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust.' },
  { ref: 'Romans 15:13', text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.' },
  { ref: '2 Corinthians 5:17', text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.' },
  { ref: 'Psalm 139:14', text: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.' },
  { ref: 'Philippians 4:6-7', text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
  { ref: 'Isaiah 41:10', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
  { ref: 'Psalm 51:10', text: 'Create in me a clean heart, O God; and renew a right spirit within me.' },
  { ref: '1 Peter 5:7', text: 'Casting all your care upon him; for he careth for you.' },
];

/** Get the Verse of the Day based on the current date (rotates daily). */
export function getVerseOfTheDay(): { ref: string; text: string } {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return VERSE_OF_THE_DAY[dayOfYear % VERSE_OF_THE_DAY.length];
}
