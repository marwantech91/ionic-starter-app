import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage | null = null;
  private ready$ = new BehaviorSubject<boolean>(false);

  constructor(private ionicStorage: Storage) {
    this.init();
  }

  private async init(): Promise<void> {
    this.storage = await this.ionicStorage.create();
    this.ready$.next(true);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.waitForReady();
    await this.storage?.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    await this.waitForReady();
    return this.storage?.get(key) ?? null;
  }

  async remove(key: string): Promise<void> {
    await this.waitForReady();
    await this.storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this.waitForReady();
    await this.storage?.clear();
  }

  async keys(): Promise<string[]> {
    await this.waitForReady();
    return this.storage?.keys() ?? [];
  }

  private waitForReady(): Promise<void> {
    return new Promise(resolve => {
      if (this.ready$.getValue()) {
        resolve();
      } else {
        const sub = this.ready$.subscribe(ready => {
          if (ready) {
            sub.unsubscribe();
            resolve();
          }
        });
      }
    });
  }
}

// Offline sync service
@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private syncQueue: SyncItem[] = [];
  private readonly QUEUE_KEY = 'sync_queue';

  constructor(private storage: StorageService) {
    this.loadQueue();
  }

  private async loadQueue(): Promise<void> {
    const queue = await this.storage.get<SyncItem[]>(this.QUEUE_KEY);
    this.syncQueue = queue ?? [];
  }

  async addToQueue(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    const syncItem: SyncItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    await this.saveQueue();
  }

  async sync(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const item of [...this.syncQueue]) {
      try {
        await this.processItem(item);
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
        results.push({ id: item.id, success: true });
      } catch (error) {
        results.push({ id: item.id, success: false, error: (error as Error).message });
      }
    }

    await this.saveQueue();
    return results;
  }

  private async processItem(item: SyncItem): Promise<void> {
    // Implement API sync logic
    console.log('Syncing item:', item);
  }

  private async saveQueue(): Promise<void> {
    await this.storage.set(this.QUEUE_KEY, this.syncQueue);
  }

  getPendingCount(): number {
    return this.syncQueue.length;
  }

  async retryFailed(): Promise<SyncResult[]> {
    const failed = this.syncQueue.filter(item => item.attempts > 0);
    // Reset attempts before retrying
    failed.forEach(item => item.attempts = 0);
    await this.saveQueue();
    return this.sync();
  }
}

interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
}

interface SyncResult {
  id: string;
  success: boolean;
  error?: string;
}
