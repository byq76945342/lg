import { ui } from "../ui/layaMaxUI";
import UIMgr from "../uiUtil.ts/UIMgr";

export default class BottomViewExt extends ui.BottomViewUI {
    constructor() {
        super();
        this.on(Laya.Event.CLICK, this, this.closeThis);
    }
    private closeThis() {
        UIMgr.ins.closeView(`LoadingView`);
        // UIMgr.ins.openView(`GameView`);//
        // GameMgr.ins.gameStar();
        UIMgr.ins.openView(`DimageView`);
    }

}