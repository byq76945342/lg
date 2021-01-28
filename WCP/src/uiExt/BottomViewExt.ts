import GameMgr from "../Game/GameMgr";
import { ui } from "../ui/layaMaxUI";
import UIMgr from "../uiUtil.ts/UIMgr";

export default class BottomViewExt extends ui.BottomViewUI {
    constructor() {
        super();
        this.on(Laya.Event.CLICK, this, this.closeThis);
        this.zOrder = 0;
    }
    private closeThis() {
        UIMgr.ins.closeView(`LoadingView`);
        UIMgr.ins.openView(`GameView`);//
        UIMgr.ins.openView(`ControlView`);
        // GameMgr.ins.gameStar();
        UIMgr.ins.openView(`DimageView`);
    }

}