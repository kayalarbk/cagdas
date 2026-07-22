// Ekranlar arası paylaşılan gezinme durumu.
// Modüller arası döngüsel bağımlılığı önlemek için tek bir nesne üzerinden taşınır.

export const state = {
  /** @type {string|null} açık alanın id'si */
  fieldId: null,
  /** @type {string|null} açık kategorinin adı */
  categoryName: null,
  /** @type {'category'|'review'} deste nereden geldi (tekrar seansı mı?) */
  deckMode: 'category',
  /** @type {object[]} kartlar ekranındaki geçerli deste (karıştırılabilir) */
  deck: [],
  /** görüntülenen kartın (filtrelenmiş listedeki) sırası */
  cardIndex: 0,
  /** görüntülenen kartın ham destedeki sırası; filtre muafiyeti için tutulur */
  deckIndexRef: 0,
  /** kart arka yüzü açık mı */
  flipped: false,
  /** cevabı değerlendirmeden önce çevirdi mi (dürüstlük kilidi) */
  peeked: false,
  /** @type {'all'|'pending'} kart filtresi: tümü ya da bugün çalışılacaklar */
  deckFilter: 'all',
  /** @type {'all'|'fit'|'A1'|'A2'|'B1'|'B2'} seviye filtresi */
  level: 'all',
};
