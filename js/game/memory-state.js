export const GameStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  CHECKING_PAIR: 'checking_pair',
  FINISHED: 'finished',
  ERROR: 'error'
};

export class MemoryState {
  constructor(pairsCount) {
    this.pairsCount = pairsCount;
    this.state = GameStates.IDLE;
    this.cards = []; // Array of card objects
    this.matchedPairs = 0;
    this.selectedCard1 = null;
    this.selectedCard2 = null;
    this.durationMs = 0;
  }

  canSelectCard(cardId) {
    if (this.state !== GameStates.PLAYING && this.state !== GameStates.READY) return false;
    
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return false;
    
    if (card.isFlipped || card.isMatched) return false;
    
    // Can only select if we haven't selected 2 cards yet
    return !this.selectedCard2;
  }

  selectCard(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    card.isFlipped = true;

    if (!this.selectedCard1) {
      this.selectedCard1 = card;
    } else if (!this.selectedCard2) {
      this.selectedCard2 = card;
      this.state = GameStates.CHECKING_PAIR;
    }
  }

  checkMatch() {
    if (!this.selectedCard1 || !this.selectedCard2) return false;

    const isMatch = (this.selectedCard1.pairId === this.selectedCard2.pairId) && 
                    (this.selectedCard1.type !== this.selectedCard2.type);
    
    return isMatch;
  }

  handleMatchResult(isMatch) {
    if (isMatch) {
      this.selectedCard1.isMatched = true;
      this.selectedCard2.isMatched = true;
      this.matchedPairs += 1;
    } else {
      this.selectedCard1.isFlipped = false;
      this.selectedCard2.isFlipped = false;
    }

    this.selectedCard1 = null;
    this.selectedCard2 = null;
    
    if (this.matchedPairs === this.pairsCount) {
      this.state = GameStates.FINISHED;
    } else {
      this.state = GameStates.PLAYING;
    }
  }

  initCards(vocabularyItems) {
    const cards = [];
    
    vocabularyItems.forEach((item, index) => {
      // Word card
      cards.push({
        id: `card-w-${index}`,
        pairId: item.id,
        type: 'word',
        content: item.word,
        isFlipped: false,
        isMatched: false
      });
      
      // Meaning card
      cards.push({
        id: `card-m-${index}`,
        pairId: item.id,
        type: 'meaning',
        content: item.meaning,
        isFlipped: false,
        isMatched: false
      });
    });

    this.cards = cards;
  }
}
