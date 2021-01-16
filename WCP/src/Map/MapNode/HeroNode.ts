import GameViewExt from "../../uiExt/GameViewExt";

export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    private m_movePath: Array<Laya.Point> = [];//路徑集合
    private m_destNodeIndex: number;//当前移动的序列号
    constructor() {
        super();
        this.heroNode.graphics.drawRect(0, 0, 50, 50, `#ff9999`);
        this.addChild(this.heroNode);
        Laya.timer.frameLoop(1, this, this.selfFrame);
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
            path = GameViewExt.m_pathFinder.findPath(startX, startY, x, y);
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
        this.x = x;
        this.y = y;
        this.updatePos();
        // GameViewExt.map.moveViewPort(x, y);
    }
    private getPixX(): number {
        return this.x;
    }
    private getPixY(): number {
        return this.y;
    }


}