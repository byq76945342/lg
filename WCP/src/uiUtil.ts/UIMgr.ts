import { SceneMode } from './SceneMode';
export default class UIMgr {
    private constructor() { }
    private static _ins: UIMgr;
    public static get ins(): UIMgr {
        if (!this._ins) {
            this._ins = new UIMgr();
        }
        return this._ins;
    }
    private sceneMode: SceneMode = new SceneMode();//主页面切换用
    private popMode;//弹窗切换用
    public openView(fName: string) {

        this.sceneMode.openView(fName);
    }
    public closeView(fName: string) {
        this.sceneMode.closeView(fName);
    }

}