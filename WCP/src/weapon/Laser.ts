export default class Laser extends Laya.Image implements WeaponImp {
    private light: Laya.Sprite;
    private weaponPoint: Laya.Point = new Laya.Point();
    private selfMask = new Laya.Sprite();

    constructor() {
        super();
        this.mouseEnabled = true;
        this.width = 50;
        this.height = 1000;
        this.light = new Laya.Sprite();
        this.addChild(this.light);
        this.light.width = 50;
        this.light.height = 1000;
        this.centerX = 0;

        this.formateLaser();
    }
    private formateLaser() {
        this.light.graphics.drawRect(0, 0, 50, 1000, "#ff0ef0");
    }

    public destroy() {
        super.destroy();
    }
    public getWeaponPoint() {
        this.weaponPoint.setTo(this.x, this.y);
        this.localToGlobal(this.weaponPoint);
        return this.weaponPoint;
    }

    public renderTary(y: number = 0) {

        let maskX: number = 0;


        let stageY: number = this.y;
        let maskY: number = (y - stageY);
        let maskH: number = this.height - y + stageY;
        this.selfMask.graphics.clear();
        this.selfMask.graphics.drawRect(maskX, maskY, 50, maskH, `#ff0000`);
        this.light.mask = this.selfMask;
    }
}