import HeroNode from "../Map/MapNode/HeroNode";
import { ui } from "../ui/layaMaxUI";

export default class GameViewExt extends ui.GameViewUI {
    private map: Laya.TiledMap;
    private touckPoint: Laya.Point = new Laya.Point();
    private touckLayer: Laya.MapLayer;
    private hero: HeroNode;
    constructor() {
        super();
        this.createTileMap();
    }
    private createTileMap() {
        this.map = new Laya.TiledMap();
        let viewReg: Laya.Rectangle = new Laya.Rectangle(0, 0, this.width, this.height);

        this.map.createMap("map/mainmap.json", viewReg, new Laya.Handler(this, this.onCreateComplete));
    }
    private onCreateComplete() {

        this.createHero();

    }
    private movePort() {
        this.map.moveViewPort(100, 100);
    }
    private createHero() {
        this.touckLayer = this.map.getLayerByName("build");
        this.hero = new HeroNode();
        this.touckLayer.addChild(this.hero);
        Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);
    }
    private clickMap(e: Laya.Event) {
        Laya.Tween.clearAll(this.hero);
        this.touckLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touckPoint);
        Laya.Tween.to(this.hero, { x: this.touckPoint.x*125, y: this.touckPoint.y*125 }, 2000);

    }
}