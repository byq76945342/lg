export default class Laser extends Laya.Image {
    private light: Laya.Sprite;

    constructor() {
        super();
        this.mouseEnabled = true;
        this.width = 50;
        this.pivotX = 25;
        this.height = 1000;
        this.pivotY = 1000;
        this.light = new Laya.Sprite();
        this.addChild(this.light);

        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.followMouse);


        this.formateLaser();

    }
    private formateLaser() {

        this.light.graphics && this.light.graphics.clear();

        this.light.graphics.drawRect(0, 0, 50, 1000, `#ffffff`);
    }
    private followMouse(e: Event) {
        this.x = Laya.stage.mouseX;
        this.y = Laya.stage.mouseY;
    }
    public destroy() {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.followMouse);
        super.destroy();
    }
}