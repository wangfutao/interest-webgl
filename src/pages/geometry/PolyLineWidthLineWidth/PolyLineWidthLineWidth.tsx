import {Component} from "react";
import './PolyLineWidthLineWidth.css'
import vertSource from "./shader/shader.vert?raw";
import fragSource from "./shader/shader.frag?raw";
import {Triangle} from "../../../libs/geometry/Triangle";
import {Point} from "../../../libs/geometry/Point";
import {PolyLine} from "../../../libs/geometry/PolyLine";

export class PolyLineWidthLineWidth extends Component {

    //canvas的宽高
    width: number = 800;
    height: number = 600;
    canvas: HTMLCanvasElement | null = null;
    gl?: WebGLRenderingContext;
    a_pointLoc?: GLint;  //顶点变量
    u_colorLoc: WebGLUniformLocation | null = null;  //颜色变量
    u_resolutionLoc: WebGLUniformLocation | null = null;  //分辨率变量 即canvas的宽高
    u_transMatLoc: WebGLUniformLocation | null = null;    //变换矩阵变量

    //变换矩阵
    transformMatrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1];

    //动画定时器
    timer = 0;

    //线段数据以及其buffer，用它来绘制sin函数图
    lineData: Triangle[] = []
    lineBuffer: WebGLBuffer | null = null;

    //参考线段数据以及其buffer，用它来绘制sin函数图中间的那根细线，使用LINES绘制，用来跟三角形绘制最对比
    refLineData: Point[] = []
    refLineBuffer: WebGLBuffer | null = null;

    //直角坐标系以及其buffer
    axisData: Point[] = []
    axisBuffer: WebGLBuffer | null = null;

    //线段数据
    _coors: Point[] = [];
    get coors(): Point[] {
        if (this._coors.length > 0) {
            return this._coors;
        }
        //canvas的宽高的一半，下面缩放sin函数图用，不然sin值最大为1，在图里不方便开
        let w = this.width / 2;
        let h = this.height / 2;

        //生成一段sin函数线条上的坐标，每间隔1px生成一个点
        for (let x = -w * 3; x <= w * 3; x += 1) {
            let y = Math.sin(x / 80) * h / 1.5;
            this._coors.push(new Point(x, y));
        }
        return this._coors;
    }

    componentDidMount() {
        //初始化webgl，创建program，获取着色器变量
        this.initWebgl();

        //给坐标轴、线段、参考线设置buffer
        this.setAxisBuffer();
        this.setLineBuffer();
        this.setRefLineBuffer();

        const w = this.width / 2;  //用于判断平移出屏幕后需要反向平移
        let increment = 1;  //动画中每次平移的量

        let fn = () => {
            //绘制坐标轴
            this.drawAxis();

            //修改变换矩阵，以向右/左平移
            this.transformMatrix[6] += increment;
            //移出屏幕后反向
            if (this.transformMatrix[6] > w * 2 || this.transformMatrix[6] < -w * 2) {
                increment = -increment;
            }
            //将变换矩阵传输给着色器
            this.setTransform();
            //绘制线段
            this.drawLine();
            //绘制参考线
            this.drawRefLine();

            //开启下一帧动画
            this.timer = requestAnimationFrame(fn);
        }

        fn();
    }

    //组件销毁时需要关闭定时器
    componentWillUnmount() {
        cancelAnimationFrame(this.timer)
    }

    //将变换矩阵传输给着色器
    setTransform() {
        if (!this.gl) throw 'gl is null';
        this.gl.uniformMatrix3fv(this.u_transMatLoc, false, this.transformMatrix)
    }

    //给线段设置buffer
    setLineBuffer() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';
        if (!this.gl) throw 'gl is null';
        const gl = this.gl;

        const buffer = gl.createBuffer();
        this.lineBuffer = buffer;


        const coors: Point[] = this.coors; //获取点数组

        //创建polyline对象
        const polyline = new PolyLine(coors, 50);
        //将线段数据三角化
        this.lineData = polyline.triangulation();

        //将三角化后的数据转为坐标数组，用于给gpu绘制
        const array = [];
        for (let tri of this.lineData) {
            array.push(
                tri.A.x, tri.A.y,
                tri.B.x, tri.B.y,
                tri.C.x, tri.C.y,
            )
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);

    }

    //给参考线设置buffer
    setRefLineBuffer() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';
        if (!this.gl) throw 'gl is null';
        const gl = this.gl;

        const buffer = gl.createBuffer();
        this.refLineBuffer = buffer;


        const coors: Point[] = this.coors;

        this.refLineData = coors;

        //这里不用三角化，后面使用LINE_STRIP绘制
        const array = [];
        for (let coor of coors) {
            array.push(coor.x, coor.y)
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);

    }

    //给坐标轴设置buffer
    setAxisBuffer() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';
        if (!this.gl) throw 'gl is null';
        const gl = this.gl;

        const buffer = gl.createBuffer();
        this.axisBuffer = buffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);


        const coors = [
            -this.width / 2, 0,
            this.width / 2, 0,
            0, -this.height / 2,
            0, this.height / 2
        ]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coors), gl.STATIC_DRAW);

    }

    //绘制线段
    drawLine() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';
        if (!this.gl) throw 'gl is null';
        const gl = this.gl;


        //设置颜色
        gl.uniform4f(this.u_colorLoc, 53, 159, 244, 1);

        //传输顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
        gl.vertexAttribPointer(this.a_pointLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_pointLoc);

        //使用三角形绘制
        gl.drawArrays(gl.TRIANGLES, 0, this.lineData.length * 3);
    }

    //绘制参考线
    drawRefLine() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';
        if (!this.gl) throw 'gl is null';
        const gl = this.gl;

        //设置颜色
        gl.uniform4f(this.u_colorLoc, 0, 0, 0, 1);

        //传输顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this.refLineBuffer);
        gl.vertexAttribPointer(this.a_pointLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_pointLoc);

        //使用线条绘制
        gl.drawArrays(gl.LINE_STRIP, 0, this.refLineData.length);
    }

    //绘制坐标轴
    drawAxis() {
        if (this.a_pointLoc == undefined) throw 'a_pointLoc is null';

        if (!this.gl) throw 'gl is null';
        const gl = this.gl;

        //设置颜色
        gl.uniform4f(this.u_colorLoc, 200, 200, 200, 1);
        //变换矩阵，因为坐标轴需要显示到中间不动，所以绘制坐标轴不需要变换，坐标轴绘制完毕后再对后续的绘制进行变换
        gl.uniformMatrix3fv(this.u_transMatLoc, false, [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1])

        //传输顶点数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this.axisBuffer);
        gl.vertexAttribPointer(this.a_pointLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_pointLoc);

        //使用线条绘制
        gl.drawArrays(gl.LINES, 0, 4);

    }


    //初始化webgl
    initWebgl() {
        const canvas = this.canvas as HTMLCanvasElement;
        const style = getComputedStyle(canvas);
        const ratio = window.devicePixelRatio;
        canvas.width = parseInt(style.width) * ratio;
        canvas.height = parseInt(style.height) * ratio;
        this.width = canvas.width;
        this.height = canvas.height;
        const gl = canvas.getContext('webgl');
        if (!gl) throw 'gl is null';

        this.gl = gl;

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        const program = this.getProgram(gl, vertSource, fragSource);

        gl.linkProgram(program);
        gl.useProgram(program);

        const a_pointLoc = gl.getAttribLocation(program, 'a_point');
        this.a_pointLoc = a_pointLoc;


        const u_colorLoc = gl.getUniformLocation(program, 'u_color');
        this.u_colorLoc = u_colorLoc;

        const u_transMatLoc = gl.getUniformLocation(program, 'u_transMat');
        this.u_transMatLoc = u_transMatLoc;


        const u_resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
        this.u_resolutionLoc = u_resolutionLoc;
        gl.uniform2f(u_resolutionLoc, canvas.width, canvas.height);
    }

    //编译着色器
    getProgram(gl: WebGLRenderingContext, vertSource: string, fragSource: string): WebGLProgram {
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertShader) throw '';
        gl.shaderSource(vertShader, vertSource);
        gl.compileShader(vertShader);

        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragShader) throw '';
        gl.shaderSource(fragShader, fragSource);
        gl.compileShader(fragShader);

        const program = gl.createProgram();
        if (!program) throw '';
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);

        return program;

    }

    render() {
        return (
            <div className="container">
                <canvas ref={canvas => this.canvas = canvas}/>
            </div>
        );
    }
}
