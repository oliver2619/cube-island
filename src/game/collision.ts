export class CollisionMnemento {
    private action: () => void = null;
    
    constructor(private _timeout: number) {}
    
    get timeout(): number {return this._timeout;}
    
    addCollision(action: () => void, timeout: number){
        this.action = action;
        this._timeout = timeout;
    }
    
    applyCollision(): void {
        this.action();
    }
    
    hasCollision(): boolean {return this.action !== null;}
}