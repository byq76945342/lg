import PathNode, { EnumDir } from "./PathNode";

export default class PathFinder {

    /**核心數據 */
    private m_width: number = 0;
    private m_height: number = 0;
    private m_kCost1: number = 10;//直一格
    private m_kCost2: number = 14;//斜一格
    private m_nodeArray: Array<Array<PathNode>> = null;
    private m_staticBlocks: Array<Array<number>> = null;//静态阻挡
    private m_dymanicBlocks: Array<Array<number>> = null;//動態阻擋

    private m_openList: Array<PathNode> = [];
    private m_closeList: Array<PathNode> = [];
    /**額外的參數 */
    private m_isIgnoreCorner: boolean = false;//是否走斜綫


    constructor(width: number, height: number) {
        this.m_height = height;
        this.m_width = width;
        this.m_nodeArray = new Array<Array<PathNode>>(width);
        this.m_staticBlocks = new Array<Array<number>>(width);
        this.m_dymanicBlocks = new Array<Array<number>>(width);
        for (let indexW: number = 0; indexW < width; ++indexW) {
            this.m_nodeArray[indexW] = new Array<PathNode>(height);
            this.m_staticBlocks[indexW] = new Array<number>(height);
            this.m_dymanicBlocks[indexW] = new Array<number>(height);
            for (let indexH: number = 0; indexH < height; ++indexH) {
                this.m_nodeArray[indexW][indexH] = new PathNode();
                (<PathNode>this.m_nodeArray[indexW][indexH]).x = indexW;
                (<PathNode>this.m_nodeArray[indexW][indexH]).y = indexH;
                this.m_dymanicBlocks[indexW][indexH] = 0;
                this.m_staticBlocks[indexW][indexH] = 0;
            }
        }
    }
    public set isIgnoreCorner(value: boolean) {
        this.m_isIgnoreCorner = value;
    }
    public setStaticBlock(x: number, y: number, data: number) {
        this.m_staticBlocks[x][y] = data;
    }
    public isWalkable(x: number, y: number): boolean {
        if (this.m_staticBlocks[x][y] == 0) {
            return true;
        }
        return false;
    }
    public findPath(startX: number, startY: number, endX: number, endY: number): Laya.Point[] {

        let path: Laya.Point[] = [];
        let resultNode: PathNode = this.SearchPath(startX, startY, endX, endY);
        while (resultNode) {
            let point: Laya.Point = new Laya.Point();
            point.x = resultNode.x;
            point.y = resultNode.y;
            path.push(point);
            resultNode = resultNode.parent;
        }
        path.reverse();
        return path;
    }
    private SearchPath(startX: number, startY: number, endX: number, endY: number): PathNode {
        this.m_openList = [];
        this.m_closeList = [];
        for (let i: number = 0; i < this.m_width; ++i) {
            for (let j: number = 0; j < this.m_height; ++j) {
                (<PathNode>this.m_nodeArray[i][j]).Reset();
            }
        }
        let endNode: PathNode = this.m_nodeArray[endX][endY];
        let curNode: PathNode = null;
        let closestNode: PathNode = null;
        this.addOpenNode(this.m_nodeArray[startX][startY]);
        while (this.m_openList.length) {
            curNode = this.findMinFInOpenList();
            if (!closestNode || closestNode.F <= 0 || curNode.F < closestNode.F) {//todo
                closestNode = curNode;
            }
            this.delOpenNode(curNode);
            this.addCloseNode(curNode);
            if (curNode == endNode) return curNode;//找到的這個點是終點的話直接返回這個點
            let surroundPoints: Array<PathNode> = this.getSurroundPoints(curNode);
            for (let target of surroundPoints) {
                let tempG: number = this.CalcG(curNode, target);
                if (!this.isNodeInOpenList(target)) {
                    target.parent = curNode;
                    target.G = tempG;
                    target.H = this.CalcH(target, endNode);
                    target.F = this.CalcF(target);
                    this.addOpenNode(target);
                }
                else {
                    if (tempG < target.G) {
                        target.parent = curNode;
                        target.G = tempG;
                        target.F = this.CalcF(target);
                    }
                }
            }
        }
        return closestNode;
    }
    /**
     * 添加節點到開啓列表
     * @param curNode 
     */
    private addOpenNode(curNode: PathNode) {
        this.m_openList.push(curNode);
    }
    /**
     * 添加節點到關閉列表
     * @returns
     */
    private delOpenNode(curNode: PathNode) {
        let index: number = this.m_openList.indexOf(curNode);
        if (index > -1) {
            this.m_openList.splice(index, 1);
        }
    }
    /**
     * 當前點是否在开启列表中
     * @returns
     */
    private isNodeInOpenList(curNode: PathNode): boolean {
        let index: number = this.m_openList.indexOf(curNode);
        return index > -1;
    }
    /**
     * 添加節點到關閉列表
     * @returns
     */
    private addCloseNode(curNode: PathNode) {
        this.m_closeList.push(curNode);
    }
    /**
     * 當前點是否在關閉列表中
     * @returns
     */
    private isNodeInCloseList(curNode: PathNode): boolean {
        let index: number = this.m_closeList.indexOf(curNode);
        return index > -1;
    }
    /**
     * 獲得開啓列表中F最小的節點
     */
    private findMinFInOpenList(): PathNode {
        let len: number = this.m_openList.length;

        let minFNode: PathNode;
        for (let i of this.m_openList) {
            if (!minFNode) {
                minFNode = i;
            }
            else if (i.F <= minFNode.F) {
                minFNode = i;
            }
        }
        return minFNode;
    }
    /**
     * 當前點的周圍可到達點
     */
    private getSurroundPoints(curNode: PathNode): Array<PathNode> {
        let surround: PathNode[] = [];
        let up: PathNode = this.getNodeDirNode(curNode, EnumDir.E0up);
        let down: PathNode = this.getNodeDirNode(curNode, EnumDir.E1down);
        let left: PathNode = this.getNodeDirNode(curNode, EnumDir.E2left);
        let right: PathNode = this.getNodeDirNode(curNode, EnumDir.E3right);
        let leftUp: PathNode = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E4upLeft) : null;
        let rightUp: PathNode = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E5upRight) : null;
        let leftDown: PathNode = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E6downLeft) : null;
        let rightDown: PathNode = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E7downRight) : null;
        up && surround.push(up);
        down && surround.push(down);
        left && surround.push(left);
        right && surround.push(right);
        leftUp && surround.push(leftUp);
        rightUp && surround.push(rightUp);
        leftDown && surround.push(leftDown);
        rightDown && surround.push(rightDown);
        return surround;

    }
    private getNodeDirNode(curNode: PathNode, dir: EnumDir): PathNode {
        let tarNode: PathNode;
        let offX: number = 0;
        let offY: number = 0;
        switch (dir) {
            case EnumDir.E0up:
                offY = -1;
                break;
            case EnumDir.E1down:
                offY = 1
                break;
            case EnumDir.E2left:
                offX = -1;
                break;
            case EnumDir.E3right:
                offX = 1;
                break;
            case EnumDir.E4upLeft:
                offY = -1;
                offX = -1;
                break;
            case EnumDir.E5upRight:
                offY = -1;
                offX = 1;
                break;
            case EnumDir.E6downLeft:
                offY = 1;
                offX = -1;
                break;
            case EnumDir.E7downRight:
                offY = 1;
                offX = 1;
                break;

        }
        let x: number = curNode.x + offX;
        let y: number = curNode.y + offY;
        //該點是否合法
        let line: Array<PathNode> = this.m_nodeArray[x];
        line && (tarNode = line[y]);
        if (tarNode == null) return tarNode;
        !this.isWalkable(x, y) && (tarNode = null);
        this.isNodeInCloseList(tarNode) && (tarNode = null);
        return tarNode;
    }
    /**
     * 计算G值
     * @param curNode 
     * @param target 
     * @returns
     */
    private CalcG(curNode: PathNode, target: PathNode): number {
        let extraG: number = 0;
        if (Math.abs(target.x - curNode.x) + Math.abs(target.y - curNode.y) == 1) {
            extraG = this.m_kCost1;
        }
        else {
            extraG = this.m_kCost2;
        }
        let pG: number = 0;
        if (target.parent) {
            pG = target.parent.G;
        }
        return pG + extraG;
    }
    private CalcH(cur: PathNode, end: PathNode): number {
        let squareX: number = (end.x - cur.x) * (end.x - cur.x);
        let squareY: number = (end.y - cur.y) * (end.y - cur.y);
        let edgeCost: number = Math.sqrt(squareX + squareY) * this.m_kCost1;
        edgeCost | 0;
        return edgeCost;
    }
    private CalcF(cur: PathNode): number {
        return cur.G + cur.H;
    }
    public destroy() { }

}

