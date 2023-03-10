export class Point {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * 计算两点间的距离
     * @param p
     */
    distance(p: Point): number {
        return Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2);
    }


    /**
     * 判断两个点是否相同
     * @param p
     */
    equal(p: Point){
        return this.x == p.x && this.y == p.y;
    }

}
