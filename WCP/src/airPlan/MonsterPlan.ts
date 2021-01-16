export default class MonsterPlan extends Laya.Image {
    private thisW: number = 100;
    private thisH: number = 100;
    private range: number = Laya.stage.width - this.thisW;
    constructor() {
        super();
        this.pos(Math.random() * (this.range), -this.thisH);
        this.graphics.drawRect(0, 0, this.thisW, this.thisH, `#000fff`);
        this.height = this.thisH;
        this.width = this.thisW;
    }

    public get onView(): boolean {
        return this.parent != null;
    }
    public checkPosOutView() {
        return this.y > Laya.stage.height;
    }
    public addTo() {
        Laya.stage.addChild(this);
        this.y = -this.thisH;
    }

}