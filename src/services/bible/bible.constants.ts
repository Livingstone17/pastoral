import type { BibleTranslation, TranslationId } from './bible.types';

/**
 * Base URL of the static Bible dataset, served through jsDelivr.
 * Configure via VITE_BIBLE_DATA_URL; the dataset URL is not a secret.
 */
const DEFAULT_BIBLE_DATA_URL = 'https://cdn.jsdelivr.net/gh/livingstone17/bible-api@main/data';

function envBibleDataUrl(): string | undefined {
  try {
    const meta = import.meta as { env?: Record<string, string> };
    if (meta && typeof meta.env === 'object' && meta.env !== null) {
      return meta.env.VITE_BIBLE_DATA_URL;
    }
  } catch {
    // Not running inside Vite (e.g. tests) — fall back to the default.
  }
  return undefined;
}

export const BIBLE_DATA_URL: string = envBibleDataUrl() || DEFAULT_BIBLE_DATA_URL;

export const SUPPORTED_TRANSLATIONS: ReadonlySet<TranslationId> = new Set([
  'YLT',
  'KJV',
  'WEB',
  'NIV',
  'ESV',
]);

export const DEFAULT_TRANSLATION: TranslationId = 'KJV';

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: 'KJV', name: 'King James Version' },
  { id: 'YLT', name: "Young's Literal Translation" },
  { id: 'WEB', name: 'World English Bible' },
  { id: 'NIV', name: 'New International Version' },
  { id: 'ESV', name: 'English Standard Version' },
];

/**
 * Canonical 66-book order. Used only for parsing passage references
 * ("John 3:16" -> John). The UI derives book lists, testaments and
 * chapter counts from books.json at runtime, never from this list.
 */
export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

