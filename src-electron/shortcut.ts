import {app, BrowserWindow, globalShortcut} from 'electron'
import {onMsg, sendMsg} from "./common";

// 快捷键功能
const scs = {
    "showOrHide": showOrHide
}

function replaceCtrlCmd(key: string) {
    return key.replaceAll("Ctrl", "CommandOrControl").replaceAll("Cmd", "CommandOrControl")
}

function registerOne(acc: any, mainWindow: BrowserWindow | null): void {
    // @ts-ignore
    if (!scs[acc.name]) {
        return
    }
    if (acc.old) {
        globalShortcut.unregister(replaceCtrlCmd(acc.old))
    }
    globalShortcut.unregister(replaceCtrlCmd(acc.key))
    // @ts-ignore
    sendMsg(mainWindow, "shortcut:result", globalShortcut.register(replaceCtrlCmd(acc.key), () => scs[acc.name](mainWindow)))
}


// 初始化快捷键
export function initShortcut(mainWindow: BrowserWindow) {
    onMsg('shortcut:register', async (acc) => {
        return registerOne(acc, mainWindow)
    })

    onMsg('shortcut:unregister-all', async () => {
        globalShortcut.unregisterAll()
        return true
    })
}


function showOrHide(mainWindow: BrowserWindow) {
    if (!mainWindow.isVisible() || !mainWindow.isFocused()) {
        mainWindow?.show();
        mainWindow?.focus();
        app.dock?.show();
    }
}