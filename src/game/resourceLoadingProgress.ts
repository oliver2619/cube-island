export class ResourceLoadingProgress {
    private totalCount = 0;
    private loaded = 0;

    constructor(private complete: (progress: number, total: number) => void) {}

    addResource(): void {
        ++this.totalCount;
    }

    resourceLoaded(): void {
        ++this.loaded;
        this.complete(this.loaded, this.totalCount);
    }
}

