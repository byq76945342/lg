(function () {
    'use strict';

    var View = Laya.View;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        class BottomViewUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.createView(BottomViewUI.uiView);
            }
        }
        BottomViewUI.uiView = { "type": "View", "props": { "y": 0, "width": 512, "runtime": "uiExt/BottomViewExt.ts", "height": 313, "centerY": 0, "centerX": 0 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "skin": "comp/image.png" }, "compId": 12 }], "loadList": ["comp/image.png"], "loadList3D": [] };
        ui.BottomViewUI = BottomViewUI;
        REG("ui.BottomViewUI", BottomViewUI);
        class ControlViewUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("ControlView");
            }
        }
        ui.ControlViewUI = ControlViewUI;
        REG("ui.ControlViewUI", ControlViewUI);
        class DimageViewUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("DimageView");
            }
        }
        ui.DimageViewUI = DimageViewUI;
        REG("ui.DimageViewUI", DimageViewUI);
        class GameViewUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("GameView");
            }
        }
        ui.GameViewUI = GameViewUI;
        REG("ui.GameViewUI", GameViewUI);
        class LoadingViewUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("LoadingView");
            }
        }
        ui.LoadingViewUI = LoadingViewUI;
        REG("ui.LoadingViewUI", LoadingViewUI);
    })(ui || (ui = {}));

    class SceneMode {
        constructor() { }
        openView(fName) {
            let fullName = fName + `.scene`;
            Laya.Scene.root.zOrder = 1;
            Laya.Scene.open(fullName, false);
        }
        closeView(fName) {
            let fullName = fName + `.scene`;
            Laya.Scene.close(fullName);
        }
    }

    class UIMgr {
        constructor() {
            this.sceneMode = new SceneMode();
        }
        static get ins() {
            if (!this._ins) {
                this._ins = new UIMgr();
            }
            return this._ins;
        }
        openView(fName) {
            this.sceneMode.openView(fName);
        }
        closeView(fName) {
            this.sceneMode.closeView(fName);
        }
    }

    class BottomViewExt extends ui.BottomViewUI {
        constructor() {
            super();
            this.on(Laya.Event.CLICK, this, this.closeThis);
            this.zOrder = 0;
        }
        closeThis() {
            UIMgr.ins.closeView(`LoadingView`);
            UIMgr.ins.openView(`GameView`);
            UIMgr.ins.openView(`ControlView`);
            UIMgr.ins.openView(`DimageView`);
        }
    }

    class ControlViewExt extends ui.ControlViewUI {
        constructor() {
            super();
            this.isTouch = false;
            this.touchDir = new Laya.Point();
            this.zOrder = 100;
            let stage = this.imgTar.on(Laya.Event.MOUSE_DOWN, this, this.touckStr);
        }
        dragImage(e) {
            let x;
            let y;
            if (!this.isTouch) {
                this.imgTar.x = (this.imgCont.width - this.imgTar.width) >> 1;
                this.imgTar.y = (this.imgCont.height - this.imgTar.height) >> 1;
                return;
            }
            else {
                x = e.stageX;
                y = e.stageY;
            }
            let centerx = this.imgCont.x + (this.imgCont.width >> 1);
            let centery = this.imgCont.y + (this.imgCont.height >> 1);
            let dirx = x - centerx;
            let diry = y - centery;
            this.touchDir.setTo(dirx, diry);
            this.touchDir.normalize();
            this.imgTar.x = this.touchDir.x * 50 + (this.imgTar.width >> 1);
            this.imgTar.y = this.touchDir.y * 50 + (this.imgTar.height >> 1);
        }
        touckStr() {
            this.isTouch = true;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.dragImage);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.touckEnd);
        }
        touckEnd() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.dragImage);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.touckEnd);
            this.isTouch = false;
            this.dragImage(null);
        }
        onAwake() {
            console.log("secen call func onAwake");
        }
    }

    class DimageViewExt extends ui.DimageViewUI {
        constructor() {
            super();
            this.zOrder = 0;
        }
    }

    class PathNode {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.F = 0;
            this.G = 0;
            this.H = 0;
            this.parent = null;
        }
        Reset() {
            this.F = 0;
            this.H = 0;
            this.G = 0;
            this.parent = null;
        }
    }
    var EnumDir;
    (function (EnumDir) {
        EnumDir[EnumDir["E0up"] = 0] = "E0up";
        EnumDir[EnumDir["E1down"] = 1] = "E1down";
        EnumDir[EnumDir["E2left"] = 2] = "E2left";
        EnumDir[EnumDir["E3right"] = 3] = "E3right";
        EnumDir[EnumDir["E4upLeft"] = 4] = "E4upLeft";
        EnumDir[EnumDir["E5upRight"] = 5] = "E5upRight";
        EnumDir[EnumDir["E6downLeft"] = 6] = "E6downLeft";
        EnumDir[EnumDir["E7downRight"] = 7] = "E7downRight";
    })(EnumDir || (EnumDir = {}));

    class PathFinder {
        constructor(width, height) {
            this.m_width = 0;
            this.m_height = 0;
            this.m_kCost1 = 10;
            this.m_kCost2 = 14;
            this.m_nodeArray = null;
            this.m_staticBlocks = null;
            this.m_dymanicBlocks = null;
            this.m_openList = [];
            this.m_closeList = [];
            this.m_isIgnoreCorner = false;
            this.m_height = height;
            this.m_width = width;
            this.m_nodeArray = new Array(width);
            this.m_staticBlocks = new Array(width);
            this.m_dymanicBlocks = new Array(width);
            for (let indexW = 0; indexW < width; ++indexW) {
                this.m_nodeArray[indexW] = new Array(height);
                this.m_staticBlocks[indexW] = new Array(height);
                this.m_dymanicBlocks[indexW] = new Array(height);
                for (let indexH = 0; indexH < height; ++indexH) {
                    this.m_nodeArray[indexW][indexH] = new PathNode();
                    this.m_nodeArray[indexW][indexH].x = indexW;
                    this.m_nodeArray[indexW][indexH].y = indexH;
                    this.m_dymanicBlocks[indexW][indexH] = 0;
                    this.m_staticBlocks[indexW][indexH] = 0;
                }
            }
        }
        set isIgnoreCorner(value) {
            this.m_isIgnoreCorner = value;
        }
        setStaticBlock(x, y, data) {
            this.m_staticBlocks[x][y] = data;
        }
        isWalkable(x, y) {
            if (this.m_staticBlocks[x][y] == 0) {
                return true;
            }
            return false;
        }
        findPath(startX, startY, endX, endY) {
            let path = [];
            let resultNode = this.SearchPath(startX, startY, endX, endY);
            while (resultNode) {
                let point = new Laya.Point();
                point.x = resultNode.x;
                point.y = resultNode.y;
                path.push(point);
                resultNode = resultNode.parent;
            }
            path.reverse();
            path.shift();
            return path;
        }
        SearchPath(startX, startY, endX, endY) {
            this.m_openList = [];
            this.m_closeList = [];
            for (let i = 0; i < this.m_width; ++i) {
                for (let j = 0; j < this.m_height; ++j) {
                    this.m_nodeArray[i][j].Reset();
                }
            }
            let endNode = this.m_nodeArray[endX][endY];
            let curNode = null;
            let closestNode = null;
            this.addOpenNode(this.m_nodeArray[startX][startY]);
            while (this.m_openList.length) {
                curNode = this.findMinFInOpenList();
                if (!closestNode || closestNode.F <= 0 || curNode.F < closestNode.F) {
                    closestNode = curNode;
                }
                this.delOpenNode(curNode);
                this.addCloseNode(curNode);
                if (curNode == endNode) {
                    return curNode;
                }
                let surroundPoints = this.getSurroundPoints(curNode);
                for (let target of surroundPoints) {
                    let tempG = this.CalcG(curNode, target);
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
        addOpenNode(curNode) {
            this.m_openList.push(curNode);
        }
        delOpenNode(curNode) {
            let index = this.m_openList.indexOf(curNode);
            if (index > -1) {
                this.m_openList.splice(index, 1);
            }
        }
        isNodeInOpenList(curNode) {
            let index = this.m_openList.indexOf(curNode);
            return index > -1;
        }
        addCloseNode(curNode) {
            this.m_closeList.push(curNode);
        }
        isNodeInCloseList(curNode) {
            let index = this.m_closeList.indexOf(curNode);
            return index > -1;
        }
        findMinFInOpenList() {
            let minFNode;
            for (let i of this.m_openList) {
                if (!minFNode) {
                    minFNode = i;
                }
                else if (i.F < minFNode.F) {
                    minFNode = i;
                }
            }
            return minFNode;
        }
        getSurroundPoints(curNode) {
            let surround = [];
            let up = this.getNodeDirNode(curNode, EnumDir.E0up);
            let down = this.getNodeDirNode(curNode, EnumDir.E1down);
            let left = this.getNodeDirNode(curNode, EnumDir.E2left);
            let right = this.getNodeDirNode(curNode, EnumDir.E3right);
            let leftUp = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E4upLeft) : null;
            let rightUp = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E5upRight) : null;
            let leftDown = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E6downLeft) : null;
            let rightDown = this.m_isIgnoreCorner ? this.getNodeDirNode(curNode, EnumDir.E7downRight) : null;
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
        getNodeDirNode(curNode, dir) {
            let tarNode;
            let offX = 0;
            let offY = 0;
            switch (dir) {
                case EnumDir.E0up:
                    offY = -1;
                    break;
                case EnumDir.E1down:
                    offY = 1;
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
            let x = curNode.x + offX;
            let y = curNode.y + offY;
            let line = this.m_nodeArray[x];
            line && (tarNode = line[y]);
            if (tarNode == null)
                return tarNode;
            !this.isWalkable(x, y) && (tarNode = null);
            this.isNodeInCloseList(tarNode) && (tarNode = null);
            return tarNode;
        }
        CalcG(curNode, target) {
            let extraG = 0;
            if (Math.abs(target.x - curNode.x) + Math.abs(target.y - curNode.y) == 1) {
                extraG = this.m_kCost1;
            }
            else {
                extraG = this.m_kCost2;
            }
            let pG = 0;
            if (target.parent) {
                pG = target.parent.G;
            }
            return pG + extraG;
        }
        CalcH(cur, end) {
            let squareX = (end.x - cur.x) * (end.x - cur.x);
            let squareY = (end.y - cur.y) * (end.y - cur.y);
            let edgeCost = Math.sqrt(squareX + squareY) * this.m_kCost1;
            edgeCost = edgeCost | 0;
            return edgeCost;
        }
        CalcF(cur) {
            return cur.G + cur.H;
        }
        destroy() { }
    }

    class NodeUtil {
        static TilePixX(tx) {
            return (tx * this.GRIDSIZE);
        }
        static TilePixY(ty) {
            return (ty * this.GRIDSIZE);
        }
    }
    NodeUtil.GRIDSIZE = 125;

    class TMap extends Laya.TiledMap {
        constructor() {
            super();
            this.mapName = "";
            this.touchPoint = new Laya.Point;
        }
        createMapByName(mName) {
            this.mapName = mName;
            let regW = Laya.stage.width;
            let regH = Laya.stage.height;
            let viewReg = new Laya.Rectangle(0, 0, regW, regH);
            this.createMap(`${mName}.json`, viewReg, new Laya.Handler(this, this.onCreated));
        }
        onCreated() {
            this.touchLayer = this.getLayerByName("build");
            this.setViewPortPivotByScale(0, 0);
            this.initFinder();
            Laya.stage.on(Laya.Event.RESIZE, this, this.resetViewReg);
            this.resetViewReg();
            this.moveViewPort(0, 0);
            MapMgr.ins.addToMap();
            this.mapSprite().zOrder = 0;
            this.mapSprite().name = "maproot";
        }
        resetViewReg() {
            this.numColumnsTile * NodeUtil.GRIDSIZE;
            this.scale = Laya.stage.height / (this.numRowsTile * NodeUtil.GRIDSIZE);
            this.changeViewPortBySize(Laya.stage.width, Laya.stage.height);
        }
        initFinder() {
            let mapGridW = this.numColumnsTile;
            let mapGridH = this.numRowsTile;
            this._pathFinder = new PathFinder(mapGridW, mapGridH);
            let blockLayer = this.getLayerByName("block");
            for (let x = 0; x < mapGridW; ++x) {
                for (let y = 0; y < mapGridH; ++y) {
                    this._pathFinder.setStaticBlock(x, y, blockLayer.getTileData(x, y));
                }
            }
        }
        clickMap(e) {
            this.touchLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touchPoint);
            let tileX = this.touchPoint.x | 0;
            let tileY = this.touchPoint.y | 0;
            if (this._pathFinder.isWalkable(tileX, tileY)) {
                this.regNodeView.StartActiveMove(tileX, tileY);
            }
        }
        moveViewPort(pixX, pixY) {
            let cx = pixX;
            let cy = pixY;
            super.moveViewPort(cx, cy);
        }
        addChild(node) {
            if (!this.regNodeView) {
                this.regNodeView = node;
            }
            this.getLayerByName("obj").addChild(node);
            node.initData(this);
            node.updatePos();
        }
        getLayerByName(lName) {
            return super.getLayerByName(lName);
        }
        destroyMap() {
            this.touchLayer = null;
            this.mapName = "";
            this.scale = 1;
            this._pathFinder.destroy();
            super.destroy();
        }
        get pathFinder() {
            return this._pathFinder;
        }
    }

    class MapMgr {
        constructor() {
            this.nodeList = [];
        }
        static get ins() {
            this._ins || (this._ins = new MapMgr());
            return this._ins;
        }
        addMap(mName) {
            this.m_Map = new TMap();
            this.m_Map.createMapByName(mName);
        }
        delMap() {
            for (let i of this.nodeList) {
                i.destroy();
                i = null;
            }
            this.nodeList = [];
            this.m_Map.destroyMap();
            this.m_Map = null;
        }
        addToMapList(node) {
            this.nodeList.push(node);
        }
        addToMap() {
            for (let i of this.nodeList) {
                this.m_Map.addChild(i);
                i.updatePos();
            }
        }
        updateViewPort(pixX, pixY) {
            this.m_Map.moveViewPort(pixX, pixY);
        }
        get pathFinder() {
            return this.m_Map.pathFinder;
        }
        get map() {
            return this.m_Map;
        }
    }

    class HeroNode extends Laya.GridSprite {
        constructor() {
            super();
            this.heroNode = new Laya.Sprite();
            this.m_movePath = [];
            this.m_speed = 30;
            this.Tilepos = new Laya.Point();
            this.heroNode.graphics.drawRect(0, 0, 125, 125, `#ff9999`);
            this.addChild(this.heroNode);
            Laya.timer.frameLoop(1, this, this.selfFrame);
        }
        initData(map) {
            super.initData(map);
        }
        StartActiveMove(x, y) {
            let startX = 0;
            let startY = 0;
            let path;
            startX = this.getTileX();
            startY = this.getTileY();
            if (this.m_destNodeIndex == null) {
                path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
                if (!path.length)
                    return;
                this.m_movePath = path;
                this.m_destNodeIndex = 0;
            }
            else {
                startX = this.m_movePath[this.m_destNodeIndex].x;
                startY = this.m_movePath[this.m_destNodeIndex].y;
                path = MapMgr.ins.pathFinder.findPath(startX, startY, x, y);
                if (!path.length)
                    return;
                this.StopCurMove();
                this.m_movePath = this.m_movePath.concat(path);
            }
        }
        StopCurMove() {
            if (this.m_movePath.length <= 0)
                return;
            this.m_movePath.splice(this.m_destNodeIndex + 1);
        }
        selfFrame() {
            if (this.m_destNodeIndex == null)
                return;
            let m_destPixelPosX = NodeUtil.TilePixX(this.m_movePath[this.m_destNodeIndex].x);
            let m_destPixelPosY = NodeUtil.TilePixY(this.m_movePath[this.m_destNodeIndex].y);
            let moveLength = this.m_speed;
            let moveDir = new Laya.Point(m_destPixelPosX - this.getPixX(), m_destPixelPosY - this.getPixY());
            let destDistance = moveDir.distance(0, 0);
            while (moveLength >= destDistance) {
                this.setPixelPosition(m_destPixelPosX, m_destPixelPosY);
                this.m_destNodeIndex += 1;
                if (this.m_destNodeIndex >= this.m_movePath.length) {
                    this.Tilepos.setTo(this.m_movePath[this.m_movePath.length - 1].x, this.m_movePath[this.m_movePath.length - 1].y);
                    this.m_destNodeIndex = null;
                    return;
                }
                m_destPixelPosX = NodeUtil.TilePixX(this.m_movePath[this.m_destNodeIndex].x);
                m_destPixelPosY = NodeUtil.TilePixY(this.m_movePath[this.m_destNodeIndex].y);
                moveLength -= destDistance;
                moveDir.setTo(m_destPixelPosX - this.getPixX(), m_destPixelPosY - this.getPixY());
                destDistance = moveDir.distance(0, 0);
            }
            moveDir.normalize();
            let cosAngle = moveDir.x;
            let sinAngle = moveDir.y;
            moveDir.x = moveLength * cosAngle;
            moveDir.y = moveLength * sinAngle;
            let pixelPosX = (this.getPixX() + moveDir.x);
            let pixelPosY = (this.getPixY() + moveDir.y);
            this.setPixelPosition(pixelPosX, pixelPosY);
        }
        setPixelPosition(x, y) {
            this.relativeX = x | 0;
            this.relativeY = y | 0;
            let map = MapMgr.ins.map;
            let offx = 0;
            let offy = 0;
            let cx = x + offx - (map.viewPortWidth >> 1);
            let cy = y + offy - (map.viewPortHeight >> 1);
            let maxX = map.width - map.viewPortWidth;
            cx > maxX && (cx = maxX);
            cx < 0 && (cx = 0);
            let maxY = map.height - map.viewPortHeight;
            cy > maxY && (cy = maxY);
            cy < 0 && (cy = 0);
            this.moveMapViewPort(cx, cy);
            this.updatePos();
        }
        moveMapViewPort(x, y) {
            MapMgr.ins.updateViewPort(x, y);
        }
        updatePos() {
            super.updatePos();
        }
        getPixX() {
            return (this.relativeX | 0);
        }
        getPixY() {
            return (this.relativeY | 0);
        }
        getTileX() {
            return this.Tilepos.x;
        }
        getTileY() {
            return this.Tilepos.y;
        }
        destroy() {
            this.heroNode.removeSelf();
            this.heroNode.destroy();
            this.heroNode = null;
            this.removeSelf();
            super.destroy();
        }
    }

    class GameViewExt extends ui.GameViewUI {
        constructor() {
            super();
            this.hero = new HeroNode();
            MapMgr.ins.addMap(`map/mainmap`);
            MapMgr.ins.addToMapList(this.hero);
            this.zOrder = 1;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("uiExt/BottomViewExt.ts", BottomViewExt);
            reg("uiExt/ControlViewExt.ts", ControlViewExt);
            reg("uiExt/DimageViewExt.ts", DimageViewExt);
            reg("uiExt/GameViewExt.ts", GameViewExt);
        }
    }
    GameConfig.width = 1334;
    GameConfig.height = 750;
    GameConfig.scaleMode = "fixedheight";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "ControlView.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya.Stat.show();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.screenAdaptationEnabled = true;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            UIMgr.ins.openView(`LoadingView`);
        }
    }
    new Main();

}());
//# sourceMappingURL=bundle.js.map
