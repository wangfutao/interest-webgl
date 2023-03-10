import {Point} from "./Point";

export class Triangle{
    private _A: Point;
    private _B: Point;
    private _C: Point;

    constructor(A: Point, B: Point, C: Point) {
        this._A = A;
        this._B = B;
        this._C = C;
    }


    get A(): Point {
        return this._A;
    }

    get B(): Point {
        return this._B;
    }

    get C(): Point {
        return this._C;
    }
}
