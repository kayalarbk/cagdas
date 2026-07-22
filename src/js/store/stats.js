// Oyunlaştırma durumu: seri (streak), XP ve günlük hedef.
//
// Günlük hedef "bugün kaç kart değerlendirdin"i sayar, "kaç kart öğrendim
// dedin"i değil. Bir kelimeyi kalıcı hale getirmek günler sürdüğü için günlük
// ölçüm birimi tekrardır; kalıcılık ayrıca `progress.js` tarafında izlenir.
// Aynı kart gün içinde iki kez çalışılırsa sayaç bir kez artar — yoksa aynı
// kartı tekrar tekrar işaretleyerek hedef şişirilebilirdi.

import { GAMIFICATION, GRADES, STORAGE_KEYS } from '../config.js';
import { dayKey, daysBetween } from '../utils.js';
import { read, write } from './storage.js';

const DEFAULTS = {
  xp: 0,
  streak: 0,
  /** @type {string|null} son çalışılan gün (YYYY-MM-DD) */
  lastStudyDay: null,
  /** @type {string[]} bugün değerlendirilen kart id'leri */
  todayCards: [],
  /** todayCards'ın ait olduğu gün */
  todayDay: null,
  /** bugün kalıcı kutusuna çıkan kart sayısı */
  todayMastered: 0,
  dailyGoal: GAMIFICATION.defaultDailyGoal,
};

let stats = { ...DEFAULTS, ...read(STORAGE_KEYS.stats, {}) };

// Eski sürüm sayısal bir `todayCount` tutuyordu; id listesine çevrilemez ama
// günün sayısı korunsun diye yer tutucu id'lerle taşınır.
if (Array.isArray(stats.todayCards) === false) {
  const previous = Number(stats.todayCount) || 0;
  stats.todayCards = Array.from({ length: previous }, (_, i) => `legacy-${i}`);
}
delete stats.todayCount;

function persist() {
  write(STORAGE_KEYS.stats, stats);
}

/**
 * Gün değiştiyse günlük sayacı sıfırlar, seri koptuysa seriyi düşürür.
 * Her okuma öncesi çağrılır; gece yarısını geçen sekmelerde de doğru sonuç verir.
 */
function refreshForToday() {
  const today = dayKey();

  if (stats.todayDay !== today) {
    stats.todayDay = today;
    stats.todayCards = [];
    stats.todayMastered = 0;
  }

  // Dün de bugün de çalışılmadıysa seri kopmuştur.
  if (stats.lastStudyDay && daysBetween(stats.lastStudyDay, today) > 1) {
    stats.streak = 0;
  }
}

/** Güncel istatistikler (salt okunur kopya). */
export function getStats() {
  refreshForToday();
  const todayCount = stats.todayCards.length;
  const goalPct = stats.dailyGoal
    ? Math.min(100, Math.round((todayCount / stats.dailyGoal) * 100))
    : 0;
  return {
    ...stats,
    todayCards: [...stats.todayCards],
    todayCount,
    goalPct,
    goalReached: todayCount >= stats.dailyGoal,
  };
}

/** XP ekler. Quiz doğru cevabı gibi tekrar dışı kazanımlar için. */
export function addXp(amount) {
  refreshForToday();
  stats.xp += amount;
  persist();
}

/**
 * Bir kart değerlendirildiğinde çağrılır: günlük sayacı, seriyi ve XP'yi günceller.
 *
 * @param {object} card
 * @param {'again'|'hard'|'good'} grade
 * @param {{ justMastered?: boolean }} [result] `reviewCard` sonucu
 * @returns {{ xp: number, counted: boolean, goalJustReached: boolean,
 *   streakIncreased: boolean }}
 */
export function recordReview(card, grade, { justMastered = false } = {}) {
  refreshForToday();
  const today = stats.todayDay;
  const wasGoalReached = stats.todayCards.length >= stats.dailyGoal;

  let streakIncreased = false;
  if (stats.lastStudyDay !== today) {
    const gap = stats.lastStudyDay ? daysBetween(stats.lastStudyDay, today) : null;
    stats.streak = gap === 1 ? stats.streak + 1 : 1;
    stats.lastStudyDay = today;
    streakIncreased = true;
  }

  // Aynı kart gün içinde tekrar çalışılırsa hedef sayacı artmaz; puan yine verilir
  // çünkü ikinci tekrar da gerçek bir çalışmadır.
  const id = card?.id;
  const counted = Boolean(id) && !stats.todayCards.includes(id);
  if (counted) stats.todayCards.push(id);

  let xp = GRADES[grade]?.xp ?? 0;
  if (justMastered) {
    xp += GAMIFICATION.xpPerMastered;
    stats.todayMastered += 1;
  }
  stats.xp += xp;
  persist();

  return {
    xp,
    counted,
    streakIncreased,
    goalJustReached:
      counted && !wasGoalReached && stats.todayCards.length >= stats.dailyGoal,
  };
}

/** Günlük hedefi değiştirir. */
export function setDailyGoal(goal) {
  stats.dailyGoal = Math.max(1, goal);
  persist();
}
