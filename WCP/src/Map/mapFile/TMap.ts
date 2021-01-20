import PathFinder from "../../AStar/PathFinder";
import MapMgr from "../MapMgr";
import HeroNode from "../MapNode/HeroNode";
import NodeUtil from "../NodeUtil";

export default class TMap extends Laya.TiledMap implements MapImp {
    protected mapName: string = ""
    protected _pathFinder: PathFinder;
    private touchLayer: Laya.MapLayer;
    private touchPoint: Laya.Point = new Laya.Point;
    private regNodeView: HeroNode;
    constructor() {
        super();
    }
    createMapByName(mName: string) {
        this.mapName = mName;
        let regW: number = Laya.stage.width;
        let regH: number = Laya.stage.height;
        //需要根据实际的屏幕大小计算缩放比例
        let viewReg: Laya.Rectangle = new Laya.Rectangle(0, 0, regW, regH);
        this.createMap(`${mName}.json`, viewReg, new Laya.Handler(this, this.onCreated));
    }
    protected onCreated() {

        this.touchLayer = this.getLayerByName("build");
        this.setViewPortPivotByScale(0, 0);

        this.initFinder();

        Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);
        Laya.stage.on(Laya.Event.RESIZE, this, this.resetViewReg);
        this.resetViewReg();
        this.moveViewPort(0, 0);
        MapMgr.ins.addToMap();
    }
    private resetViewReg() {
        this.numColumnsTile * NodeUtil.GRIDSIZE
        this.scale = Laya.stage.width / ( this.numColumnsTile * NodeUtil.GRIDSIZE);
        this.changeViewPortBySize(Laya.stage.width, Laya.stage.height);
    }
    private initFinder() {
        let mapGridW: number = this.numColumnsTile;
        let mapGridH: number = this.numRowsTile;
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
        super.moveViewPort(cx, cy);
    }
    addChild(node: HeroNode) {
        if (!this.regNodeView) {
            this.regNodeView = node;
        }
        this.getLayerByName("obj").addChild(node);
        node.initData(this);
        node.updatePos();
    }
    getLayerByName(lName: string): Laya.MapLayer {
        return super.getLayerByName(lName);
    }
    destroyMap() {
        this.touchLayer = null;
        this.mapName = "";
        this.scale = 1;
        this._pathFinder.destroy();
        super.destroy();
    }
    public get pathFinder() {
        return this._pathFinder;
    }




}