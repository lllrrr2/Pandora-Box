import {app, BrowserWindow, ipcMain} from "electron";

export const AppName = "Pandora-Box"
export const AppBaseDir = "Pandora-Box-V3"

export const IsDev = !app.isPackaged

// --- IPC 消息收发 ---
export const sendMsg = (mainWindow: BrowserWindow, name: string, ...args: any[]) => {
    mainWindow?.webContents.send(`px_${name}`, ...args);
}
export const onMsg = (name: string, cb: (val: any) => void) => {
    ipcMain.on(`px_${name}`, (_e, val) => cb(val));
};