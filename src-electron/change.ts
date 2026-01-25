import fs from "fs-extra";
import log from './log';
import {storeSet} from "./store";
import {reStartServer, storeInfo} from "./server";
import {startBackend} from "./admin";
import {app, BrowserWindow} from "electron";
import path from "path";

export async function doChange(mainWindow: BrowserWindow, data: string) {
    try {
        // 进行目录迁移
        let destDir = data
        if (!data.endsWith("Pandora-Box-V3")) {
            destDir = path.join(data, 'Pandora-Box-V3');
            await fs.move(log.getAppConfigDir(), destDir, {overwrite: true});
            console.log('目录移动成功！新路径：', destDir);
        }
        // 进行重启前准备
        // 前端日志设置
        storeSet("appConfigDir", path.dirname(destDir))
        log.initLog()
        // 重启后端
        // 等待 backend 传来的 port 和 secret
        let resolveReady: () => void;
        const waitForReady = new Promise<void>((resolve) => {
            resolveReady = resolve;
        });
        // 启动前端静态服务
        reStartServer(resolveReady, startBackend)
        // 等待后端启动
        await waitForReady;

        // 是否在开发模式
        const isDev = !app.isPackaged;
        // 页面加载
        const filePath = isDev
            ? `http://localhost:5173?port=${storeInfo.port()}&secret=${storeInfo.secret()}`
            : `http://${storeInfo.listenAddr()}/index.html?port=${storeInfo.port()}&secret=${storeInfo.secret()}`;

        log.info('准备重新加载页面');
        mainWindow.loadURL(filePath).catch((err) => {
            log.error('重新加载页面失败:', err);
        });
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.error('目标路径已存在，请先删除或设置 overwrite: true');
        } else {
            console.error('移动失败：', err);
        }
    }
}