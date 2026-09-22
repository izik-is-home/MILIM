import { requireAdmin, signOut } from '../services/auth-service.js';
import {
  getAllVocabularyItems,
  createVocabularyItem,
  createVocabularyItems,
  updateVocabularyItem,
  deleteVocabularyItem
} from '../services/vocabulary-service.js';
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
  const sortOrder = document.getElementById('sort-words').value;
  
  const filtered = allWords.filter(word => {
    const searchableText = [
      word.word,
      word.meaning,
      word.category,
      word.example_sentence
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = searchableText.includes(search);
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = word.is_active;
    if (statusFilter === 'inactive') matchesStatus = !word.is_active;
    
    return matchesSearch && matchesStatus;
  });

  filtered.sort((left, right) => compareWords(left, right, sortOrder));

  setText('words-count', `(${allWords.length} מילים)`);

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
    if (word.word_number != null) {
      info.appendChild(createElement('div', ['word-number'], `מספר ${word.word_number}`));
    }
    info.appendChild(createElement('div', ['word-term'], word.word));
    info.appendChild(createElement('div', ['word-meaning'], word.meaning));
    if (word.category) {
      info.appendChild(createElement('div', ['word-meta'], `קטגוריה: ${word.category}`));
    }
    if (word.example_sentence) {
      info.appendChild(createElement('div', ['word-example'], `דוגמה: ${word.example_sentence}`));
    }
    
    const actions = createElement('div', ['word-actions']);
    const editBtn = createElement('button', ['btn', 'btn-secondary'], 'ערוך');
    editBtn.addEventListener('click', () => loadWordToForm(word));

    const deleteBtn = createElement('button', ['btn', 'btn-danger'], 'מחק');
    deleteBtn.addEventListener('click', () => removeWord(word));
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(info);
    item.appendChild(actions);
    
    container.appendChild(item);
  });
}

function compareWords(left, right, sortOrder) {
  if (sortOrder === 'number-asc' || sortOrder === 'number-desc') {
    const result = Number(left.word_number || 0) - Number(right.word_number || 0);
    return sortOrder === 'number-asc' ? result : -result;
  }

  const result = String(left.word).localeCompare(String(right.word), 'he', {
    sensitivity: 'base'
  });
  return sortOrder === 'word-asc' ? result : -result;
}

async function removeWord(word) {
  const confirmed = window.confirm(`למחוק את המילה "${word.word}"? לא ניתן לבטל פעולה זו.`);
  if (!confirmed) return;

  try {
    await deleteVocabularyItem(word.id);
    allWords = allWords.filter((item) => item.id !== word.id);
    renderWordsList();
    setText('form-success', `המילה "${word.word}" נמחקה בהצלחה`);
    toggleElement('form-success', true);
  } catch (error) {
    console.error(error);
    setText('form-error', 'שגיאה במחיקת המילה. נסו שוב.');
    toggleElement('form-error', true);
  }
}

function parseImportFile(text) {
  const rows = text.replace(/^\uFEFF/, '').split('|');
  const items = [];
  const errors = [];

  rows.forEach((rawRow, index) => {
    const row = rawRow.trim();
    if (!row) return;

    const columns = row.split(';').map((column) => column.trim());
    if (columns.length < 2 || columns.length > 5) {
      errors.push(`שורה ${index + 1}: נדרשות 2 עד 5 עמודות`);
      return;
    }

    const [word, meaning, exampleSentence, category, activeValue] = columns;
    if (!word || !meaning) {
      errors.push(`שורה ${index + 1}: חסרה מילה או משמעות`);
      return;
    }

    let isActive = true;
    if (activeValue) {
      const normalizedActive = activeValue.toLowerCase();
      if (['true', '1', 'כן', 'פעיל'].includes(normalizedActive)) {
        isActive = true;
      } else if (['false', '0', 'לא', 'לא פעיל'].includes(normalizedActive)) {
        isActive = false;
      } else {
        errors.push(`שורה ${index + 1}: הערך הפעיל חייב להיות true/false או כן/לא`);
        return;
      }
    }

    items.push({
      word,
      meaning,
      example_sentence: exampleSentence || null,
      category: category || null,
      is_active: isActive
    });
  });

  return { items, errors };
}

async function importWordsFromFile(file) {
  const text = await file.text();
  const { items, errors } = parseImportFile(text);
  if (errors.length) {
    throw new Error(errors.slice(0, 5).join(' | '));
  }
  if (!items.length) throw new Error('הקובץ אינו מכיל שורות תקינות.');

  await createVocabularyItems(items);
  return items.length;
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
  document.getElementById('sort-words').addEventListener('change', renderWordsList);
  document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

  document.getElementById('words-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    try {
      const importedCount = await importWordsFromFile(file);
      setText('form-success', `${importedCount} מילים יובאו בהצלחה`);
      toggleElement('form-success', true);
      await loadWords();
    } catch (error) {
      console.error(error);
      setText('form-error', error.message || 'שגיאה בייבוא הקובץ.');
      toggleElement('form-error', true);
    }
  });

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
      
      resetForm();
      toggleElement('form-success', true);
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
