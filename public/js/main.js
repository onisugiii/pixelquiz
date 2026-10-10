import { register, go } from './router.js';
import { homeView } from './views/home.js';
import { editorView } from './views/editor.js';
import { studyView } from './views/study.js';
import { quizView } from './views/quiz.js';

register('home', homeView);
register('editor', editorView);
register('study', studyView);
register('quiz', quizView);

go('home');
