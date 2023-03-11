import {Point} from "./Point";
import {Triangle} from "./Triangle";
import {Vector} from "./Vector";

enum LineJoin {
    'miter', 'round', 'bevel'
}

export class PolyLine {
    /**
     * 原始点坐标数组
     */
    private _points: Point[] = [];

    /**
     * 线宽
     * @private
     */
    private _lineWidth: number = 1;

    /**
     * 拐角样式
     */
    private _lineJoin: LineJoin = LineJoin.miter;

    /**
     * Polyline三角化后的三角形数组
     */
    private _triangles?: Triangle[];


    constructor(points: Point[], lineWidth: number = 1) {
        if (!points || points.length < 2){
            throw new Error('points为空或者点数量少于2，不能构成一条线段');
        }
        if (lineWidth < 0){
            throw new Error('线宽不能为负数');
        }
        this._points = points;
        this._lineWidth = lineWidth;
    }


    /**
     * 对points进行三角剖分
     */
    triangulation(): Triangle[]{
        if (this._triangles){
            return this._triangles;
        }

        if (this._lineJoin == LineJoin.miter){
            this._triangles = this.triangulationByMiterLineJoin();
        }

        return this._triangles || [];
    }

    /**
     * 使用Miter的样式对points进行三角剖分
     */
    private triangulationByMiterLineJoin(): Triangle[]{
        const points = this._points;
        const lineWidth = this._lineWidth;
        const halfOfLineWidth = lineWidth / 2;

        const stripTrianglePoints: Point[] = [];
        for (let i = 0; i < points.length; i++) {
            const A = points[i - 1];
            const B = points[i];
            const C = points[i + 1];

            //每次处理三个点A、B、C
            // A-------B
            //         |
            //         |
            //         C

            let vBB1;  //两个法向量相加得到B点切线的法向量的单位向量
            //向量AB和B点切线的法向量的夹角，后面需要用它来计算平移的距离
            let rad = Math.PI / 2;
            if (!A || A.equal(B)) {
                //第一个点，即没有A点
                const vBC = new Vector(B, C).normalize();
                vBB1 = new Vector(-vBC.y, vBC.x);
            } else if (!C || C.equal(B)) {
                //最后一个点，即没有C点
                const vAB = new Vector(A, B).normalize();
                vBB1 = new Vector(-vAB.y, vAB.x);
            } else {
                const vAB = new Vector(A, B).normalize();         //向量AB单位化
                const verticalVAB = new Vector(-vAB.y, vAB.x);    //AB的法向量

                const vBC = new Vector(B, C).normalize();         //向量BC单位化
                const verticalVBC = new Vector(-vBC.y, vBC.x);    //BC的法向量

                vBB1 = verticalVAB.add(verticalVBC).normalize();  //两个法向量相加得到B点切线的法向量再单位化

                rad = vAB.radians(vBB1);                          //计算平移的角度
            }


            //由B点按照切线的法向量方向平移计算出B1、B2两点
            const B1 = new Vector(B).add(vBB1.mul(halfOfLineWidth / Math.sin(rad)));
            const B2 = new Vector(B).add(vBB1.mul(-halfOfLineWidth / Math.sin(rad)));

            stripTrianglePoints.push(B1.pointValue, B2.pointValue);
        }

        //将上面生成的点保存为三角形
        const triangles = [];
        for (let i = 0; i < stripTrianglePoints.length - 2; i++) {
            const A = stripTrianglePoints[i];
            const B = stripTrianglePoints[i + 1];
            const C = stripTrianglePoints[i + 2];

            const triangle = new Triangle(A, B, C);

            triangles.push(triangle);
        }

        return triangles;
    }

}
