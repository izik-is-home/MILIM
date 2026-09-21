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
  }

  async start() {
    try {
      this.updateState(GameStates.LOADING);
      
      const words = await getRandomActiveVocabularyItems(this.pairsCount);
      
      this.state.initCards(words);
      this.state.cards = shuffle(this.state.cards);
      
      this.board.render(this.state.cards, this.pairsCount);
      
      this.updateState(GameStates.READY);
    } catch (error) {
      console.error(error);
      this.updateState(GameStates.ERROR);
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
    
    // Update UI for the flipped card
    const card = this.state.cards.find(c => c.id === cardId);
    this.board.updateCard(card);

    if (this.state.state === GameStates.CHECKING_PAIR) {
      this.board.lockBoard();
      
      const isMatch = this.state.checkMatch();
      
      // Wait 1 second before resolving
      setTimeout(() => {
        const c1 = this.state.selectedCard1;
        const c2 = this.state.selectedCard2;
        
        this.state.handleMatchResult(isMatch);
        
        this.board.updateCard(c1);
        this.board.updateCard(c2);
        
        if (this.state.state === GameStates.FINISHED) {
          this.timer.stop();
          this.state.durationMs = this.timer.getDuration();
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

  exit() {
    this.timer.stop();
    this.board.lockBoard();
  }
}
