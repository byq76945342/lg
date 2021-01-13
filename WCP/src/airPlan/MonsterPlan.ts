export default class MonsterPlan extends Laya.Image {
    constructor() {
        super();
        this.pos(Math.random() * Laya.stage.width, -100);
        this.graphics.drawRect(0, 0, 100, 100, `#000fff`);
    }

    public get onView(): boolean {
        return this.parent != null;
    }
    public checkPosOutView() {
        return this.y > Laya.stage.height;
    }
    public addTo() {
        Laya.stage.addChild(this);
        this.y=-100;
    }

}