import { getSession } from './services/auth-service.js';

async function initApp() {
  // Check if we need to show/hide admin link based on session
  const linkAdmin = document.getElementById('link-admin');
  if (linkAdmin) {
    const { session } = await getSession();
    if (session) {
      linkAdmin.style.display = 'inline-flex';
    }
  }

  // Handle service worker registration
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('SW registered');
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
}

// Run init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);
