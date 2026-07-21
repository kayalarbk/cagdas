// Anasayfa: günlük hedef, seri ve seçili alanların ilerlemesi.

import { el } from '../dom.js';
import { getFieldMeta, getFields } from '../data/repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import { getLevelChoice, getProfileMeta, getRecommendedFields } from '../store/profile.js';
import { getFieldProgress } from '../store/progress.js';
import { getStats, setDailyGoal } from '../store/stats.js';
import { renderHeader } from '../ui/header.js';
import { toast } from '../ui/toast.js';
import { openField } from './field.js';
import { showScreen } from './navigation.js';

/** Hedef halkasının çevresi: 2πr, r = 52. */
const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

function greetingForHour(hour) {
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

/**
 * Profil çipi: "🛠️ Mühendislik · İdare ederim" — dokununca test yeniden açılır.
 * Testi hiç çözmemiş kullanıcıya (eski sürümden gelenlere) çağrı olarak görünür.
 */
function renderProfileChip() {
  if (!el.profileChip) return;
  el.profileChip.classList.remove('hidden');

  const meta = getProfileMeta();
  if (!meta) {
    el.profileChip.classList.add('is-empty');
    el.profileChip.innerHTML =
      '<span aria-hidden="true">🎯</span> Seni tanıyalım' +
      '<span class="profile-chip-edit" aria-hidden="true">testi çöz</span>';
    return;
  }

  const level = getLevelChoice();
  el.profileChip.classList.remove('is-empty');
  el.profileChip.innerHTML =
    `<span aria-hidden="true">${meta.icon}</span> ${meta.label}` +
    (level ? `<span class="profile-chip-level">${level.label}</span>` : '') +
    '<span class="profile-chip-edit" aria-hidden="true">değiştir</span>';
}

function renderGreeting(stats) {
  if (el.greetingTitle) el.greetingTitle.textContent = greetingForHour(new Date().getHours());

  if (!el.greetingSub) return;
  if (stats.goalReached) {
    el.greetingSub.textContent = 'Bugünün hedefini tamamladın. Devam edebilirsin!';
  } else if (stats.streak > 0) {
    el.greetingSub.textContent = `${stats.streak} günlük serini sürdür.`;
  } else {
    el.greetingSub.textContent = 'Bugün birkaç kelime öğrenmeye ne dersin?';
  }
}

function renderGoal(stats) {
  if (el.goalCount) el.goalCount.textContent = stats.todayCount;
  if (el.goalTotal) el.goalTotal.textContent = `/ ${stats.dailyGoal}`;
  if (el.goalSelect) el.goalSelect.value = String(stats.dailyGoal);

  if (el.goalRingFill) {
    const offset = RING_CIRCUMFERENCE * (1 - stats.goalPct / 100);
    el.goalRingFill.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    el.goalRingFill.style.strokeDashoffset = String(offset);
    el.goalRingFill.parentElement?.parentElement?.classList.toggle(
      'is-complete',
      stats.goalReached
    );
  }

  if (el.goalText) {
    const remaining = Math.max(0, stats.dailyGoal - stats.todayCount);
    el.goalText.textContent = stats.goalReached
      ? 'Hedef tamam! 🎉 Fazlası her zaman iyidir.'
      : `${remaining} kelime kaldı.`;
  }
}

/** Bir alan satırı oluşturur. `muted` keşfet listesi içindir. */
function fieldRow(meta, { muted = false, recommended = false } = {}) {
  const { learned, total, pct } = getFieldProgress(meta.id);

  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'field-row';
  row.style.setProperty('--row-color', meta.color);
  row.innerHTML = `
    <span class="field-row-icon" aria-hidden="true">${meta.icon}</span>
    <span class="field-row-body">
      <span class="field-row-name">
        ${meta.name}
        ${pct === 100 ? '<span class="field-row-done">✓ tamam</span>' : ''}
        ${recommended ? '<span class="field-row-tag">sana uygun</span>' : ''}
      </span>
      <span class="field-row-meta">
        ${
          muted
            ? `<span class="field-row-pct">${total} kelime</span>`
            : `<span class="progress-track"><span class="progress-fill" style="width:${pct}%"></span></span>
               <span class="field-row-pct">%${pct}</span>`
        }
      </span>
    </span>
  `;
  row.setAttribute(
    'aria-label',
    muted ? `${meta.name}, ${total} kelime` : `${meta.name}, ${learned} / ${total} öğrenildi`
  );
  row.onclick = () => openField(meta.id);
  if (!muted) return row;

  // Keşfet satırları: alanı açmadan doğrudan listeye eklemek için "+" düğmesi.
  const wrap = document.createElement('div');
  wrap.className = 'field-row-wrap';
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'field-add-btn';
  add.textContent = '+ Ekle';
  add.setAttribute('aria-label', `${meta.name} alanını ekle`);
  add.onclick = () => {
    setInterests([...getInterests(), meta.id]);
    renderHome();
    toast(`${meta.name} eklendi`, '➕');
  };
  wrap.append(row, add);
  return wrap;
}

function renderFieldLists() {
  const interests = getInterests();

  if (el.homeFieldList) {
    el.homeFieldList.innerHTML = '';
    interests.forEach((id) => {
      const meta = getFieldMeta(id);
      if (meta) el.homeFieldList.appendChild(fieldRow(meta));
    });
  }

  // Keşfet: profile göre önerilenler üstte.
  const recommended = getRecommendedFields();
  const rank = (id) => {
    const index = recommended.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const others = getFields()
    .filter((field) => !interests.includes(field.id))
    .sort((a, b) => rank(a.id) - rank(b.id));

  if (el.exploreHead) el.exploreHead.classList.toggle('hidden', others.length === 0);
  if (el.exploreFieldList) {
    el.exploreFieldList.innerHTML = '';
    others.forEach((meta) =>
      el.exploreFieldList.appendChild(
        fieldRow(meta, { muted: true, recommended: recommended.includes(meta.id) })
      )
    );
  }
}

/** Devam edilecek alan: seçili alanlar içinde en az ilerlenmiş, bitmemiş olan. */
function nextFieldId() {
  const candidates = getInterests()
    .map((id) => ({ id, ...getFieldProgress(id) }))
    .filter((field) => field.total > 0);

  if (candidates.length === 0) return null;
  const unfinished = candidates.filter((field) => field.pct < 100);
  const pool = unfinished.length > 0 ? unfinished : candidates;
  return pool.reduce((best, field) => (field.pct < best.pct ? field : best)).id;
}

export function renderHome() {
  const stats = getStats();
  renderProfileChip();
  renderGreeting(stats);
  renderGoal(stats);
  renderFieldLists();
  renderHeader();

  if (el.continueBtn) {
    const target = nextFieldId();
    el.continueBtn.disabled = !target;
    el.continueBtn.textContent = stats.todayCount > 0 ? 'Devam Et' : 'Bugüne Başla';
  }
}

export function goHome() {
  renderHome();
  showScreen('home');
}

/**
 * @param {() => void} onEditInterests alan ekle/çıkar bağlantısı
 * @param {() => void} onRetakeQuiz profil çipi (testi yeniden çöz)
 */
export function bindHome(onEditInterests, onRetakeQuiz) {
  if (el.continueBtn) {
    el.continueBtn.onclick = () => {
      const target = nextFieldId();
      if (target) openField(target);
    };
  }

  if (el.editInterestsBtn) el.editInterestsBtn.onclick = onEditInterests;
  if (el.profileChip) el.profileChip.onclick = onRetakeQuiz;

  if (el.goalSelect) {
    el.goalSelect.onchange = () => {
      setDailyGoal(Number(el.goalSelect.value));
      renderHome();
    };
  }
}
