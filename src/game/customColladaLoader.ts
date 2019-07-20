import {Object3D, Mesh, BufferGeometry, Geometry, MeshLambertMaterial, MeshPhongMaterial, Texture, Material} from "three";

export class CustomColladaLoader {
    private _scale = 1;
    private _materialMapper: (material: Material) => Material;
    private _textureMapper: (materialName: string, texture: Texture) => Texture;
    private _meshVisitor: (mesh: Mesh) => void;
    private _shadow = true;

    set materialMapper(mapper: (materialName: Material) => Material) {this._materialMapper = mapper;}

    set meshVisitor(visitor: (mesh: Mesh) => void) {this._meshVisitor = visitor;}

    set textureMapper(mapper: (materialName: string, texture: Texture) => Texture) {this._textureMapper = mapper;}

    set scale(scale: number) {this._scale = scale;}

    set shadow(shadow: boolean) {this._shadow = shadow;}

    load(url: string, onLoad: (result: Object3D) => void): void {
        const loader: {} = new (<any> window)['THREE']['ColladaLoader']();
        loader['load'](url, (model) => {
            const obj = this.fromModel(model);
            onLoad(obj);
        });
    }

    private copy(src: Object3D): Object3D {
        switch (src.type) {
            case 'Mesh':
                return this.copyMesh(<Mesh> src);
            case 'Group':
            case 'Object3D':
                return this.copyObject(src);
            default:
                throw 'Unable to process object type ' + src.type;
        }
    }

    private copyMesh(src: Mesh): Mesh {
        const ret = new Mesh(this.copyGeometry(src.geometry), this.copyMaterial(src.material));
        ret.copy(src, false);
        this.modifyMesh(ret);
        this.copyChildren(src, ret);
        ret.receiveShadow = true;
        ret.castShadow = this._shadow;
        if(this._meshVisitor !== undefined){
            this._meshVisitor(ret);
        }
        return ret;
    }

    private copyGeometry(src: Geometry | BufferGeometry): Geometry | BufferGeometry {
        switch (src.type) {
            case 'BufferGeometry':
                const bufGeo = new BufferGeometry();
                bufGeo.copy(<BufferGeometry> src);
                return bufGeo;
            case 'Geometry':
                const geo = new Geometry();
                geo.copy(<Geometry> src);
                return bufGeo;
            default:
                throw 'Unable to process geometry type ' + src.type;
        }
    }

    private copyMaterial(src: Material | Material[]): Material | Material[] {
        if (src instanceof Array) {
            const ret: Material[] = [];
            src.forEach((m) => {
                ret.push(<Material> this.copyMaterial(m));
            });
            return ret;
        } else {
            if (this._materialMapper !== undefined) {
                const ret = this._materialMapper(src);
                if (ret !== src && ret !== undefined && ret !== null) {
                    return ret;
                }
            }
            switch (src.type) {
                case 'MeshLambertMaterial':
                    const mlm = new MeshLambertMaterial();
                    mlm.copy(<MeshLambertMaterial> src);
                    if (mlm.map !== null && this._textureMapper !== undefined)
                        mlm.map = this._textureMapper(mlm.name, mlm.map);
                    return mlm;
                case 'MeshPhongMaterial':
                    const mpm = new MeshPhongMaterial();
                    mpm.copy(<MeshPhongMaterial> src);
                    if (mpm.map !== null && this._textureMapper !== undefined)
                        mpm.map = this._textureMapper(mpm.name, mpm.map);
                    return mpm;
                default:
                    throw 'Unable to process material type ' + src.type;
            }
        }
    }

    private copyObject(src: Object3D): Object3D {
        const ret = new Object3D();
        ret.copy(src, false);
        this.modifyObject(ret);
        this.copyChildren(src, ret);
        return ret;
    }

    private copyChildren(src: Object3D, dst: Object3D): void {
        src.children.forEach((c) => {
            dst.add(this.copy(c));
        });
    }

    private fromModel(model: {}): Object3D {
        const found = model['scene']['children']['find']((o) => {
            return o['type'] === 'Group' || o['type'] === 'Mesh';
        });
        if (found === null)
            throw 'No object found';
        return this.copy(found);
    }


    private modifyMesh(mesh: Mesh): void {
        mesh.geometry.scale(this._scale, this._scale, this._scale);
        mesh.position.multiplyScalar(this._scale);
    }

    private modifyObject(obj: Object3D): void {
        obj.position.multiplyScalar(this._scale);
    }
}