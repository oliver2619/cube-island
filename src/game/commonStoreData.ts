import {Vector3} from "three";

export class Vector3StoreData {
    x: number;
    y: number;
    z: number;

    static load(input: Vector3StoreData, output?: Vector3): Vector3 {
        if (output !== undefined) {
            output.x = input.x;
            output.y = input.y;
            output.z = input.z;
            return output;
        } else
            return new Vector3(input.x, input.y, input.z);
    }

    static save(input: Vector3): Vector3StoreData {
        const ret = new Vector3StoreData();
        ret.x = input.x;
        ret.y = input.y;
        ret.z = input.z;
        return ret;
    }
}

export class IDStoreDataMapper {
    private _ids: string[] = [];
    private _indexById: {[key: string]: number} = {};
    
    getId(index: number): string {
        return index > 0 ? this._ids[index - 1] : null;
    }

    getIndex(id: string): number {
        if(id === null)
            return 0;
        let ret: number = this._indexById[id];
        if (ret === undefined) {
            ret = this._ids.length + 1;
            this._ids.push(id);
            this._indexById[id] = ret;
        }
        return ret;
    }

    getIndexAsHexString(id: string): string {
        const num = this.getIndex(id);
        let ret = num.toString(16);
        return ret.padStart(2, '0');
    }

    load(input: string[]): void {
        this._ids = input;
    }

    save(): string[] {
        return this._ids;
    }
}
