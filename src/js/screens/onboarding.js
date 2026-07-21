// Tanışma testi ve alan seçimi.
//
// İki modda çalışır:
//   'quiz'   → bölüm/meslek → seviye → amaç → önerilen alanlar (ilk açılış)
//   'fields' → yalnızca alan seçimi (sonradan alan eklemek/çıkarmak için)
//
// Test sonucu profile store'una, seçilen alanlar interests store'una yazılır;
// ikisi bağımsızdır, kullanıcı testi tekrar çözmeden alan ekleyebilir.

import { GAMIFICATION, GOALS, LEVEL_CHOICES, PROFILES } from '../config.js';
import { el } from '../dom.js';
import { getFields } from '../data/repository.js';
import { getInterests, setInterests } from '../store/interests.js';
import { getProfile, getRecommendedFields, setProfile } from '../store/profile.js';
import { showScreen } from './navigation.js';

const STEPS = {
  profile: {
    title: 'Ne okuyorsun ya da ne iş yapıyorsun?',
    sub: 'Alanına özel kelimeleri öne çıkaralım.',
    multi: false,
    options: () => PROFILES,
  },
  level: {
    title: 'İngilizcen ne durumda?',
    sub: 'Kartları seviyene göre süzebilelim. Sonradan değiştirebilirsin.',
    multi: false,
    options: () => LEVEL_CHOICES,
  },
  goal: {
    title: 'Neye odaklanmak istiyorsun?',
    sub: 'Birden fazla seçebilirsin.',
    multi: true,
    options: () => GOALS,
  },
};

const wizard = {
  /** @type {('profile'|'level'|'goal'|'fields')[]} */
  steps: [],
  index: 0,
  profileId: null,
  levelId: null,
  /** @type {Set<string>} */
  goalIds: new Set(),
  /** @type {Set<string>} seçili alanlar */
  selection: new Set(),
  /** @type {string[]} öneri rozetini alan alanlar */
  recommended: [],
  /** @type {(() => void)|null} */
  onDone: null,
  /** alan listesi öneriyle bir kez dolduruldu mu */
  seeded: false,
};

const stepName = () => wizard.steps[wizard.index];

function renderProgress() {
  if (!el.wizardSteps) return;
  el.wizardSteps.classList.toggle('hidden', wizard.steps.length < 2);
  el.wizardSteps.innerHTML = wizard.steps
    .map((_, index) => {
      const state = index < wizard.index ? 'is-done' : index === wizard.index ? 'is-active' : '';
      return `<span class="wizard-step ${state}"></span>`;
    })
    .join('');
}

/** Tek/çok seçimli adımların kartları. */
function renderOptions(step) {
  if (!el.wizardOptions) return;
  el.wizardOptions.classList.remove('hidden');
  el.interestGrid?.classList.add('hidden');
  el.wizardOptions.innerHTML = '';

  const selected = (id) => {
    if (step.multi) return wizard.goalIds.has(id);
    return stepName() === 'profile' ? wizard.profileId === id : wizard.levelId === id;
  };

  step.options().forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-card';
    button.classList.toggle('is-selected', selected(option.id));
    button.setAttribute('aria-pressed', String(selected(option.id)));
    button.innerHTML = `
      <span class="option-icon" aria-hidden="true">${option.icon}</span>
      <span class="option-body">
        <span class="option-label">${option.label}</span>
        ${option.hint ? `<span class="option-hint">${option.hint}</span>` : ''}
      </span>
      <span class="option-check" aria-hidden="true">✓</span>
    `;
    button.onclick = () => {
      if (step.multi) {
        wizard.goalIds.has(option.id)
          ? wizard.goalIds.delete(option.id)
          : wizard.goalIds.add(option.id);
        render();
        return;
      }
      if (stepName() === 'profile') wizard.profileId = option.id;
      else wizard.levelId = option.id;
      // Tek seçimli adımlarda seçim doğrudan ilerletir: test kısa hissettirir.
      render();
      next();
    };
    el.wizardOptions.appendChild(button);
  });
}

