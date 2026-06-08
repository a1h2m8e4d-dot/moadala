// ملوك المعادلة - نظام التخزين المحلي للملفات والفيديوهات (IndexedDB Media Store)

class IndexedDBMediaStore {
  constructor() {
    this.dbName = 'MolokMediaStore';
    this.storeName = 'media';
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  saveMedia(file) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const id = 'local_file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const record = {
          id: id,
          name: file.name,
          type: file.type,
          data: file, // Blobs are directly storable in IndexedDB
          timestamp: Date.now()
        };

        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(record);

        request.onsuccess = () => {
          resolve(id);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }

  getMedia(id) {
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = (event) => {
          if (event.target.result) {
            resolve(event.target.result);
          } else {
            reject(new Error('Media file not found: ' + id));
          }
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }

  getMediaUrl(id) {
    // If it's already an HTTP or HTTPS link, return it directly
    if (typeof id === 'string' && (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:'))) {
      return Promise.resolve(id);
    }
    
    return this.getMedia(id)
      .then((record) => {
        return URL.createObjectURL(record.data);
      })
      .catch((err) => {
        console.error('Error generating media URL:', err);
        return '';
      });
  }

  deleteMedia(id) {
    if (typeof id === 'string' && (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('data:'))) {
      return Promise.resolve();
    }
    
    return this.init().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }
}

const mediaStore = new IndexedDBMediaStore();
window.mediaStore = mediaStore;
export default mediaStore;
