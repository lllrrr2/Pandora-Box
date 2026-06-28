import {BrowserWindow, Menu, MenuItemConstructorOptions} from 'electron';
import {AppName, IsDev} from "./common";

/**
 * 构建并设置应用顶部菜单
 */
export const initMenu = (mainWindow: BrowserWindow, customTemplate?: MenuItemConstructorOptions[]) => {
    if (process.platform !== 'darwin') return;

    const defaultTemplate: MenuItemConstructorOptions[] = [
        {
            label: AppName,
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'Cmd+Q',
                    click: () => mainWindow?.webContents.send('px_readyToQuit')
                }
            ]
        },
        {label: 'Edit', role: 'editMenu'}
    ];

    const template = customTemplate || defaultTemplate;

    if (IsDev) {
        template.push({
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'}
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};