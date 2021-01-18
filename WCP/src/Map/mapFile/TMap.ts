import PathFinder from "../../AStar/PathFinder";
import MapMgr from "../MapMgr";
import HeroNode from "../MapNode/HeroNode";

export default class TMap implements MapImp {
    protected mapName: string = ""
    protected _map: Laya.TiledMap;
    protected scale: number = 1;
    protected _pathFinder: PathFinder;
    private touchLayer: Laya.MapLayer;
    private touchPoint: Laya.Point = new Laya.Point;
    private regNodeView: HeroNode;
    constructor() {

    }
    createMapByName(mName: string) {
        this.mapName = mName;
        this._map = new Laya.TiledMap();
        let regW: number = Laya.stage.width;
        let regH: number = Laya.stage.height;
        //需要根据实际的屏幕大小计算缩放比例
        let viewReg: Laya.Rectangle = new Laya.Rectangle(0, 0, regW, regH);
        this._map.createMap(`${mName}.json`, viewReg, new Laya.Handler(this, this.onCreated));
    }
    protected onCreated() {
        this.touchLayer = this.getLayerByName("build");
        this._map.setViewPortPivotByScale(0, 0);
        this._map.scale = this.scale;
        this.initFinder();
        MapMgr.ins.addToMap();
        Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);

    }
    private initFinder() {
        let mapGridW: number = this._map.numColumnsTile;
        let mapGridH: number = this._map.numRowsTile;
        this._pathFinder = new PathFinder(mapGridW, mapGridH);
        /**设置静态阻挡 */
        let blockLayer: Laya.MapLayer = this.getLayerByName("block");
        for (let x: number = 0; x < mapGridW; ++x) {
            for (let y: number = 0; y < mapGridH; ++y) {
                this._pathFinder.setStaticBlock(x, y, blockLayer.getTileData(x, y));
            }
        }
    }
    private clickMap(e: Laya.Event) {
        this.touchLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touchPoint);
        let tileX: number = this.touchPoint.x | 0;
        let tileY: number = this.touchPoint.y | 0;
        if (this._pathFinder.isWalkable(tileX, tileY)) {
            this.regNodeView.StartActiveMove(tileX, tileY);
        }

    }
    moveViewPort(pixX: number, pixY: number) {
        let cx: number = pixX;
        let cy: number = pixY;
        this._map.moveViewPort(cx, cy);
    }
    addChild(node: HeroNode) {
        if (!this.regNodeView) {
            this.regNodeView = node;
        }
        this.getLayerByName("obj").addChild(node);
        node.initData(this._map);
        node.updatePos();
    }
    getLayerByName(lName: string): Laya.MapLayer {
        return this._map.getLayerByName(lName);
    }
    destroyMap() {
        this.touchLayer = null;
        this.mapName = "";
        this._map.destroy();
        this.scale = 1;
        this._pathFinder.destroy();
    }
    public get pathFinder() {
        return this._pathFinder;
    }
    public get map() {
        return this._map;
    }



}