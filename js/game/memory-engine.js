import { MemoryState, GameStates } from './memory-state.js';
import { MemoryBoard } from './memory-board.js';
import { GameTimer } from './timer.js';
import { shuffle } from './shuffle.js';
import { getRandomActiveVocabularyItems } from '../services/vocabulary-service.js';

export class MemoryEngine {
  constructor({ boardContainerId, pairsCount, onStateChange, onTimerUpdate, onError }) {
    this.pairsCount = pairsCount;
    this.state = new MemoryState(pairsCount);
    this.board = new MemoryBoard(boardContainerId, this.handleCardClick.bind(this));
    this.timer = new GameTimer(onTimerUpdate);

    this.onStateChange = onStateChange;
    this.onError = onError;
    this.pairTimeout = null;
  }

  async start() {
    try {
      this.updateState(GameStates.LOADING);

      const words = await getRandomActiveVocabularyItems(this.pairsCount);
      if (!words || words.length < this.pairsCount) {
        throw new Error('Not enough active words to start the game.');
      }

      this.state.initCards(words);
      this.state.cards = shuffle(this.state.cards);
      this.board.render(this.state.cards, this.pairsCount);
      this.updateState(GameStates.READY);
    } catch (error) {
      console.error(error);
      this.updateState(GameStates.LOADING_ERROR);
      if (this.onError) this.onError(error);
    }
  }

  handleCardClick(cardId) {
    if (!this.state.canSelectCard(cardId)) return;

    if (this.state.state === GameStates.READY) {
      this.timer.start();
      this.updateState(GameStates.PLAYING);
    }

    this.state.selectCard(cardId);

    const card = this.state.cards.find((c) => c.id === cardId);
    if (card) {
      this.board.updateCard(card);
    }

    if (this.state.state === GameStates.CHECKING_PAIR) {
      this.board.lockBoard();

      const isMatch = this.state.checkMatch();

      if (isMatch) {
        this.playSuccessSound();
        const c1 = this.state.selectedCard1;
        const c2 = this.state.selectedCard2;

        if (c1) {
          c1.isMatched = true;
          this.board.updateCard(c1);
        }
        if (c2) {
          c2.isMatched = true;
          this.board.updateCard(c2);
        }
      }

      this.pairTimeout = setTimeout(() => {
        this.pairTimeout = null;
        const c1 = this.state.selectedCard1;
        const c2 = this.state.selectedCard2;

        this.state.handleMatchResult(isMatch);

        if (c1) this.board.updateCard(c1);
        if (c2) this.board.updateCard(c2);

        if (this.state.state === GameStates.FINISHED) {
          this.timer.stop();
          this.state.durationMs = this.timer.getDuration();
          this.board.lockBoard();
        } else {
          this.board.unlockBoard();
        }

        this.onStateChange(this.state);
      }, 1000);
    }

    this.onStateChange(this.state);
  }

  updateState(newState) {
    this.state.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  revealRemainingCards() {
    if (this.state.state === GameStates.LOADING || this.state.state === GameStates.FINISHED) return;

    if (this.pairTimeout) {
      clearTimeout(this.pairTimeout);
      this.pairTimeout = null;
    }

    this.timer.stop();
    this.state.cards.forEach((card) => {
      if (!card.isMatched) {
        card.isFlipped = true;
        this.board.updateCard(card);
      }
    });

    this.state.selectedCard1 = null;
    this.state.selectedCard2 = null;
    this.state.isCheckingPair = false;
    this.state.state = GameStates.REVEALED;
    this.board.lockBoard();
    this.onStateChange(this.state);
  }

  playSuccessSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startTime = audioContext.currentTime;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, startTime);
      oscillator.frequency.setValueAtTime(880, startTime + 0.1);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
      oscillator.addEventListener('ended', () => audioContext.close(), { once: true });
    } catch (error) {
      console.warn('Success sound unavailable:', error);
    }
  }

  exit() {
    this.timer.stop();
    this.board.lockBoard();
  }
}
