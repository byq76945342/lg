import MapMgr from "../MapMgr";
import NodeUtil from "../NodeUtil";

export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    private m_movePath: Array<Laya.Point> = [];//路徑集合
    private m_destNodeIndex: number;//当前移动的序列号
    private m_speed: number = 30;
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
        startX = this.getTileX();
        startY = this.getTileY();



        if (this.m_destNodeIndex == null) {
            path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
            if (!path.length) return;
            this.m_movePath = path;
            this.m_destNodeIndex = 0;
        }
        else {
            startX = this.m_movePath[this.m_destNodeIndex].x;
            startY = this.m_movePath[this.m_destNodeIndex].y;
            path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
            if (!path.length) return;
            //停止老的移动
            this.StopCurMove();
            this.m_movePath = this.m_movePath.concat(path);

        }
    }
    private StopCurMove() {
        // this.m_approachActorInstanceID = 0;
        if (this.m_movePath.length <= 0) return;
        // if (!this.m_isActiveMoving) return;
        this.m_movePath.splice(this.m_destNodeIndex + 1);
        // this.m_isActiveMoving = false;
        //Log.Print(`主角停止移动，停止在Tile[${this.m_movePath[this.m_destNodeIndex].x}, ${this.m_movePath[this.m_destNodeIndex].y}].`);
        // 通知服务器停止移动
        // let point = new YQBCommon.CommonDefine.Point();
        // point.x = (this.m_movePath[this.m_destNodeIndex].x);
        // point.y = (this.m_movePath[this.m_destNodeIndex].y);
        // NetSender.SendCsHeroStopMoveSyn(point);
    }
    private selfFrame() {
        if (this.m_destNodeIndex == null) return;
        let m_destPixelPosX: number = NodeUtil.TilePixX(this.m_movePath[this.m_destNodeIndex].x);
        let m_destPixelPosY: number = NodeUtil.TilePixY(this.m_movePath[this.m_destNodeIndex].y);
        // 移动距离
        let moveLength: number = this.m_speed;
        // 移动方向
        let moveDir: Laya.Point = new Laya.Point(m_destPixelPosX - this.getPixX(), m_destPixelPosY - this.getPixY());
        // 当前到下一目的地的距离
        let destDistance: number = moveDir.distance(0, 0);
        // 本次移动会越过下一目的地
        while (moveLength >= destDistance) {
            this.setPixelPosition(m_destPixelPosX, m_destPixelPosY);
            this.m_destNodeIndex += 1;
            if (this.m_destNodeIndex >= this.m_movePath.length) {
                // 移动完毕
                this.Tilepos.setTo(this.m_movePath[this.m_movePath.length - 1].x, this.m_movePath[this.m_movePath.length - 1].y);
                this.m_destNodeIndex = null;
                return;
            }
            m_destPixelPosX = NodeUtil.TilePixX(this.m_movePath[this.m_destNodeIndex].x);
            m_destPixelPosY = NodeUtil.TilePixY(this.m_movePath[this.m_destNodeIndex].y);
            moveLength -= destDistance;
            moveDir.setTo(m_destPixelPosX - this.getPixX(), m_destPixelPosY - this.getPixY());
            destDistance = moveDir.distance(0, 0);
        }
        // 处理不会越过下一目的地时的移动
        moveDir.normalize();
        let cosAngle: number = moveDir.x;
        let sinAngle: number = moveDir.y;
        moveDir.x = moveLength * cosAngle;
        moveDir.y = moveLength * sinAngle;
        let pixelPosX: number = (this.getPixX() + moveDir.x);
        let pixelPosY: number = (this.getPixY() + moveDir.y);
        this.setPixelPosition(pixelPosX, pixelPosY);
    }
    private setPixelPosition(x: number, y: number) {
        this.relativeX = x | 0;
        this.relativeY = y | 0;
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
        this.moveMapViewPort(cx, cy);//改变地图视口
        this.updatePos();
    }
    protected moveMapViewPort(x: number, y: number) {
        MapMgr.ins.updateViewPort(x, y);
    }
    public updatePos() {
        super.updatePos();
    }
    private getPixX(): number {
        return (this.relativeX | 0);
    }
    private getPixY(): number {
        return (this.relativeY | 0);
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