(function () {
    'use strict';

    class Laser extends Laya.Image {
        constructor() {
            super();
            this.mouseEnabled = true;
            this.width = 50;
            this.pivotX = 25;
            this.height = 1000;
            this.pivotY = 1000;
            this.light = new Laya.Sprite();
            this.addChild(this.light);
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.followMouse);
            this.formateLaser();
        }
        formateLaser() {
            this.light.graphics && this.light.graphics.clear();
            this.light.graphics.drawRect(0, 0, 50, 1000, `#ffffff`);
        }
        followMouse(e) {
            this.x = Laya.stage.mouseX;
            this.y = Laya.stage.mouseY;
        }
        destroy() {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.followMouse);
            super.destroy();
        }
    }

    class MonsterPlan extends Laya.Image {
        constructor() {
            super();
            this.pos(Math.random() * Laya.stage.width, -100);
            this.graphics.drawRect(0, 0, 100, 100, `#000fff`);
        }
        get onView() {
            return this.parent != null;
        }
        checkPosOutView() {
            return this.y > Laya.stage.height;
        }
        addTo() {
            Laya.stage.addChild(this);
            this.y = -100;
        }
    }

    class GameMgr {
        constructor() {
            this.runingMonster = [];
            this.standbyMonster = [];
        }
        static get ins() {
            this._ins || (this._ins = new GameMgr());
            return this._ins;
        }
        gameStar() {
            this.createHero();
            this.starLoop();
        }
        createHero() {
            this.self && (this.self.destroy(), this.self = null);
            this.self || (this.self = new Laser());
            Laya.stage.addChild(this.self);
        }
        starLoop() {
            Laya.timer.loop(1, this, this.loop);
            this.loop();
        }
        loop() {
            let newPlat = this.standbyMonster.pop();
            newPlat || (newPlat = new MonsterPlan());
            newPlat.addTo();
            this.runingMonster.push(newPlat);
            for (let i of this.runingMonster) {
                i.y += 10;
            }
            for (let i of this.runingMonster) {
                let index = this.runingMonster.indexOf(i);
                i.checkPosOutView() && (this.standbyMonster.push(i), this.runingMonster.splice(index, 1));
            }
        }
    }

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
            GameMgr.ins.gameStar();
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("uiExt/BottomViewExt.ts", BottomViewExt);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "LoadingView.scene";
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
