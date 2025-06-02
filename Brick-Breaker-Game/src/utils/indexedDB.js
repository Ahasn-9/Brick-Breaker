const DB_NAME = 'BrickBreakerDB';
const DB_VERSION = 1;
const STORE_NAME = 'highScores';

// Initialize the database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Error opening database');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Save high score with name
export const saveHighScore = async (score, name) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({ score, name, timestamp: new Date().toISOString() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error saving high score');
    });
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

// Get all high scores
export const getHighScores = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error getting high scores');
    });
  } catch (error) {
    console.error('Error getting high scores:', error);
    return [];
  }
};

// Get highest score and name
export const getHighestScore = async () => {
  try {
    const scores = await getHighScores();
    if (scores.length === 0) return { score: 0, name: '' };
    const highest = scores.reduce((max, s) => (s.score > max.score ? s : max), scores[0]);
    return { score: highest.score, name: highest.name };
  } catch (error) {
    console.error('Error getting highest score:', error);
    return { score: 0, name: '' };
  }
}; 