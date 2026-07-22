// Genel amaçlı yardımcılar.

import { SPEECH } from './config.js';

/**
 * Diziyi yerinde karıştırır (Fisher-Yates) ve aynı diziyi döndürür.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Yerel saate göre YYYY-MM-DD. Gün sınırı kullanıcının saat diliminde geçer;
 * UTC kullanılırsa akşam çalışan kullanıcı ertesi güne yazılırdı.
 * @param {Date} [date]
 */
export function dayKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * İki gün anahtarı arasındaki tam gün farkı (toDay - fromDay).
 * @param {string} fromDay YYYY-MM-DD
 * @param {string} toDay YYYY-MM-DD
 */
export function daysBetween(fromDay, toDay) {
  const diff = new Date(`${toDay}T00:00:00`) - new Date(`${fromDay}T00:00:00`);
  return Math.round(diff / 86400000);
}

/**
 * Bir gün anahtarına gün ekler.
 * @param {number} days
 * @param {string} [fromDay] varsayılan: bugün
 * @returns {string} YYYY-MM-DD
 */
export function addDays(days, fromDay = dayKey()) {
  const date = new Date(`${fromDay}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/**
 * Metni karşılaştırma için sadeleştirir: küçük harf, noktalama ve fazla boşluk yok.
 * Yazma modunda "Don't  worry!" ile "dont worry" eşit sayılır.
 * @param {string} text
 */
export function normalizeAnswer(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verilen metni İngilizce olarak seslendirir.
 * Desteklenmeyen tarayıcılarda sessizce hiçbir şey yapmaz.
 * @param {string} text
 */
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH.lang;
    utterance.rate = SPEECH.rate;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* desteklenmeyen tarayıcıda sessizce geç */
  }
}
