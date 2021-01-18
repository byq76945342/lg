import GameViewExt from "../../uiExt/GameViewExt";
import TMap from "../mapFile/TMap";
import MapMgr from "../MapMgr";

export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    private m_movePath: Array<Laya.Point> = [];//路徑集合
    private m_destNodeIndex: number;//当前移动的序列号
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
            startX = this.getPixX() / 125;
            startY = this.getPixY() / 125;
            startX = startX | 0;
            startY = startY | 0;
            path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
            this.m_movePath = path;
            this.m_destNodeIndex = 0;
        }
    }
    private selfFrame() {
        if (this.m_destNodeIndex != null) {
            if (this.m_movePath[this.m_destNodeIndex]) {
                this.setPixelPosition(this.m_movePath[this.m_destNodeIndex].x * 125, this.m_movePath[this.m_destNodeIndex].y * 125);
                this.m_destNodeIndex += 1;
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

        let cx: number = x - (map.viewPortWidth >> 1);
        let cy: number = y - (map.viewPortHeight >> 1);

        cx < 0 && (cx = 0);
        let maxX: number = map.width - map.viewPortWidth
        cx > maxX && (cx = maxX);

        cy < 0 && (cy = 0);
        let maxY: number = map.height - map.viewPortHeight;
        cy > maxY && (cy = maxY);
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
    public destroy() {
        this.heroNode.removeSelf();
        this.heroNode.destroy();
        this.heroNode = null;
        this.removeSelf();
        super.destroy();
    }


}