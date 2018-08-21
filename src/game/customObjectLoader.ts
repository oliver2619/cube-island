import {Texture, Object3D, Material, Matrix4, FileLoader, BufferGeometryLoader, MaterialLoader, BufferGeometry, Group, Mesh} from "three";

export class CustomObjectLoader {

    private fileLoader: FileLoader = new FileLoader();
    private bufferGeometryLoader: BufferGeometryLoader = new BufferGeometryLoader();
    private materialLoader: MaterialLoader = new MaterialLoader();
    private _texturesById: {[key: string]: Texture} = {};
    private _scale: number = 1;

    constructor() {}

    get textures(): {[key: string]: Texture} {return this._texturesById;}

    set textures(textures: {[key: string]: Texture}) {this._texturesById = textures;}

    set scale(scale: number) {this._scale = scale;}

    load(url: string, onLoad: (result: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void {
        this.fileLoader.load(url, (result: string) => {
            onLoad(this.parse(JSON.parse(result)));
        }, onProgress, onError);
    }

    private parse(inp: any): Object3D {
        const geometriesIn: Array<any> = inp['geometries'];
        const texturesIn: Array<any> = inp['textures'];
        const materialsIn: Array<any> = inp['materials'];
        const objectIn = inp['object'];

        const texturesOut: {[key: string]: Texture} = {};
        texturesIn.forEach(t => {
            const textureObj = this._texturesById[t['name']];
            if (textureObj !== undefined) {
                texturesOut[t['uuid']] = textureObj;
            } else {
                console.error('Texture ' + t['name'] + ' not found');
            }
        });

        this.materialLoader.setTextures(texturesOut);

        const materialsOut: {[key: string]: Material} = {};
        materialsIn.forEach(m => {
            materialsOut[m['uuid']] = this.materialLoader.parse(m);
        });
        const geometriesOut: {[key: string]: BufferGeometry} = {};
        geometriesIn.forEach(g => {
            const bufferGeometry = this.bufferGeometryLoader.parse(g);
            this.processGeometry(bufferGeometry);
            geometriesOut[g['uuid']] = bufferGeometry;
        });
        const ret = this.parseGroup(objectIn['children'], materialsOut, geometriesOut);
        ret.rotation.set(0, 0, 0);
        ret.matrixAutoUpdate = true;
        return ret;
    }

    private processGeometry(geometry: BufferGeometry): void {
        geometry.scale(this._scale, this._scale, this._scale);
    }

    private parseObjectBase(inp: any, obj: Object3D): void {
        obj.name = inp['name'];
        obj.visible = inp['visible'];
        obj.matrix.fromArray(inp['matrix']);
        obj.matrixAutoUpdate = false;
        obj.matrixWorldNeedsUpdate = true;
        obj.matrix.elements[12] *= this._scale;
        obj.matrix.elements[13] *= this._scale;
        obj.matrix.elements[14] *= this._scale;
    }

    private parseObject(inp: any, materials: {[key: string]: Material}, geometries: {[key: string]: BufferGeometry}): Group {
        const ret = this.parseGroup(inp['children'], materials, geometries);
        this.parseObjectBase(inp, ret);
        return ret;
    }

    private parseMesh(inp: any, materials: {[key: string]: Material}, geometries: {[key: string]: BufferGeometry}): Mesh {
        const geometry = geometries[inp['geometry']];
        const meshMat = inp['material'];
        let ret: Mesh;
        if (meshMat instanceof Array) {
            ret = new Mesh(geometry, (<Array<any>> meshMat).map(m => materials[m]));
        } else {
            ret = new Mesh(geometry, materials[meshMat]);
        }
        this.parseObjectBase(inp, ret);
        const invMat = new Matrix4();
        invMat.getInverse(ret.matrix);
        geometry.applyMatrix(invMat);
        geometry.applyMatrix(invMat);
        ret.castShadow = inp['castShadow'];
        ret.receiveShadow = inp['receiveShadow'];
        return ret;
    }

    private parseGroup(inp: Array<any>, materials: {[key: string]: Material}, geometries: {[key: string]: BufferGeometry}): Group {
        const ret: Group = new Group();
        inp.forEach(o => {
            switch (o['type']) {
                case 'Object':
                    ret.add(this.parseObject(o, materials, geometries));
                    break;
                case 'Mesh':
                    ret.add(this.parseMesh(o, materials, geometries));
                    break;
                default:
                    console.warn('Object type ' + o['type'] + ' is ignored');
            }
        });
        return ret;
    }
}
