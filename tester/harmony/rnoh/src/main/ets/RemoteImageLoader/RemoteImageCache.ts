import image from '@ohos.multimedia.image'

export class RemoteImageCache {
  private data: { [key: string]: image.ImageSource };
  private maxSize: number;

  constructor(maxSize: number) {
    this.data = {};
    this.maxSize = maxSize;
  }

  set(key: string, value: image.ImageSource): void {
    this.data[key] = value;

    // Check if cache size exceeds maxSize, and if so, remove the oldest entry
    if (Object.keys(this.data).length > this.maxSize) {
      const oldestKey = Object.keys(this.data)[0];
      delete this.data[oldestKey];
    }
  }

  get(key: string): image.ImageSource | undefined {
    return this.data[key];
  }

  has(key: string): boolean {
    return key in this.data;
  }

  remove(key: string): void {
    if (key in this.data) {
      delete this.data[key];
    }
  }

  clear(): void {
    this.data = {};
  }

  size(): number {
    return Object.keys(this.data).length;
  }
}