
export default class PathNode {
    x = 0;
    y = 0;
    /**权值（f=g+h） */
    F = 0;
    G = 0;
    H = 0
    /**父节点 */
    parent: PathNode = null;
    public Reset() {
        this.F = 0; this.H = 0; this.G = 0;
        this.parent = null;
    }

}
export enum EnumDir {
    E0up,
    E1down,
    E2left,
    E3right,
    E4upLeft,
    E5upRight,
    E6downLeft,
    E7downRight
}

