import { SavedItem, QuizSubmission } from '../types';

const SAVED_ITEMS_KEY = 'edugenie_saved_items_v1';
const QUIZ_HISTORY_KEY = 'edugenie_quiz_history_v1';

export const storageService = {
  getSavedItems(): SavedItem[] {
    try {
      const data = localStorage.getItem(SAVED_ITEMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveItem(item: Omit<SavedItem, 'id' | 'createdAt'>): SavedItem {
    const items = this.getSavedItems();
    const newItem: SavedItem = {
      ...item,
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    const updated = [newItem, ...items];
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    return newItem;
  },

  deleteSavedItem(id: string): void {
    const items = this.getSavedItems().filter((i) => i.id !== id);
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  },

  clearSavedItems(): void {
    try {
      localStorage.removeItem(SAVED_ITEMS_KEY);
    } catch (e) {
      console.error(e);
    }
  },

  getQuizHistory(): QuizSubmission[] {
    try {
      const data = localStorage.getItem(QUIZ_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQuizSubmission(submission: QuizSubmission): void {
    const history = this.getQuizHistory();
    const updated = [submission, ...history.slice(0, 19)];
    try {
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  },
};
