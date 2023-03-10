import {Point} from "./Point";

export class Vector {
    private _point1: Point;
    private _point2: Point;

    x: number = 0;
    y: number = 0;

    private _mod: number = 0;

    constructor(arg1: Point | number, arg2?: Point | number) {
        if (typeof arg1 == 'number' && typeof arg2 == 'number'){

            this._point1 = new Point(0, 0);
            this._point2 = new Point(arg1, arg2);

        } else if (!arg2 && arg1 instanceof Point){

            this._point1 = new Point(0, 0);
            this._point2 = arg1;

        }else if (arg1 instanceof Point && arg2 instanceof Point){

            this._point1 = arg1;
            this._point2 = arg2;

        }else {
            throw new Error('参数不正确')
        }

        this.initialize();
    }

    //初始化计算x、y和模
    private initialize() {
        this.x = this._point2.x - this._point1.x;
        this.y = this._point2.y - this._point1.y;
        this._mod = Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    //单位化
    normalize(){
        const x = this.x / this.mod;
        const y = this.y / this.mod;
        return new Vector(new Point(x, y));
    }

    //计算两个向量的夹角  结果为弧度
    radians(v: Vector) {
        return Math.acos((this.x * v.x + this.y * v.y) / (this.mod * v.mod));
    }

    //向量与向量相加
    add(v: Vector){
        const x = this.x + v.x;
        const y = this.y + v.y;
        return new Vector(x, y);
    }

    //向量与数相乘
    mul(num: number){
        const x = this.x * num;
        const y = this.y * num;
        const v = new Vector(new Point(0, 0), new Point(x, y));
        return v;
    }

    //向量与数相除
    divide(num: number){
        const x = this.x / num;
        const y = this.y / num;
        const v = new Vector(new Point(0, 0), new Point(x, y));
        return v;
    }

    //将向量转为Point
    get pointValue(){
        return new Point(this.x, this.y);
    }


    set point1(value: Point) {
        this._point1 = value;
        this.initialize();
    }

    set point2(value: Point) {
        this._point2 = value;
        this.initialize();
    }



    get mod(): number {
        return this._mod;
    }

}
