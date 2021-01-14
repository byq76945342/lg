import Laser from "../weapon/Laser";
import MonsterPlan from "../airPlan/Monsterplan";
import SelfPlan from "../airPlan/SelfPlan";
import PlanUtil from "../airPlan/PlanUtil";
import WeaponUtil from "../weapon/WeaponUtil";

export default class GameMgr {
    private constructor() {
        PlanUtil.regPlanUrl();
        WeaponUtil.regWeapon();
    }
    private static _ins: GameMgr;

    private self: SelfPlan;
    private runingMonster: MonsterPlan[] = [];
    private standbyMonster: MonsterPlan[] = [];
    private readonly createFrame: number = 500;
    private curFrame: number = 0;
    public static get ins(): GameMgr {
        this._ins || (this._ins = new GameMgr());
        return this._ins;
    }
    public gameStar() {
        this.createHero();
        this.starLoop();
    }
    private createHero() {
        this.self && (this.self.destroy(), this.self = null);
        this.self || (this.self = new SelfPlan());
        (this.self as SelfPlan).createplan("Plaser");
        (this.self as SelfPlan).createWeapon("Wlaser");
        Laya.stage.addChild(this.self);
    }
    private starLoop() {
        Laya.timer.frameLoop(1, this, this.loop);
        this.loop();
    }
    private loop() {

        this.createMonster();
        for (let i of this.runingMonster) {
            i.y += 10;
        }
        this.checkHit();
        for (let i of this.runingMonster) {
            let index: number = this.runingMonster.indexOf(i);
            i.checkPosOutView() && (this.standbyMonster.push(i), this.runingMonster.splice(index, 1));
        }

    }
    private createMonster() {
        let curTime: number = Laya.timer.delta;
        this.curFrame += curTime;
        if (this.curFrame > this.createFrame) {
            this.curFrame = 0;
            let newPlat: MonsterPlan = this.standbyMonster.pop();
            newPlat || (newPlat = new MonsterPlan());
            newPlat.addTo();
            this.runingMonster.push(newPlat);
        }
    }
    private checkHit() {
        let tarY: number = 0;
        let offH: number = 0;

        let wy: number = this.self.weaponX();
        let wx: number = this.self.weaponY();
        let ww: number = this.self.weaponW();
        let wh: number = this.self.weaponH();
        for (let m of this.runingMonster) {
            let mx: number = m.x;
            let my: number = m.y;
            let mw: number = m.width;
            let mh: number = m.height;
            if (tarY < my) {
                if (my + mh < wy || my > wy + wh) {
                    m.gray = false;
                    continue;
                }
                if (mx + mw < wx || mx > wx + ww) {//宽度检测
                    m.gray = false;
                    continue;
                }
                tarY = my;//碰到的y坐标
                offH = m.height;
                m.gray = true;
            } else {
                m.gray = false;
            }

        }
        console.log(tarY);
        (<SelfPlan>this.self).renderTary(tarY + offH);
    }
}