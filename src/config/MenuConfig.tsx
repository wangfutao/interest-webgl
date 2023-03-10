import {MenuGroup} from "../interface/MenuGroup";
import {PolyLineWidthLineWidth} from "../pages/geometry/PolyLineWidthLineWidth/PolyLineWidthLineWidth";

export const MenuGroups: MenuGroup[] = [
    {
        name: '几何',
        path: '/geometry',
        menus: [
            {
                name: '绘制带宽度的线',
                path: '/PolyLineWidthLineWidth',
                element: <PolyLineWidthLineWidth />
            },
        ]
    }
]
