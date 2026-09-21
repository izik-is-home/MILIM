import { createElement } from '../ui.js';

export class MemoryBoard {
  constructor(containerId, onCardClick) {
    this.container = document.getElementById(containerId);
    this.onCardClick = onCardClick;
  }

  render(cards, pairsCount) {
    this.container.innerHTML = '';
    this.container.setAttribute('data-pairs', pairsCount);

    cards.forEach(card => {
      const btn = createElement('button', ['memory-card']);
      btn.type = 'button';
      btn.setAttribute('aria-label', 'קלף סגור');
      btn.dataset.id = card.id;
      btn.dataset.type = card.type;

      if (card.isFlipped) btn.classList.add('is-flipped');
      if (card.isMatched) btn.classList.add('is-matched');
      if (card.isMatched && !card.isFlipped) btn.classList.add('is-hidden'); // fully removed visually

      const inner = createElement('span', ['memory-card__inner']);
      
      const back = createElement('span', ['memory-card__back']);
      back.setAttribute('aria-hidden', 'true');
      back.textContent = '?';
      
      const front = createElement('span', ['memory-card__front']);
      front.textContent = card.content;

      inner.appendChild(back);
      inner.appendChild(front);
      btn.appendChild(inner);

      btn.addEventListener('click', () => this.onCardClick(card.id));
      
      this.container.appendChild(btn);
    });
  }

  updateCard(card) {
    const btn = this.container.querySelector(`[data-id="${card.id}"]`);
    if (!btn) return;

    if (card.isFlipped) {
      btn.classList.add('is-flipped');
      btn.setAttribute('aria-label', card.content);
    } else {
      btn.classList.remove('is-flipped');
      btn.setAttribute('aria-label', 'קלף סגור');
    }

    if (card.isMatched) {
      btn.classList.add('is-matched');
      btn.setAttribute('disabled', 'true');
    } else {
      btn.classList.remove('is-matched');
      btn.removeAttribute('disabled');
    }
  }

  lockBoard() {
    this.container.style.pointerEvents = 'none';
  }

  unlockBoard() {
    this.container.style.pointerEvents = 'auto';
  }
}
