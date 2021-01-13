export class SceneMode implements ViewMode {
    private curView: Laya.View;//当前打开的页面
    constructor() { }
    openView(fName: string) {
        let fullName: string = fName + `.scene`;
        Laya.Scene.open(fullName);
    }
    closeView(fName: string) {
        let fullName: string = fName + `.scene`;
        Laya.Scene.close(fullName);
    }
}