export class SceneMode implements ViewMode {
    private curView: Laya.View;//当前打开的页面
    constructor() { }
    openView(fName: string) {
        let fullName: string = fName + `.scene`;
        Laya.Scene.root.zOrder=1;
        Laya.Scene.open(fullName,false);
    }
    closeView(fName: string) {
        let fullName: string = fName + `.scene`;
        Laya.Scene.close(fullName);
    }
}