/** Book abbreviations mapped to the canonical names used in books.json. */
export const BOOK_ALIASES: Record<string, string> = {
  gen: 'Genesis', genesis: 'Genesis',
  ex: 'Exodus', exo: 'Exodus', exod: 'Exodus', exodus: 'Exodus',
  lev: 'Leviticus', lv: 'Leviticus', leviticus: 'Leviticus',
  num: 'Numbers', nu: 'Numbers', nm: 'Numbers', numbers: 'Numbers',
  deut: 'Deuteronomy', dt: 'Deuteronomy', deuteronomy: 'Deuteronomy',
  josh: 'Joshua', jos: 'Joshua', joshua: 'Joshua',
  judg: 'Judges', jdg: 'Judges', judges: 'Judges',
  rth: 'Ruth', ru: 'Ruth', ruth: 'Ruth',
  '1 sam': '1 Samuel', '1 samuel': '1 Samuel', '1sm': '1 Samuel',
  '2 sam': '2 Samuel', '2 samuel': '2 Samuel', '2sm': '2 Samuel',
  '1 kgs': '1 Kings', '1 kings': '1 Kings', '1ki': '1 Kings',
  '2 kgs': '2 Kings', '2 kings': '2 Kings', '2ki': '2 Kings',
  '1 chr': '1 Chronicles', '1 chronicles': '1 Chronicles', '1ch': '1 Chronicles',
  '2 chr': '2 Chronicles', '2 chronicles': '2 Chronicles', '2ch': '2 Chronicles',
  ezr: 'Ezra', ezra: 'Ezra',
  neh: 'Nehemiah', ne: 'Nehemiah', nehemiah: 'Nehemiah',
  est: 'Esther', es: 'Esther', esther: 'Esther',
  job: 'Job', jb: 'Job',
  ps: 'Psalms', psa: 'Psalms', psalm: 'Psalms', psalms: 'Psalms',
  prov: 'Proverbs', pr: 'Proverbs', pro: 'Proverbs', proverbs: 'Proverbs',
  eccl: 'Ecclesiastes', ecc: 'Ecclesiastes', eccles: 'Ecclesiastes', ecclesiastes: 'Ecclesiastes',
  song: 'Song of Solomon', sos: 'Song of Solomon', 'song of songs': 'Song of Solomon', 'song of solomon': 'Song of Solomon',
  isa: 'Isaiah', is: 'Isaiah', isaiah: 'Isaiah',
  jer: 'Jeremiah', jr: 'Jeremiah', jeremiah: 'Jeremiah',
  lam: 'Lamentations', la: 'Lamentations', lamentations: 'Lamentations',
  ezek: 'Ezekiel', eze: 'Ezekiel', ezekiel: 'Ezekiel',
  dan: 'Daniel', dn: 'Daniel', da: 'Daniel', daniel: 'Daniel',
  hos: 'Hosea', hosea: 'Hosea',
  joel: 'Joel', jl: 'Joel',
  amos: 'Amos', am: 'Amos',
  obad: 'Obadiah', ob: 'Obadiah', obadiah: 'Obadiah',
  jon: 'Jonah', jnh: 'Jonah', jonah: 'Jonah',
  mic: 'Micah', mi: 'Micah', micah: 'Micah',
  nah: 'Nahum', na: 'Nahum', nahum: 'Nahum',
  hab: 'Habakkuk', habakkuk: 'Habakkuk',
  zeph: 'Zephaniah', zep: 'Zephaniah', zp: 'Zephaniah', zephaniah: 'Zephaniah',
  hag: 'Haggai', haggai: 'Haggai',
  zech: 'Zechariah', zec: 'Zechariah', zechariah: 'Zechariah',
  mal: 'Malachi', malachi: 'Malachi',
  matt: 'Matthew', mat: 'Matthew', mt: 'Matthew', matthew: 'Matthew',
  mark: 'Mark', mk: 'Mark', mr: 'Mark',
  luke: 'Luke', lk: 'Luke', lu: 'Luke',
  john: 'John', jn: 'John', jhn: 'John',
  acts: 'Acts', act: 'Acts',
  rom: 'Romans', ro: 'Romans', romans: 'Romans',
  '1 cor': '1 Corinthians', '1 corinthians': '1 Corinthians', '1co': '1 Corinthians',
  '2 cor': '2 Corinthians', '2 corinthians': '2 Corinthians', '2co': '2 Corinthians',
  gal: 'Galatians', ga: 'Galatians', galatians: 'Galatians',
  eph: 'Ephesians', ep: 'Ephesians', ephesians: 'Ephesians',
  phil: 'Philippians', php: 'Philippians', ph: 'Philippians', philippians: 'Philippians',
  col: 'Colossians', co: 'Colossians', colossians: 'Colossians',
  '1 thes': '1 Thessalonians', '1 thess': '1 Thessalonians', '1 thessalonians': '1 Thessalonians', '1th': '1 Thessalonians',
  '2 thes': '2 Thessalonians', '2 thess': '2 Thessalonians', '2 thessalonians': '2 Thessalonians', '2th': '2 Thessalonians',
  '1 tim': '1 Timothy', '1ti': '1 Timothy', '1 timothy': '1 Timothy',
  '2 tim': '2 Timothy', '2ti': '2 Timothy', '2 timothy': '2 Timothy',
  tit: 'Titus', ti: 'Titus', titus: 'Titus',
  philem: 'Philemon', phm: 'Philemon', pm: 'Philemon', philemon: 'Philemon',
  heb: 'Hebrews', he: 'Hebrews', hebrews: 'Hebrews',
  james: 'James', jam: 'James', jas: 'James',
  '1 pet': '1 Peter', '1pe': '1 Peter', '1 peter': '1 Peter',
  '2 pet': '2 Peter', '2pe': '2 Peter', '2 peter': '2 Peter',
  '1 jn': '1 John', '1 john': '1 John', '1jo': '1 John',
  '2 jn': '2 John', '2 john': '2 John', '2jo': '2 John',
  '3 jn': '3 John', '3 john': '3 John', '3jo': '3 John',
  jude: 'Jude', jud: 'Jude',
  rev: 'Revelation', re: 'Revelation', revelation: 'Revelation',
};
