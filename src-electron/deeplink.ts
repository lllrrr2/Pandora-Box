// 深度链接相关
import {showWindow} from "./tray";
import log from "./log";
import {app, BrowserWindow} from "electron";
import path from "node:path";

const DEEP_LINK_SCHEME = 'pandora-box';
const DEEP_LINK_HOST_INSTALL = 'install-config';
const DEEP_LINK_EVENT = 'import-profile-from-deeplink';
export const DEEP_LINK_READY_EVENT = 'deeplink-handler-ready';
let deepLinkHandlerReady = false;

const pendingDeepLinks: string[] = [];

function DeepLinkHandlerReady(status: boolean) {
    deepLinkHandlerReady = status
}

const isDeepLinkUrl = (arg: string | undefined): arg is string => {
    return typeof arg === 'string' && arg.startsWith(`${DEEP_LINK_SCHEME}://`);
};

function processPendingDeepLinks(mainWindow: BrowserWindow) {
    if (!mainWindow || mainWindow.isDestroyed() || !deepLinkHandlerReady) {
        return;
    }

    if (pendingDeepLinks.length === 0) {
        return;
    }

    const queue = pendingDeepLinks.splice(0, pendingDeepLinks.length);
    showWindow();

    for (const url of queue) {
        if (!url) {
            continue;
        }

        log.info('处理深度链接队列:', url);
        mainWindow.webContents.send(DEEP_LINK_EVENT, {rawUrl: url});
    }
}

const enqueueDeepLink = (url: string, mainWindow: BrowserWindow) => {
    pendingDeepLinks.push(url);
    processPendingDeepLinks(mainWindow);
};

function handleDeepLink(url: string, mainWindow: BrowserWindow) {
    const trimmed = url?.trim();
    if (!trimmed) {
        return;
    }

    try {
        const parsedUrl = new URL(trimmed);
        if (parsedUrl.protocol !== `${DEEP_LINK_SCHEME}:`) {
            return;
        }

        const host = parsedUrl.hostname || parsedUrl.host;
        if (host && host.toLowerCase() === DEEP_LINK_HOST_INSTALL) {
            log.info('收到深度链接:', trimmed);
            enqueueDeepLink(trimmed, mainWindow);
        } else {
            log.warn('未知深度链接:', trimmed);
        }
    } catch (error) {
        log.error('解析深度链接失败:', error);
    }
}

function registerDeepLink() {
    try {
        if (process.defaultApp && process.argv.length >= 2) {
            const exePath = process.execPath;
            const resolvedPath = path.resolve(process.argv[1]);
            app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME, exePath, [resolvedPath]);
        } else if (!app.isDefaultProtocolClient(DEEP_LINK_SCHEME)) {
            app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME);
        }
    } catch (error) {
        log.error('注册深度链接协议失败:', error);
    }
}

export function pushDeeplink(arg: any) {
    if (isDeepLinkUrl(arg)) {
        pendingDeepLinks.push(arg);
    }
}


export const deeplink = {
    DeepLinkHandlerReady,
    handleDeepLink,
    isDeepLinkUrl,
    processPendingDeepLinks,
    registerDeepLink,
    DEEP_LINK_READY_EVENT,
    pushDeeplink
};