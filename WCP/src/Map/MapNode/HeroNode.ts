import GameViewExt from "../../uiExt/GameViewExt";
import TMap from "../mapFile/TMap";
import MapMgr from "../MapMgr";
import NodeUtil from "../NodeUtil";

export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    private m_movePath: Array<Laya.Point> = [];//路徑集合
    private m_destNodeIndex: number;//当前移动的序列号
    private m_speed: number = 5;
    private Tilepos: Laya.Point = new Laya.Point();

    constructor() {
        super();
        this.heroNode.graphics.drawRect(0, 0, 125, 125, `#ff9999`);
        this.addChild(this.heroNode);
        Laya.timer.frameLoop(1, this, this.selfFrame);
    }
    initData(map: Laya.TiledMap) {
        super.initData(map);
    }
    StartActiveMove(x: number, y: number) {
        //嘗試讓主角尋路
        let startX: number = 0;
        let startY: number = 0;
        let path: Array<Laya.Point>;
        this.m_movePath = [];
        if (!this.m_movePath.length) {
            startX = this.getTileX();
            startY = this.getTileY();
            path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
            this.m_movePath = path;
            // this.m_movePath.shift();
            this.m_destNodeIndex = 0;
        }
    }
    private selfFrame() {
        if (this.m_destNodeIndex != null) {
            let pathHead: Laya.Point = this.m_movePath[this.m_destNodeIndex];
            if (pathHead) {
                let dirTx: number = pathHead.x;
                let dirTy: number = pathHead.y;
                let curTx: number = this.getTileX();
                let curTy: number = this.getTileY();
                let TileDir: Laya.Point = new Laya.Point(dirTx - curTx, dirTy - curTy);//移动方向
                let endx: number = this.getPixX() + this.m_speed * (TileDir.x);
                let endy: number = this.getPixY() + this.m_speed * (TileDir.y);
                let pixDir: Laya.Point = new Laya.Point(dirTx * NodeUtil.GRIDSIZE - endx, dirTy * NodeUtil.GRIDSIZE - endy);
                TileDir.normalize();
                pixDir.normalize();
                TileDir.x *= 5;
                TileDir.y *= 5;
                pixDir.x *= 5;
                pixDir.y *= 5;
                if (TileDir.x + pixDir.x == 0 && TileDir.y + pixDir.y == 0) {
                    this.Tilepos.setTo(pathHead.x, pathHead.y);
                    this.setPixelPosition(dirTx * NodeUtil.GRIDSIZE, dirTy * NodeUtil.GRIDSIZE);
                    this.m_destNodeIndex += 1;
                }
                else {
                    this.setPixelPosition(endx, endy);
                }
            }
            else {
                this.m_destNodeIndex = null;
            }

        }
    }
    private setPixelPosition(x: number, y: number) {
        this.relativeX = x;
        this.relativeY = y;
        let map: Laya.TiledMap = MapMgr.ins.map;
        let offx: number = 0;
        let offy: number = 0;

        let cx: number = x + offx - (map.viewPortWidth >> 1);
        let cy: number = y + offy - (map.viewPortHeight >> 1);


        let maxX: number = map.width - map.viewPortWidth;
        cx > maxX && (cx = maxX);
        cx < 0 && (cx = 0);


        let maxY: number = map.height - map.viewPortHeight;
        cy > maxY && (cy = maxY);
        cy < 0 && (cy = 0);
        this.moveMapViewPort(cx, cy);
        this.updatePos();
    }
    protected moveMapViewPort(x: number, y: number) {
        MapMgr.ins.updateViewPort(x, y);
    }
    public updatePos() {
        super.updatePos();
    }
    private getPixX(): number {
        return this.relativeX;
    }
    private getPixY(): number {
        return this.relativeY;
    }
    private getTileX() {
        return this.Tilepos.x;
    }
    private getTileY() {
        return this.Tilepos.y;
    }
    public destroy() {
        this.heroNode.removeSelf();
        this.heroNode.destroy();
        this.heroNode = null;
        this.removeSelf();
        super.destroy();
    }


}