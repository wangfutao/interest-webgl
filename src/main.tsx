import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import {
    createBrowserRouter,
    RouterProvider,RouteObject
} from "react-router-dom";
import {MenuGroups} from "./config/MenuConfig";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

let routerItems: RouteObject[] = [

];
for (let menuGroup of MenuGroups) {
    let parentPath = menuGroup.path;
    for (let menu of menuGroup.menus) {
        routerItems.push({
            path: parentPath + menu.path,
            element: menu.element,
        })
    }
}

const  router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: routerItems
    }
]);

root.render(
    <React.StrictMode>
        {/*<App />*/}
        <RouterProvider router={router} />
    </React.StrictMode>
);
