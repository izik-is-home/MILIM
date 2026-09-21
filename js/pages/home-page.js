import { getActiveVocabularyCount } from '../services/vocabulary-service.js';
import { toggleElement, createElement, emptyElement, setText } from '../ui.js';
import { UI_TEXT } from '../data/ui-text.js';

async function init() {
  const container = document.getElementById('level-selection-container');
  const loader = document.getElementById('home-loader');
  const errorEl = document.getElementById('home-error-message');
  
  try {
    const activeCount = await getActiveVocabularyCount();
    
    // Hide loader
    loader.classList.add('hidden');
    
    const levels = [
      { pairs: 8, label: '8 צמדים (16 קלפים)' },
      { pairs: 16, label: '16 צמדים (32 קלפים)' },
      { pairs: 24, label: '24 צמדים (48 קלפים)' }
    ];
    
    levels.forEach(level => {
      const btn = createElement('a', ['btn']);
      btn.href = `./game.html?pairs=${level.pairs}`;
      btn.textContent = level.label;
      
      if (activeCount < level.pairs) {
        btn.classList.add('btn-secondary', 'is-disabled');
        btn.setAttribute('aria-disabled', 'true');
        btn.href = '#';
        btn.addEventListener('click', (e) => e.preventDefault());
      } else {
        btn.classList.add('btn-primary');
      }
      
      container.appendChild(btn);
    });

    if (activeCount < 8) {
      errorEl.textContent = UI_TEXT.ERRORS.NOT_ENOUGH_WORDS;
      toggleElement('home-error-message', true);
    }
    
  } catch (err) {
    console.error(err);
    loader.classList.add('hidden');
    errorEl.textContent = UI_TEXT.ERRORS.GENERIC;
    toggleElement('home-error-message', true);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
