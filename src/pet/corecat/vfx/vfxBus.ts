import type { CoreCatVfxEvent } from "./vfxTypes";

export type CoreCatVfxListener = (event: CoreCatVfxEvent) => void;

export class CoreCatVfxBus {
  private readonly listeners = new Set<CoreCatVfxListener>();

  emit(event: CoreCatVfxEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: CoreCatVfxListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear() {
    this.listeners.clear();
  }
}

export function createCoreCatVfxBus() {
  return new CoreCatVfxBus();
}

export const coreCatVfxBus = createCoreCatVfxBus();
