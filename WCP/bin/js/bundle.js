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
            Laya.Scene.open(fullName);
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
        }
        closeThis() {
            UIMgr.ins.closeView(`LoadingView`);
            UIMgr.ins.openView(`GameView`);
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
                if (curNode == endNode)
                    return curNode;
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
            let len = this.m_openList.length;
            let minFNode;
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
        getSurroundPoints(curNode) {
            let surround = [];
            let x = 0;
            let y = 0;
            let up = this.getNodeDirNode(curNode, EnumDir.E0up);
            let down = this.getNodeDirNode(curNode, EnumDir.E1down);
            let left = this.getNodeDirNode(curNode, EnumDir.E2left);
            let right = this.getNodeDirNode(curNode, EnumDir.E3right);
            let leftUp = this.getNodeDirNode(curNode, EnumDir.E4upLeft);
            let rightUp = this.getNodeDirNode(curNode, EnumDir.E5upRight);
            let leftDown = this.getNodeDirNode(curNode, EnumDir.E6downLeft);
            let rightDown = this.getNodeDirNode(curNode, EnumDir.E7downRight);
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
            edgeCost | 0;
            return edgeCost;
        }
        CalcF(cur) {
            return cur.G + cur.H;
        }
    }

    class HeroNode extends Laya.GridSprite {
        constructor() {
            super();
            this.heroNode = new Laya.Sprite();
            this.m_movePath = [];
            this.heroNode.graphics.drawRect(0, 0, 50, 50, `#ff9999`);
            this.addChild(this.heroNode);
            Laya.timer.frameLoop(1, this, this.selfFrame);
        }
        StartActiveMove(x, y) {
            let startX = 0;
            let startY = 0;
            let path;
            this.m_movePath = [];
            if (!this.m_movePath.length) {
                startX = this.getPixX() / 125;
                startY = this.getPixY() / 125;
                startX = startX | 0;
                startY = startY | 0;
                path = GameViewExt.m_pathFinder.findPath(startX, startY, x, y);
                this.m_movePath = path;
                this.m_destNodeIndex = 0;
            }
        }
        selfFrame() {
            if (this.m_destNodeIndex != null) {
                if (this.m_movePath[this.m_destNodeIndex]) {
                    this.setPixelPosition(this.m_movePath[this.m_destNodeIndex].x * 125, this.m_movePath[this.m_destNodeIndex].y * 125);
                    this.m_destNodeIndex += 1;
                }
                else {
                    this.m_destNodeIndex = null;
                }
            }
        }
        setPixelPosition(x, y) {
            this.relativeX = x;
            this.relativeY = y;
            let cx = x - (GameViewExt.map.viewPortWidth >> 1);
            let cy = y - (GameViewExt.map.viewPortHeight >> 1);
            cx < 0 && (cx = 0);
            let maxX = GameViewExt.map.width - GameViewExt.map.viewPortWidth;
            cx > maxX && (cx = maxX);
            cy < 0 && (cy = 0);
            let maxY = GameViewExt.map.height - GameViewExt.map.viewPortHeight;
            cy > maxY && (cy = maxY);
            GameViewExt.map.moveViewPort(cx, cy);
            this.updatePos();
        }
        getPixX() {
            return this.relativeX;
        }
        getPixY() {
            return this.relativeY;
        }
    }

    class GameViewExt extends ui.GameViewUI {
        constructor() {
            super();
            this.touckPoint = new Laya.Point();
            this.createTileMap();
        }
        createTileMap() {
            GameViewExt.map = new Laya.TiledMap();
            let viewReg = new Laya.Rectangle(0, 0, Laya.stage.width, Laya.stage.height);
            GameViewExt.map.createMap("map/mainmap.json", viewReg, new Laya.Handler(this, this.onCreateComplete));
        }
        onCreateComplete() {
            GameViewExt.map.setViewPortPivotByScale(0, 0);
            GameViewExt.map.scale = 0.5;
            this.createHero();
            this.initFinder();
        }
        createHero() {
            this.touckLayer = GameViewExt.map.getLayerByName("build");
            this.hero = new HeroNode();
            this.hero.initData(GameViewExt.map);
            this.touckLayer.addChild(this.hero);
            this.hero.updatePos();
            Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);
        }
        clickMap(e) {
            this.touckLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touckPoint);
            let tileX = this.touckPoint.x | 0;
            let tileY = this.touckPoint.y | 0;
            let touckWalkable = GameViewExt.m_pathFinder.isWalkable(tileX, tileY);
            if (touckWalkable) {
                this.hero.StartActiveMove(tileX, tileY);
            }
        }
        initFinder() {
            let mapGridW = GameViewExt.map.numColumnsTile;
            let mapGridH = GameViewExt.map.numRowsTile;
            GameViewExt.m_pathFinder = new PathFinder(mapGridW, mapGridH);
            GameViewExt.m_pathFinder.isIgnoreCorner = false;
            let blockLayer = GameViewExt.map.getLayerByName(`block`);
            for (let i = 0; i < mapGridW; ++i) {
                for (let j = 0; j < mapGridH; ++j) {
                    GameViewExt.m_pathFinder.setStaticBlock(i, j, blockLayer.getTileData(i, j));
                }
            }
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("uiExt/BottomViewExt.ts", BottomViewExt);
            reg("uiExt/GameViewExt.ts", GameViewExt);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "BottomView.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            let needChangeHW = Laya.Browser.clientHeight > Laya.Browser.clientWidth;
            let borwerH = needChangeHW ? Laya.Browser.clientHeight : Laya.Browser.clientWidth;
            let browerW = needChangeHW ? Laya.Browser.clientWidth : Laya.Browser.clientHeight;
            let rhw = borwerH / browerW;
            let dhw = GameConfig.height / GameConfig.width;
            let isFullScreen = rhw > dhw;
            if (isFullScreen) {
                GameConfig.height = borwerH / browerW * GameConfig.width;
                GameConfig.height = GameConfig.height | 0;
            }
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya.Stat.show();
            Laya.stage.scaleMode = isFullScreen ? Laya.Stage.SCALE_FIXED_WIDTH : Laya.Stage.SCALE_FIXED_AUTO;
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
