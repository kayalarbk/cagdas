// Tanışma testinin sonucu: bölüm/meslek, seviye ve amaçlar.
// Alan seçimi ayrı tutulur (store/interests.js) — kullanıcı testten bağımsız
// olarak istediği zaman alan ekleyip çıkarabilir.

import { GOALS, LEVEL_CHOICES, PROFILES, STORAGE_KEYS } from '../config.js';
import { read, write } from './storage.js';

const EMPTY = { profileId: null, levelId: null, goalIds: [] };

let profile = { ...EMPTY, ...read(STORAGE_KEYS.profile, {}) };

/** Testin sonucu (salt okunur kopya). */
export function getProfile() {
  return { ...profile, goalIds: [...profile.goalIds] };
}

/** Kullanıcı testi tamamladı mı? */
export function hasProfile() {
  return Boolean(profile.profileId);
}

/** @param {{profileId: string, levelId: string, goalIds: string[]}} next */
export function setProfile(next) {
  profile = {
    profileId: next.profileId ?? null,
    levelId: next.levelId ?? null,
    goalIds: [...(next.goalIds ?? [])],
  };
  write(STORAGE_KEYS.profile, profile);
}

export function getProfileMeta() {
  return PROFILES.find((item) => item.id === profile.profileId) || null;
}

export function getLevelChoice() {
  return LEVEL_CHOICES.find((item) => item.id === profile.levelId) || null;
}

/**
 * Kullanıcının seviyesine karşılık gelen CEFR seviyeleri.
 * Test yapılmamışsa boş dizi döner (kartlar ekranı "sana uygun" filtresini gizler).
 */
export function getPreferredLevels() {
  return getLevelChoice()?.levels ?? [];
}

/**
 * Profil ve amaçlara göre önerilen alan id'leri.
 * Önce meslek alanları, sonra amaçlardan gelenler; tekrarlar ayıklanır.
 * @param {{profileId?: string, goalIds?: string[]}} [source] test sırasında
 *   henüz kaydedilmemiş seçimler için kullanılır
 */
export function getRecommendedFields(source = profile) {
  const fromProfile = PROFILES.find((item) => item.id === source.profileId)?.fields ?? [];
  const fromGoals = (source.goalIds ?? []).flatMap(
    (id) => GOALS.find((goal) => goal.id === id)?.fields ?? []
  );
  return [...new Set([...fromProfile, ...fromGoals])];
}
