import { signInWithPassword } from '../services/auth-service.js';
import { toggleElement, setText } from '../ui.js';
import { redirect } from '../router.js';
import { UI_TEXT } from '../data/ui-text.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
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
      // Login succeeded — go to admin. The admin page itself will verify admin rights.
      redirect('./admin.html');
    } catch (error) {
      console.error(error);
      setText('login-error', UI_TEXT.ADMIN.LOGIN_FAILED);
      toggleElement('login-error', true);
      btn.disabled = false;
      btn.textContent = 'התחברות';
    }
  });
});
