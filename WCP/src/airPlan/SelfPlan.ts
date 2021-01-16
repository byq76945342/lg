import Laser from "../weapon/Laser";
import WeaponUtil from "../weapon/WeaponUtil";
import PlanUtil from "./PlanUtil";

export default class SelfPlan extends Laya.Image implements PlanImp {
    private planUrl: string;
    private weapon: Laser;
    private plan: Laya.Image;
    constructor() {
        super();
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.followMouse);
    }
    createplan(pName: string) {
        this.planUrl = PlanUtil.getPlanUrl(pName);
        this.plan || (this.plan = new Laya.Image());
        Laya.loader.load(this.planUrl, new Laya.Handler(this, this.setTexture));
        this.addChild(this.plan);
    }
    createWeapon(wName: string) {
        let wCls = WeaponUtil.getWeaponCls("Wlaser");
        this.weapon = new wCls();
        this.addChild(this.weapon);

    }
    private setTexture(texture: Laya.Texture) {
        this.plan.graphics.drawTexture(texture);
        this.width = texture.width;
        this.height = texture.height;
        this.weapon.y = -this.weapon.height;
    }
    private followMouse(e: Event) {
        this.x = Laya.stage.mouseX - (this.width >> 1);
        this.y = Laya.stage.mouseY - (this.height >> 1);
    }
    renderTary(y: number) {
        let toChild: number = y - this.y;
        this.weapon.renderTary(toChild);
    }
    public weaponY() {
        return this.y + this.weapon.y;
    }
    public weaponX() {
        return this.x + this.weapon.x;
    }
    public weaponH() {
        return this.weapon.height;
    }
    public weaponW() {
        return this.weapon.width;
    }
}