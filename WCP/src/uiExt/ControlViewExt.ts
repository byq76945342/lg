import { ui } from "../ui/layaMaxUI";

export default class ControlViewExt extends ui.ControlViewUI {
    private isTouch: boolean = false;
    private touchDir: Laya.Point = new Laya.Point();
    constructor() {

        super();
        this.zOrder = 100;
        let stage =
            this.imgTar.on(Laya.Event.MOUSE_DOWN, this, this.touckStr);



    }
    private dragImage(e: Laya.Event) {
        let x: number;
        let y: number;
        if (!this.isTouch) {
            this.imgTar.x = (this.imgCont.width - this.imgTar.width) >> 1;
            this.imgTar.y = (this.imgCont.height - this.imgTar.height) >> 1;
            return;
        }
        else {
            x = e.stageX;
            y = e.stageY;
        }

        let centerx: number = this.imgCont.x + (this.imgCont.width >> 1);
        let centery: number = this.imgCont.y + (this.imgCont.height >> 1);
        let dirx: number = x - centerx;
        let diry: number = y - centery;
        this.touchDir.setTo(dirx, diry);
        this.touchDir.normalize();
        this.imgTar.x = this.touchDir.x * 50 + (this.imgTar.width >> 1);
        this.imgTar.y = this.touchDir.y * 50 + (this.imgTar.height >> 1);

    }
    private touckStr() {
        this.isTouch = true;
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.dragImage);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.touckEnd);

    }
    private touckEnd() {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.dragImage);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.touckEnd);
        this.isTouch = false;
        this.dragImage(null);
    }
    onAwake() {
        console.log("secen call func onAwake");
    }
}