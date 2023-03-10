import React, {Component} from 'react';
import './App.css';
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import {Button, Divider} from "antd";
import {MenuGroups} from './config/MenuConfig';
import {Outlet} from 'react-router-dom';


interface AppState {
    currentRoute: string;
    isFold: boolean;
}

export default class App extends Component<any, AppState> {

    state: AppState = {
        currentRoute: window.location.pathname,
        isFold: false
    }

    constructor(props: any) {
        super(props);
        let isFoldStr = localStorage.getItem('isFold');
        this.state.isFold = isFoldStr == 'true'
        if (this.state.currentRoute == '/'){
            window.location.href = '/geometry/PolyLineWidthLineWidth'
        }
    }

    navigate(path: string) {
        window.location.href = path;
    }

    fold() {
        this.setState({
            isFold: !this.state.isFold
        }, ()=>{
            localStorage.setItem('isFold', this.state.isFold + '');
        })
    }

    get MenusEL() {
        let arr = [];
        for (let menuGroup of MenuGroups) {
            arr.push(<React.Fragment key={menuGroup.path}>
                <div className="menu-group">{menuGroup.name}</div>
                <Divider style={{margin: '10px 0'}}/>
            </React.Fragment>)

            let menus = menuGroup.menus;
            for (let menu of menus) {
                let path = menuGroup.path + menu.path;
                let className = "menu-item";
                if (this.state.currentRoute == path) className = "menu-item active";
                arr.push(<React.Fragment key={path}>
                    <div
                        className={className}
                        onClick={this.navigate.bind(this, path)}
                    >{menu.name}</div>
                </React.Fragment>)
            }
        }
        return arr;
    }

    render() {
        return <>
            <div className="App">
                <div className={this.state.isFold ? 'nav folded' : 'nav'}>
                    <div className="fold-btn">
                        <Button type={'link'} onClick={this.fold.bind(this)}>
                            {
                                this.state.isFold ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>
                            }

                        </Button>
                    </div>
                    <div className="menus-container">
                        {this.MenusEL}
                    </div>
                </div>
                <div className="content">
                    <Outlet/>
                </div>
            </div>
        </>
    }

}

