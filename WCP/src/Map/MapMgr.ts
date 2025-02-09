import TMap from "./mapFile/TMap";
import HeroNode from "./MapNode/HeroNode";

export default class MapMgr {
    private static _ins: MapMgr;
    private nodeList: HeroNode[] = [];
    public static get ins(): MapMgr {
        this._ins || (this._ins = new MapMgr());
        return this._ins;
    }
    private m_Map: TMap;
    /**
     * 新建一个地图
     * @param mName 
     */
    public addMap(mName: string) {
        this.m_Map = new TMap();
        this.m_Map.createMapByName(mName);
    }
    /**
     * 删除一个地图
     */
    public delMap() {
        for (let i of this.nodeList) {
            i.destroy();
            i = null;
        }
        this.nodeList = [];
        this.m_Map.destroyMap();
        this.m_Map = null;
    }
    /**
     * 添加对象到数据列表
     * @param node 
     */
    public addToMapList(node: HeroNode) {
        this.nodeList.push(node);
    }
    /**
     * 添加对象到地图显示层
     */
    public addToMap() {
        for (let i of this.nodeList) {
            this.m_Map.addChild(i);
            i.updatePos();
        }
    }
    /**
     * 更新地图视口
     *  */
    public updateViewPort(pixX: number, pixY: number) {
        this.m_Map.moveViewPort(pixX, pixY);
    }
    public get pathFinder() {
        return this.m_Map.pathFinder;
    }
    public get map() {
        return this.m_Map;
    }
}