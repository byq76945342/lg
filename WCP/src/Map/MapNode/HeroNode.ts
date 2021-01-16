import GameViewExt from "../../uiExt/GameViewExt";

export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    private m_movePath: Array<Laya.Point> = [];//路徑集合
    private m_tilePos: Laya.Point = new Laya.Point();
    private m_destNodeIndex: number;//当前移动的序列号
    private m_destPixelPosX: number = 0;//当前前往的像素坐标
    private m_destPixelPosY: number = 0;//
    constructor() {
        super();
        this.heroNode.graphics.drawRect(0, 0, 50, 50, `#ff9999`);
        this.addChild(this.heroNode);
        Laya.timer.frameLoop(100, this, this.selfFrame);
    }
    StartActiveMove(x: number, y: number) {
        //嘗試讓主角尋路
        let startX: number = 0;
        let startY: number = 0;
        let path: Array<Laya.Point>;
        this.m_movePath = [];
        if (!this.m_movePath.length) {
            startX = this.m_tilePos.x;
            startY = this.m_tilePos.y;
            path = GameViewExt.m_pathFinder.findPath(startX, startY, x, y);
            if (!path || !path.length) return;
            this.m_movePath = path;
        }
    }
    private selfFrame() {
        let detalTime: number = Laya.timer.delta;
        if (!this.m_movePath.length) return;
        if (this.m_destNodeIndex == null) {
            this.m_destNodeIndex = 0;
            this.m_destPixelPosX = this.m_movePath[this.m_destNodeIndex].x * 125 ;
            this.m_destPixelPosY = this.m_movePath[this.m_destNodeIndex].y * 125 ;
            //移动距离
            let moveLength: number = 20 * detalTime * 125;
            //移动方向
            let moveDir: Laya.Point = new Laya.Point(this.m_destPixelPosX - this.x, this.m_destPixelPosY - this.y);
            let destDistance: number = moveDir.distance(0, 0);
            while (moveLength >= destDistance) {
                this.setPixelPosition(this.m_destPixelPosX, this.m_destPixelPosY);
                this.m_destNodeIndex += 1;
                if (this.m_destNodeIndex >= this.m_movePath.length) {
                    this.m_destNodeIndex = null;
                    return;
                }
                this.m_destPixelPosX = this.m_movePath[this.m_destNodeIndex].x * 125 ;
                this.m_destPixelPosY = this.m_movePath[this.m_destNodeIndex].y * 125 ;
                moveLength -= destDistance;
                destDistance = moveDir.distance(0, 0);
            }
            moveDir.normalize();
            let cosAngle: number = moveDir.x;
            let sinAngle: number = moveDir.y;
            moveDir.x = moveLength * cosAngle;
            moveDir.y = moveLength * sinAngle;
            let px: number = this.x + moveDir.x;
            let py: number = this.y + moveDir.y;
            this.setPixelPosition(px, py);

        }
    }
    private setPixelPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.updatePos();
    }


}