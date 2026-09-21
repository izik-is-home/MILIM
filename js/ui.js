// Safe UI manipulations avoiding innerHTML where possible

export function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

export function showElement(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.classList.remove('hidden');
    // If it's a dialog and showElement is used to open it as modal, prefer standard API
    if (el.tagName === 'DIALOG' && !el.open) {
      el.showModal();
    }
  }
}

export function hideElement(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.classList.add('hidden');
    if (el.tagName === 'DIALOG' && el.open) {
      el.close();
    }
  }
}

export function toggleElement(elementId, show) {
  if (show) {
    showElement(elementId);
  } else {
    hideElement(elementId);
  }
}

// Clear all children of an element safely
export function emptyElement(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
}

// Creates an element with classes and text content
export function createElement(tag, classes = [], textContent = '') {
  const el = document.createElement(tag);
  if (classes.length) {
    el.classList.add(...classes);
  }
  if (textContent) {
    el.textContent = textContent;
  }
  return el;
}
