import { signInWithPassword, requireAdmin } from '../services/auth-service.js';
import { toggleElement, setText } from '../ui.js';
import { redirect } from '../router.js';
import { UI_TEXT } from '../data/ui-text.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleElement('login-error', false);
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    btn.disabled = true;
    btn.textContent = 'מתחבר...';

    try {
      await signInWithPassword(email, password);
      // Verify if they are an admin before redirecting
      const isAdmin = await requireAdmin();
      if (isAdmin) {
        redirect('./admin.html');
      }
    } catch (error) {
      console.error(error);
      setText('login-error', UI_TEXT.ADMIN.LOGIN_FAILED);
      toggleElement('login-error', true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'התחברות';
    }
  });
});
