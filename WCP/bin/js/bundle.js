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

    class HeroNode extends Laya.GridSprite {
        constructor() {
            super();
            this.heroNode = new Laya.Sprite();
            this.heroNode.graphics.drawRect(0, 0, 50, 50, `#ff9999`);
            this.addChild(this.heroNode);
        }
    }

    class GameViewExt extends ui.GameViewUI {
        constructor() {
            super();
            this.touckPoint = new Laya.Point();
            this.createTileMap();
        }
        createTileMap() {
            this.map = new Laya.TiledMap();
            let viewReg = new Laya.Rectangle(0, 0, this.width, this.height);
            this.map.createMap("map/mainmap.json", viewReg, new Laya.Handler(this, this.onCreateComplete));
        }
        onCreateComplete() {
            this.createHero();
        }
        movePort() {
            this.map.moveViewPort(100, 100);
        }
        createHero() {
            this.touckLayer = this.map.getLayerByName("build");
            this.hero = new HeroNode();
            this.touckLayer.addChild(this.hero);
            Laya.stage.on(Laya.Event.CLICK, this, this.clickMap);
        }
        clickMap(e) {
            Laya.Tween.clearAll(this.hero);
            this.touckLayer.getTilePositionByScreenPos(e.stageX, e.stageY, this.touckPoint);
            Laya.Tween.to(this.hero, { x: this.touckPoint.x * 125, y: this.touckPoint.y * 125 }, 2000);
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
    GameConfig.startScene = "GameView.scene";
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
