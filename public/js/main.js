import { register, go } from './router.js';
import { supabase } from './supabase.js';
import { current, loadSession } from './auth.js';
import { homeView } from './views/home.js';
import { editorView } from './views/editor.js';
import { studyView } from './views/study.js';
import { quizView } from './views/quiz.js';
import { loginView } from './views/login.js';
import { signupView } from './views/signup.js';
import { forgotView } from './views/forgot.js';
import { resetView } from './views/reset.js';
import { adminView } from './views/admin.js';
import { initBackground } from './background.js';

register('home', homeView);
register('editor', editorView);
register('study', studyView);
register('quiz', quizView);
register('login', loginView);
register('signup', signupView);
register('forgot', forgotView);
register('reset', resetView);
register('admin', adminView);

let recovery = location.hash.includes('type=recovery');

supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    recovery = true;
    go('reset');
  }
});

initBackground();
await loadSession();
go(recovery ? 'reset' : current.user ? 'home' : 'login');
