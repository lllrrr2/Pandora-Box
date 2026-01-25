import Store from 'electron-store';
import path from "path";
import {app, ipcMain} from "electron";

// electron 用户默认目录
const userDataDir = app.getPath('userData')

let store: Store

// 初始化数据库
export function initStore() {
    store = new Store({
        cwd: path.join(userDataDir, 'px-electron.db')
    });

    ipcMain.handle('store:get', (event, key) => {
        return store.get(key);
    });

    ipcMain.handle('store:set', (event, key, value) => {
        store.set(key, value);
    });
}

// 从数据库获取数据
export const storeGet = (key: string) => {
    if (store) {
        return store.get(key);
    } else {
        return undefined;
    }
}

// 往数据库存储数据
export const storeSet = (key: string, value: any) => {
    if (store) {
        store.set(key, value);
    }
}