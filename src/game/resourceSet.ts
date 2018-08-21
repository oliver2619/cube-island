import {CollectibleType, CollectibleTypeFactory} from "./collectible";
import {Constants} from "./constants";

export class CollectibleResourcesStoreData {
    type: string;
    amount: number;
}

export class CollectibleResources {
    type: CollectibleType;
    amount: number;

    constructor(type?: CollectibleType, amount?: number) {
        if (type !== undefined)
            this.type = type;
        if (amount !== undefined)
            this.amount = amount;
        else
            this.amount = 0;
    }

    clone(): CollectibleResources {
        const ret = new CollectibleResources();
        ret.type = this.type;
        ret.amount = this.amount;
        return ret;
    }

    static load(input: CollectibleResourcesStoreData, factory: CollectibleTypeFactory): CollectibleResources {
        const ret = new CollectibleResources();
        ret.type = factory.create(input.type);
        ret.amount = input.amount;
        return ret;
    }

    save(): CollectibleResourcesStoreData {
        const ret = new CollectibleResourcesStoreData();
        ret.type = this.type.id;
        ret.amount = this.amount;
        return ret;
    }
}

export class ResourceSetStoreData {
    items: CollectibleResourcesStoreData[];
}

export class ResourceSet {

    public onChange: Array<(slot: number, type: CollectibleType, amount: number) => void> = [];

    private _resources: CollectibleResources[] = [];

    constructor(private _numberOfSlots: number) {
        for (let i = 0; i < _numberOfSlots; ++i)
            this._resources.push(new CollectibleResources());
    }

    add(type: CollectibleType, amount: number): number {
        let remaining = amount;
        let slot: number;
        while (remaining > 0) {
            slot = this._resources.findIndex((r) => r.type === type && r.amount > 0 && r.amount < Constants.maxCubesPerSlot);
            if (slot < 0)
                slot = this._resources.findIndex((r) => r.amount === 0);
            if (slot >= 0)
                remaining -= this.addToSlot(slot, type, remaining);
            else
                return amount - remaining;
        }
        return amount;
    }

    addToSlot(slot: number, type: CollectibleType, amount: number): number {
        const r = this._resources[slot];
        if (r.amount === 0 || r.type === type) {
            let a: number;
            if (r.amount + amount > Constants.maxCubesPerSlot)
                a = Constants.maxCubesPerSlot - r.amount;
            else
                a = amount;
            r.amount += a;
            r.type = type;
            this.onChange.forEach(cb => cb(slot, r.type, r.amount));
            return a;
        } else
            return 0;
    }

    canAdd(type: CollectibleType, amount: number): boolean {
        let remaining = amount;
        let s: CollectibleResources;
        for (let i = 0; i < this._numberOfSlots; ++i) {
            s = this._resources[i];
            if (s.amount === 0 || (s.type === type && s.amount < Constants.maxCubesPerSlot)) {
                remaining -= Constants.maxCubesPerSlot - s.amount;
                if (remaining <= 0)
                    return true;
            }
        }
        return false;
    }

    canAddToSlot(slot: number, type: CollectibleType, amount: number): boolean {
        const r = this._resources[slot];
        return r.type === type && r.amount + amount <= Constants.maxCubesPerSlot;
    }

    clone(): ResourceSet {
        const ret = new ResourceSet(this._numberOfSlots);
        for (let i = 0; i < this._resources.length; ++i)
            ret._resources[i] = this._resources[i].clone();
        return ret;
    }

    getAmount(slot: number): number {return this._resources[slot].amount;}

    getType(slot: number): CollectibleType {return this._resources[slot].type;}

    isEmpty(): boolean {return this._resources.find(r => r.amount > 0) === undefined;}

    load(input: ResourceSetStoreData, factory: CollectibleTypeFactory): void {
        input.items.forEach((d, i) => {
            const res = CollectibleResources.load(d, factory);
            this.addToSlot(i, res.type, res.amount);
        });
    }

    remove(type: CollectibleType, amount: number): number {
        let remaining = amount;
        let slot: number;
        while (remaining > 0) {
            slot = this._resources.findIndex((r) => r.type === type && r.amount > 0);
            if (slot >= 0)
                remaining -= this.removeFromSlot(slot, remaining);
            else
                return amount - remaining;
        }
        return amount;
    }

    removeFromSlot(slot: number, amount: number): number {
        const r = this._resources[slot];
        let a: number;
        if (r.amount >= amount)
            a = amount;
        else
            a = r.amount;
        r.amount -= a;
        this.onChange.forEach(cb => cb(slot, r.type, r.amount));
        return a;
    }

    save(): ResourceSetStoreData {
        const ret = new ResourceSetStoreData();
        ret.items = [];
        this._resources.forEach(r => {
            if (r.amount > 0) {
                ret.items.push(r.save());
            }
        });
        return ret;
    }
}