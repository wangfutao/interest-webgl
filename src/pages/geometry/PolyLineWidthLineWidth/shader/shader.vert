attribute vec2 a_point;  //顶点数据

uniform vec4 u_color;  //颜色
uniform vec2 u_resolution;  //画布分辨率
uniform mat3 u_transMat;  //变换矩阵

varying vec4 v_color;  //颜色

void main(){
    //矩阵变换
    vec3 point_v3 = u_transMat * vec3(a_point, 1.0);

    //将像素(px)坐标转为webgl的坐标 -1 ~ 1
    vec2 point = point_v3.xy / (u_resolution / 2.0);

    //顶点
    gl_Position = vec4(point, 0.0, 1.0);

    //颜色
    v_color = u_color / vec4(255.0, 255.0, 255.0, 1.0);
}
