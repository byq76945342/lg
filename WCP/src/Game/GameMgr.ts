import Laser from "../airPlan/Laser";
import MonsterPlan from "../airPlan/Monsterplan";

export default class GameMgr {
    private constructor() { }
    private static _ins: GameMgr;

    private self: Laya.Image;
    private runingMonster: MonsterPlan[] = [];
    private standbyMonster: MonsterPlan[] = [];
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
        this.self || (this.self = new Laser());
        Laya.stage.addChild(this.self);
    }
    private starLoop() {
        Laya.timer.loop(1, this, this.loop);
        this.loop();
    }
    private loop() {
        let newPlat: MonsterPlan = this.standbyMonster.pop();
        newPlat || (newPlat = new MonsterPlan());
        newPlat.addTo();
        this.runingMonster.push(newPlat);
        for (let i of this.runingMonster) {
            i.y += 10;
        }


        for (let i of this.runingMonster) {
            let index: number = this.runingMonster.indexOf(i);
            i.checkPosOutView() && (this.standbyMonster.push(i), this.runingMonster.splice(index, 1));
        }

    }
}