export default class HeroNode extends Laya.GridSprite {
    private heroNode: Laya.Sprite = new Laya.Sprite();
    constructor() {
        super();
        this.heroNode.graphics.drawRect(0, 0, 50, 50, `#ff9999`);
        this.addChild(this.heroNode);
    }
}