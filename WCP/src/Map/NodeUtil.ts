export default class NodeUtil {
    public static readonly GRIDSIZE: number = 125;
    public static TilePixX(tx: number): number {
        return (tx * this.GRIDSIZE);
    }
    public static TilePixY(ty: number): number {
        return (ty * this.GRIDSIZE);
    }
}