/** Alan seçim adımı: öneriler işaretli gelir, kullanıcı serbestçe değiştirir. */
function renderFields() {
  if (!el.interestGrid) return;
  el.wizardOptions?.classList.add('hidden');
  el.interestGrid.classList.remove('hidden');

  wizard.recommended = getRecommendedFields({
    profileId: wizard.profileId,
    goalIds: [...wizard.goalIds],
  });

  // Önerileri yalnızca bir kez uygula; kullanıcı sonra kaldırabilsin.
  if (!wizard.seeded) {
    wizard.recommended.forEach((id) => wizard.selection.add(id));
    wizard.seeded = true;
  }

  // Önerilen alanlar öneri sırasıyla listenin başında dursun.
  const rank = (id) => {
    const index = wizard.recommended.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const fields = [...getFields()].sort((a, b) => rank(a.id) - rank(b.id));

  el.interestGrid.innerHTML = '';
  fields.forEach((field) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'field-tile';
    tile.style.setProperty('--tile-color', field.color);
    tile.setAttribute('aria-pressed', String(wizard.selection.has(field.id)));
    tile.classList.toggle('is-selected', wizard.selection.has(field.id));

    tile.innerHTML = `
      <span class="field-tile-check" aria-hidden="true">✓</span>
      ${wizard.recommended.includes(field.id) ? '<span class="field-tile-tag">önerilen</span>' : ''}
      <span class="field-tile-icon" aria-hidden="true">${field.icon}</span>
      <span class="field-tile-name">${field.name}</span>
      <span class="field-tile-count">${field.wordCount} kelime</span>
    `;
    tile.onclick = () => {
      wizard.selection.has(field.id)
        ? wizard.selection.delete(field.id)
        : wizard.selection.add(field.id);
      render();
    };
    el.interestGrid.appendChild(tile);
  });
}

function renderFooter() {
  const name = stepName();
  const isFields = name === 'fields';
  const enough = wizard.selection.size >= GAMIFICATION.minInterests;

  if (el.interestCount) {
    if (isFields) {
      el.interestCount.textContent = enough
        ? `${wizard.selection.size} alan seçildi`
        : 'En az bir alan seç';
    } else if (name === 'goal') {
      el.interestCount.textContent = wizard.goalIds.size > 0 ? '' : 'Dilersen boş bırakabilirsin';
    } else {
      el.interestCount.textContent = '';
    }
  }

  if (el.interestSaveBtn) {
    el.interestSaveBtn.textContent = isFields ? 'Hazırım' : 'Devam';
    el.interestSaveBtn.disabled = isFields && !enough;
  }
  if (el.wizardBackBtn) {
    el.wizardBackBtn.classList.toggle('hidden', wizard.index === 0);
  }
}

function render() {
  const name = stepName();
  const step = STEPS[name];

  if (el.wizardTitle) {
    el.wizardTitle.textContent = step ? step.title : 'Hangi alanlarda çalışacaksın?';
  }
  if (el.wizardSub) {
    el.wizardSub.textContent = step
      ? step.sub
      : 'Önerdiklerimizi değiştirebilir, istediğin zaman yenilerini ekleyebilirsin.';
  }

  renderProgress();
  if (step) renderOptions(step);
  else renderFields();
  renderFooter();
}

function next() {
  if (wizard.index < wizard.steps.length - 1) {
    wizard.index += 1;
    render();
    window.scrollTo(0, 0);
    return;
  }
  finish();
}

function back() {
  if (wizard.index === 0) return;
  wizard.index -= 1;
  render();
}

function finish() {
  if (wizard.selection.size < GAMIFICATION.minInterests) return;

  if (wizard.steps.includes('profile')) {
    setProfile({
      profileId: wizard.profileId,
      levelId: wizard.levelId,
      goalIds: [...wizard.goalIds],
    });
  }
  setInterests([...wizard.selection]);
  wizard.onDone?.();
}

/**
 * Testi ya da alan seçimini açar.
 * @param {() => void} done kaydedildiğinde çağrılır
 * @param {{ mode?: 'quiz'|'fields' }} [options]
 */
export function openOnboarding(done, { mode = 'quiz' } = {}) {
  const saved = getProfile();

  wizard.onDone = done;
  wizard.steps = mode === 'quiz' ? ['profile', 'level', 'goal', 'fields'] : ['fields'];
  wizard.index = 0;
  wizard.profileId = saved.profileId;
  wizard.levelId = saved.levelId;
  wizard.goalIds = new Set(saved.goalIds);
  wizard.selection = new Set(getInterests());
  // Alan seçimine doğrudan girildiyse öneri uygulanmaz; mevcut seçim korunur.
  wizard.seeded = mode !== 'quiz';

  render();
  showScreen('onboarding');
}

export function bindOnboarding() {
  if (el.interestSaveBtn) {
    el.interestSaveBtn.onclick = () => {
      if (stepName() === 'fields') finish();
      else next();
    };
  }
  if (el.wizardBackBtn) el.wizardBackBtn.onclick = back;
}
