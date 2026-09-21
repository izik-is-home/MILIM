import { requireAdmin, signOut } from '../services/auth-service.js';
import { getAllVocabularyItems, createVocabularyItem, updateVocabularyItem } from '../services/vocabulary-service.js';
import { toggleElement, setText, createElement, emptyElement } from '../ui.js';
import { redirect } from '../router.js';

let allWords = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Protect route
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return;
  } catch (error) {
    redirect('./login.html');
    return;
  }

  toggleElement('auth-loading', false);
  toggleElement('main-content', true);

  await loadWords();
  setupEventListeners();
});

async function loadWords() {
  toggleElement('list-loading', true);
  toggleElement('words-list', false);
  toggleElement('words-empty', false);
  
  try {
    allWords = await getAllVocabularyItems();
    renderWordsList();
  } catch (error) {
    console.error(error);
  } finally {
    toggleElement('list-loading', false);
  }
}

function renderWordsList() {
  const container = document.getElementById('words-list');
  emptyElement('words-list');
  
  const search = document.getElementById('search-input').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  
  const filtered = allWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(search) || word.meaning.toLowerCase().includes(search);
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = word.is_active;
    if (statusFilter === 'inactive') matchesStatus = !word.is_active;
    
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    toggleElement('words-empty', true);
    toggleElement('words-list', false);
    return;
  }

  toggleElement('words-empty', false);
  toggleElement('words-list', true);

  filtered.forEach(word => {
    const item = createElement('div', ['word-item']);
    if (!word.is_active) item.classList.add('is-inactive');
    
    const info = createElement('div', ['word-info']);
    info.appendChild(createElement('div', ['word-term'], word.word));
    info.appendChild(createElement('div', ['word-meaning'], word.meaning));
    if (word.category) {
      info.appendChild(createElement('div', ['word-meta'], `קטגוריה: ${word.category}`));
    }
    
    const actions = createElement('div', ['word-actions']);
    const editBtn = createElement('button', ['btn', 'btn-secondary'], 'ערוך');
    editBtn.addEventListener('click', () => loadWordToForm(word));
    
    actions.appendChild(editBtn);
    
    item.appendChild(info);
    item.appendChild(actions);
    
    container.appendChild(item);
  });
}

function loadWordToForm(word) {
  editingId = word.id;
  setText('form-title', 'עריכת מילה');
  document.getElementById('word-id').value = word.id;
  document.getElementById('word').value = word.word;
  document.getElementById('meaning').value = word.meaning;
  document.getElementById('example').value = word.example_sentence || '';
  document.getElementById('category').value = word.category || '';
  document.getElementById('is_active').checked = word.is_active;
  
  toggleElement('btn-cancel-edit', true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  setText('form-title', 'הוספת מילה חדשה');
  document.getElementById('word-form').reset();
  document.getElementById('word-id').value = '';
  document.getElementById('is_active').checked = true;
  toggleElement('btn-cancel-edit', false);
  toggleElement('form-error', false);
  toggleElement('form-success', false);
}

function setupEventListeners() {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await signOut();
    redirect('./login.html');
  });

  document.getElementById('search-input').addEventListener('input', renderWordsList);
  document.getElementById('filter-status').addEventListener('change', renderWordsList);
  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

  document.getElementById('word-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleElement('form-error', false);
    toggleElement('form-success', false);
    
    const btn = document.getElementById('btn-save-word');
    btn.disabled = true;

    const data = {
      word: document.getElementById('word').value.trim(),
      meaning: document.getElementById('meaning').value.trim(),
      example_sentence: document.getElementById('example').value.trim() || null,
      category: document.getElementById('category').value.trim() || null,
      is_active: document.getElementById('is_active').checked
    };

    try {
      if (editingId) {
        await updateVocabularyItem(editingId, data);
      } else {
        await createVocabularyItem(data);
      }
      
      toggleElement('form-success', true);
      resetForm();
      await loadWords();
      
      setTimeout(() => toggleElement('form-success', false), 3000);
    } catch (error) {
      console.error(error);
      setText('form-error', 'שגיאה בשמירה. ודאו שאין כפילויות.');
      toggleElement('form-error', true);
    } finally {
      btn.disabled = false;
    }
  });
}
