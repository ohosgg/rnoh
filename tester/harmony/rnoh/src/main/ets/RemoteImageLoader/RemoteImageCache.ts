import type image from '@ohos.multimedia.image';

export class RemoteImageCache<T> {
  protected data: Map<string, T>;
  protected maxSize: number;

  constructor(maxSize: number) {
    this.data = new Map<string, T>();
    this.maxSize = maxSize;
  }

  set(key: string, value: T): void {
    this.data.set(key, value);

    // Check if memoryCache size exceeds maxSize, and if so, remove the oldest entry
    if (this.data.size > this.maxSize) {
      const oldestKey = this.data.keys()[0];
      this.remove(oldestKey);
    }
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}

export class RemoteImageMemoryCache extends RemoteImageCache<image.ImageSource> {};
