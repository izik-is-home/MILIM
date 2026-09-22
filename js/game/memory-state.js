export const GameStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  CHECKING_PAIR: 'checking_pair',
  REVEALED: 'revealed',
  FINISHED: 'finished',
  SCORE_ENTRY: 'score_entry',
  SCORE_SAVED: 'score_saved',
  SCORE_SKIPPED: 'score_skipped',
  LOADING_ERROR: 'loading_error',
  SAVE_SCORE_ERROR: 'save_score_error',
  NETWORK_ERROR: 'network_error',
  ERROR: 'error'
};

export class MemoryState {
  constructor(pairsCount) {
    this.pairsCount = pairsCount;
    this.state = GameStates.IDLE;
    this.cards = [];
    this.matchedPairs = 0;
    this.selectedCard1 = null;
    this.selectedCard2 = null;
    this.isCheckingPair = false;
    this.durationMs = 0;
  }

  canSelectCard(cardId) {
    if (this.state !== GameStates.PLAYING && this.state !== GameStates.READY) return false;
    if (this.isCheckingPair) return false;

    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return false;
    if (card.isFlipped || card.isMatched) return false;

    return !this.selectedCard2;
  }

  selectCard(cardId) {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return;

    card.isFlipped = true;

    if (!this.selectedCard1) {
      this.selectedCard1 = card;
      return;
    }

    if (!this.selectedCard2) {
      this.selectedCard2 = card;
      this.isCheckingPair = true;
      this.state = GameStates.CHECKING_PAIR;
    }
  }

  checkMatch() {
    if (!this.selectedCard1 || !this.selectedCard2) return false;
    if (this.selectedCard1.id === this.selectedCard2.id) return false;

    const samePair = this.selectedCard1.pairId === this.selectedCard2.pairId;
    const differentType = this.selectedCard1.type !== this.selectedCard2.type;

    return samePair && differentType;
  }

  handleMatchResult(isMatch) {
    if (!this.selectedCard1 || !this.selectedCard2) {
      this.isCheckingPair = false;
      this.state = this.matchedPairs === this.pairsCount ? GameStates.FINISHED : GameStates.PLAYING;
      return;
    }

    const matched = Boolean(isMatch);

    if (matched) {
      this.selectedCard1.isMatched = true;
      this.selectedCard2.isMatched = true;
      this.matchedPairs += 1;
    } else {
      this.selectedCard1.isFlipped = false;
      this.selectedCard2.isFlipped = false;
      this.selectedCard1.isMatched = false;
      this.selectedCard2.isMatched = false;
    }

    this.selectedCard1 = null;
    this.selectedCard2 = null;
    this.isCheckingPair = false;

    if (this.matchedPairs === this.pairsCount) {
      this.state = GameStates.FINISHED;
    } else {
      this.state = GameStates.PLAYING;
    }
  }

  initCards(vocabularyItems) {
    const cards = [];

    vocabularyItems.forEach((item, index) => {
      cards.push({
        id: `card-w-${index}-${item.id}`,
        pairId: item.id,
        type: 'word',
        content: item.word,
        isFlipped: false,
        isMatched: false
      });

      cards.push({
        id: `card-m-${index}-${item.id}`,
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
