import { getLeaderboard } from '../services/leaderboard-service.js';
import { formatTime, formatDate } from '../formatters.js';
import { createElement, emptyElement, toggleElement } from '../ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      // Update UI
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      
      const pairs = parseInt(tab.dataset.pairs, 10);
      await loadLeaderboard(pairs);
    });
  });

  // Load initial (8 pairs)
  loadLeaderboard(8);
});

async function loadLeaderboard(pairsCount) {
  toggleElement('leaderboard-loading', true);
  toggleElement('leaderboard-error', false);
  toggleElement('leaderboard-empty', false);
  toggleElement('leaderboard-list', false);
  
  const listContainer = document.getElementById('leaderboard-list');
  emptyElement('leaderboard-list');

  try {
    const scores = await getLeaderboard(pairsCount);
    
    toggleElement('leaderboard-loading', false);
    
    if (scores.length === 0) {
      toggleElement('leaderboard-empty', true);
      return;
    }

    scores.forEach((score, index) => {
      const item = createElement('div', ['leaderboard-item']);
      
      const rank = createElement('div', ['lb-rank'], (index + 1).toString());
      
      const details = createElement('div', ['lb-details']);
      
      const name = createElement('div', ['lb-name'], score.display_name);
      const time = createElement('div', ['lb-time'], formatTime(score.duration_ms));
      const date = createElement('div', ['lb-date'], formatDate(score.created_at));
      
      details.appendChild(name);
      details.appendChild(time);
      details.appendChild(date);
      
      item.appendChild(rank);
      item.appendChild(details);
      
      listContainer.appendChild(item);
    });

    toggleElement('leaderboard-list', true);

  } catch (error) {
    console.error('Leaderboard error:', error);
    toggleElement('leaderboard-loading', false);
    toggleElement('leaderboard-error', true);
  }
}
