import Laser from "./Laser";

export default class WeaponUtil {
    private static Dic: any;
    static regWeapon() {
        this.Dic || (this.Dic = new Object());
        this.Dic["Wlaser"] = Laser;
    }
    static getWeaponCls(wName: string) {
        return this.Dic[wName];
    }
}