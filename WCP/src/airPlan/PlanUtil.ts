export default class PlanUtil {
    private static Dic: any;
    static regPlanUrl() {
        this.Dic || (this.Dic = new Object());
        this.Dic["Plaser"] = "plan/laserplan/laserPlan.png";
    }
    static getPlanUrl(pName: string) {
        return this.Dic[pName];
    }
}