// ==================================================================
// Daily English — giriş noktası
// Tüm olay bağlamaları burada toplanır; ekran modülleri saf kalır.
// Savunmacı kodlama: eksik DOM elemanı tüm uygulamayı çökertmez.
// ==================================================================

import { el } from './dom.js';
import { loadManifest } from './data/repository.js';
import { hasChosenInterests } from './store/interests.js';
import { renderHeader } from './ui/header.js';
import { bindCardControls, refreshCardView } from './screens/cards.js';
import { backToField, refreshField } from './screens/field.js';
import { bindHome, goHome } from './screens/home.js';
import { currentScreen, showScreen } from './screens/navigation.js';
import { bindOnboarding, openOnboarding } from './screens/onboarding.js';
import { advanceQuiz, startQuiz, submitTypedAnswer } from './screens/quiz.js';
import { state } from './state.js';

/** Geri butonunun her ekrandan nereye götürdüğü. */
const BACK_TARGETS = {
  // Tekrar seansı bir kategoriye ait değil; oradan çıkış anasayfaya olur.
  field: goHome,
  cards: () => (state.deckMode === 'review' ? goHome() : backToField()),
  quiz: () => {
    refreshCardView();
    showScreen('cards');
  },
};

function bindChrome() {
  if (el.backBtn) {
    el.backBtn.onclick = () => BACK_TARGETS[currentScreen()]?.();
  }
}

function bindQuizControls() {
  if (el.quizBtn) el.quizBtn.onclick = startQuiz;
  if (el.quizNextBtn) el.quizNextBtn.onclick = advanceQuiz;
  if (el.quizRetryBtn) el.quizRetryBtn.onclick = startQuiz;
  if (el.quizTypeForm) {
    el.quizTypeForm.onsubmit = (event) => {
      event.preventDefault();
      submitTypedAnswer();
    };
  }
  if (el.quizBackBtn) {
    el.quizBackBtn.onclick = () => {
      refreshField();
      refreshCardView();
      showScreen('cards');
    };
  }
}

/** Alan ekle/çıkar: testi tekrarlatmadan yalnızca alan listesini açar. */
function editInterests() {
  openOnboarding(goHome, { mode: 'fields' });
}

/** Tanışma testini baştan çözdürür. */
function retakeQuiz() {
  openOnboarding(goHome, { mode: 'quiz' });
}

async function start() {
  try {
    await loadManifest();
  } catch (error) {
    console.error(error);
    document.querySelector('main').innerHTML =
      '<p class="app-message">Kelime listesi yüklenemedi.<br>' +
      'Uygulamayı yerel bir sunucu üzerinden açtığından emin ol.</p>';
    return;
  }

  bindChrome();
  bindOnboarding();
  bindHome(editInterests, retakeQuiz);
  bindCardControls();
  bindQuizControls();
  renderHeader();

  // Alan seçmiş kullanıcı (eski sürümden gelenler dâhil) doğrudan anasayfaya girer;
  // testi çözmemişse anasayfadaki çip onu tanışma testine çağırır.
  if (hasChosenInterests()) {
    goHome();
  } else {
    openOnboarding(goHome, { mode: 'quiz' });
  }
}

start();
