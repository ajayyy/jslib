import { CipherView } from '../view';

const CacheTTL = 3000;

export class SortedCiphersCache {
    private readonly sortedCiphersByUrl: Map<string, Ciphers> = new Map<string, Ciphers>();
    private readonly timeouts: Map<string, any> = new Map<string, any>();

    constructor(private readonly comparator: (a: CipherView, b: CipherView) => number) { }

    isCached(url: string) {
        return this.sortedCiphersByUrl.has(url);
    }

    addCiphers(url: string, ciphers: CipherView[]) {
        ciphers.sort(this.comparator);
        this.sortedCiphersByUrl.set(url, new Ciphers(ciphers));
        this.resetTimer(url);
    }

    getLastUsed(url: string) {
        this.resetTimer(url);
        return this.isCached(url) ? this.sortedCiphersByUrl.get(url).getLastUsed() : null;
    }

    getNext(url: string) {
        this.resetTimer(url);
        return this.isCached(url) ? this.sortedCiphersByUrl.get(url).getNext() : null;
    }

    clear() {
        this.sortedCiphersByUrl.clear();
        this.timeouts.clear();
    }

    private resetTimer(url: string) {
        clearTimeout(this.timeouts.get(url));
        this.timeouts.set(url, setTimeout(() => {
            this.sortedCiphersByUrl.delete(url);
            this.timeouts.delete(url);
        }, CacheTTL));
    }
}

class Ciphers {
    lastUsedIndex = -1;

    constructor(private readonly ciphers: CipherView[]) { }

    getLastUsed() {
        this.lastUsedIndex = Math.max(this.lastUsedIndex, 0);
        return this.ciphers[this.lastUsedIndex];
    }

    getNext() {
        const nextIndex = (this.lastUsedIndex + 1) % this.ciphers.length;
        this.lastUsedIndex = nextIndex;
        return this.ciphers[nextIndex];
    }
}
