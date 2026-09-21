import { getQueryParam, redirect } from '../router.js';
import { validatePairsCount, validateName, sanitizeName } from '../validation.js';
import { toggleElement, setText, showElement, hideElement } from '../ui.js';
import { formatTime } from '../formatters.js';
import { MemoryEngine } from '../game/memory-engine.js';
import { GameStates } from '../game/memory-state.js';
import { submitScore } from '../services/leaderboard-service.js';
import { UI_TEXT } from '../data/ui-text.js';

let engine;

document.addEventListener('DOMContentLoaded', () => {
  const pairsParam = getQueryParam('pairs');
  const pairsCount = validatePairsCount(pairsParam);
  
  if (!pairsCount) {
    redirect('./index.html');
    return;
  }

  setText('game-level-text', `${pairsCount} ${UI_TEXT.GAME.PAIRS}`);
  setText('match-counter', `0 / ${pairsCount}`);
  
  engine = new MemoryEngine({
    boardContainerId: 'memory-board',
    pairsCount: pairsCount,
    onStateChange: handleStateChange,
    onTimerUpdate: handleTimerUpdate,
    onError: handleError
  });

  setupEventListeners();
  engine.start();
});

function handleStateChange(state) {
  if (state.state === GameStates.LOADING) {
    showElement('game-loading');
    hideElement('game-board-container');
    hideElement('game-error');
  } else if (state.state === GameStates.READY || state.state === GameStates.PLAYING) {
    hideElement('game-loading');
    showElement('game-board-container');
  } else if (state.state === GameStates.FINISHED) {
    showGameOverModal(state);
  }

  setText('match-counter', `${state.matchedPairs} / ${state.pairsCount}`);
}

function handleTimerUpdate(durationMs) {
  setText('game-timer', formatTime(durationMs));
}

function handleError(error) {
  hideElement('game-loading');
  hideElement('game-board-container');
  showElement('game-error');
}

function showGameOverModal(state) {
  setText('final-time-text', formatTime(state.durationMs));
  setText('final-level-text', `${state.pairsCount} ${UI_TEXT.GAME.PAIRS}`);
  
  showElement('modal-game-over');
}

function setupEventListeners() {
  const btnExit = document.getElementById('btn-exit-game');
  btnExit.addEventListener('click', () => {
    engine.exit();
    showElement('modal-exit');
  });

  document.getElementById('btn-resume-game').addEventListener('click', () => {
    hideElement('modal-exit');
    if (engine.state.state === GameStates.PLAYING) {
      engine.timer.start();
    }
    engine.board.unlockBoard();
  });

  document.getElementById('btn-confirm-exit').addEventListener('click', () => {
    redirect('./index.html');
  });

  // Score Form
  const scoreForm = document.getElementById('score-form');
  scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('player-name-input');
    const name = nameInput.value;

    if (!validateName(name)) {
      setText('score-error-text', UI_TEXT.ERRORS.INVALID_NAME);
      showElement('score-error-text');
      return;
    }
    hideElement('score-error-text');

    const btnSubmit = document.getElementById('btn-save-score');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'שומר...';

    try {
      await submitScore({
        gameType: 'memory',
        pairsCount: engine.state.pairsCount,
        durationMs: engine.state.durationMs,
        displayName: sanitizeName(name)
      });
      
      hideElement('score-saving-section');
      showElement('score-saved-section');
    } catch (error) {
      console.error(error);
      setText('score-error-text', UI_TEXT.ERRORS.SAVE_SCORE_FAILED);
      showElement('score-error-text');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'שמור שיא';
    }
  });

  document.getElementById('btn-skip-score').addEventListener('click', () => {
    hideElement('score-saving-section');
    showElement('score-skipped-section');
  });

  document.getElementById('btn-new-game-saved').addEventListener('click', () => location.reload());
  document.getElementById('btn-new-game-skipped').addEventListener('click', () => location.reload());
}
