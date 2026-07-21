// Uygulama genelinde kullanılan sabitler.

/** Alan listesini tanımlayan manifest dosyası. */
export const FIELDS_MANIFEST = 'src/data/fields/fields.json';

/** Bir quiz turundaki soru sayısı. */
export const QUIZ_LENGTH = 5;

/** localStorage anahtarları. */
export const STORAGE_KEYS = {
  learned: 'de_learned_v2', // öğrenilen kart id'leri (dizi)
  learnedLegacy: 'kartlar_learned_v1', // eski biçim: { "Kategori::kelime": true }
  interests: 'de_interests_v1', // seçili alan id'leri
  stats: 'de_stats_v1', // seri, XP, günlük hedef
  profile: 'de_profile_v1', // tanışma testinin sonucu
};

/**
 * CEFR seviyeleri. Sıra hem filtre butonlarında hem özet çiplerinde kullanılır.
 * Kart verisinde seviye eksikse DEFAULT_LEVEL varsayılır.
 */
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];
export const DEFAULT_LEVEL = 'A2';

/** Oyunlaştırma ayarları. */
export const GAMIFICATION = {
  /** Varsayılan günlük hedef (kelime). */
  defaultDailyGoal: 10,
  /** Bir kelimeyi "öğrendim" işaretlemenin puanı. */
  xpPerWord: 10,
  /** Quizde bir doğru cevabın puanı. */
  xpPerCorrectAnswer: 5,
  /** Seçilebilecek en az alan sayısı. */
  minInterests: 1,
};

/**
 * Tanışma testi — 1. adım: bölüm / meslek.
 * `fields`: bu profil için önerilen alan id'leri (öneri sırası korunur).
 */
export const PROFILES = [
  {
    id: 'muhendislik',
    label: 'Mühendislik',
    icon: '🛠️',
    hint: 'Teknik terimler, proje ve üretim dili',
    fields: ['muhendislik', 'akademik', 'is-hayati'],
  },
  {
    id: 'tip',
    label: 'Tıp & Sağlık',
    icon: '🩺',
    hint: 'Klinik dil, hasta iletişimi, tanı ve tedavi',
    fields: ['tip', 'saglik-spor', 'akademik'],
  },
  {
    id: 'ekonomi',
    label: 'Ekonomi & İşletme',
    icon: '📈',
    hint: 'Piyasa, yatırım, şirket ve yönetim dili',
    fields: ['ekonomi', 'finans-para', 'is-hayati'],
  },
  {
    id: 'hukuk',
    label: 'Hukuk',
    icon: '⚖️',
    hint: 'Dava, sözleşme ve resmi dil',
    fields: ['hukuk', 'resmi-islemler', 'iletisim'],
  },
  {
    id: 'bilisim',
    label: 'Yazılım & Bilişim',
    icon: '💻',
    hint: 'Teknoloji, ürün ve ekip dili',
    fields: ['is-hayati', 'muhendislik', 'akademik'],
  },
  {
    id: 'genel',
    label: 'Genel / Diğer',
    icon: '🎒',
    hint: 'Günlük hayatın her alanından',
    fields: ['gunluk-rutin', 'iletisim', 'egitim'],
  },
];

/** Tanışma testi — 2. adım: seviye. `levels`: "sana uygun" filtresinin kapsamı. */
export const LEVEL_CHOICES = [
  {
    id: 'baslangic',
    label: 'Yeni başlıyorum',
    icon: '🌱',
    hint: 'Temel kelimeler ve kısa cümleler',
    levels: ['A1', 'A2'],
  },
  {
    id: 'orta',
    label: 'İdare ederim',
    icon: '🚶',
    hint: 'Günlük konuşmayı takip edebiliyorum',
    levels: ['A2', 'B1'],
  },
  {
    id: 'ileri',
    label: 'İyi seviyedeyim',
    icon: '🚀',
    hint: 'Deyimler ve mesleki dil istiyorum',
    levels: ['B1', 'B2'],
  },
];

/** Tanışma testi — 3. adım: amaç (çoklu seçim). */
export const GOALS = [
  { id: 'gunluk', label: 'Günlük konuşma', icon: '💬', fields: ['gunluk-rutin', 'iletisim'] },
  { id: 'is', label: 'İş & kariyer', icon: '💼', fields: ['is-hayati', 'iletisim'] },
  { id: 'akademik', label: 'Akademik & sınav', icon: '📚', fields: ['akademik', 'egitim'] },
  { id: 'seyahat', label: 'Seyahat', icon: '✈️', fields: ['seyahat', 'yemek-alisveris'] },
  { id: 'sosyal', label: 'Sosyal hayat', icon: '❤️', fields: ['iliskiler', 'medya-eglence'] },
];

/** Seslendirme (Web Speech API) ayarları. */
export const SPEECH = {
  lang: 'en-US',
  rate: 0.9,
};
