import PathFinder from "../AStar/PathFinder";
import MapMgr from "../Map/MapMgr";
import HeroNode from "../Map/MapNode/HeroNode";
import { ui } from "../ui/layaMaxUI";

export default class GameViewExt extends ui.GameViewUI {
    private hero: HeroNode = new HeroNode();
    constructor() {
        super();
        MapMgr.ins.addMap(`map/mainmap`);
        MapMgr.ins.addToMapList(this.hero);
    }

}