import PathFinder from "../AStar/PathFinder";
import HeroNode from "../Map/MapNode/HeroNode";
import { ui } from "../ui/layaMaxUI";

export default class GameViewExt extends ui.GameViewUI {
    private map: Laya.TiledMap;
    private touckPoint: Laya.Point = new Laya.Point();
    private touckLayer: Laya.MapLayer;
    private hero: HeroNode;
    public static m_pathFinder: PathFinder;
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
        this.initFinder();

    }

    private createHero() {
        this.touckLayer = this.map.getLayerByName("build");
        this.hero = new HeroNode();
        this.touckLayer.addChild(this.hero);
        Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);
    }
    private clickMap(e: Laya.Event) {
        this.touckLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touckPoint);
        let tileX: number = this.touckPoint.x|0;
        let tileY: number = this.touckPoint.y|0;
        //點擊到了可行走的地點
        let touckWalkable: boolean = GameViewExt.m_pathFinder.isWalkable(tileX, tileY);
        if (touckWalkable) {
            this.hero.StartActiveMove(tileX, tileY);
        }
    }
    private initFinder() {
        let mapGridW: number = this.map.numColumnsTile;
        let mapGridH: number = this.map.numRowsTile;

        GameViewExt.m_pathFinder = new PathFinder(mapGridW, mapGridH);//初始化尋路模塊
        GameViewExt.m_pathFinder.isIgnoreCorner = false;
        //設置靜態的阻擋
        let blockLayer: Laya.MapLayer = this.map.getLayerByName(`block`);
        for (let i: number = 0; i < mapGridW; ++i) {
            for (let j: number = 0; j < mapGridH; ++j) {
                GameViewExt.m_pathFinder.setStaticBlock(i, j, blockLayer.getTileData(i, j));
            }
        }
    }
}