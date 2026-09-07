import {app, BrowserWindow, dialog} from 'electron';
import {storeGet, storeSet} from "./store";

interface SelectDirectoryOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    multiSelections?: boolean;
}

/**
 * 高性能文件夹选择器（带上次路径缓存）
 * - 自动记住上次选择的路径，下次默认打开该路径
 * - 异步、非阻塞
 * - 支持多选
 *
 * @param parentWindow - 主窗口实例（推荐传入）
 * @param options - 配置
 * @returns 选择的路径数组（取消/出错时返回空数组）
 */
export async function selectDirectory(
    parentWindow: BrowserWindow | null = null,
    options: SelectDirectoryOptions = {}
): Promise<string[]> {
    const {
        title = '请选择文件夹',
        buttonLabel,
        multiSelections = false,
    } = options;

    // 从缓存读取上次路径，作为默认打开位置
    let defaultPath: any = options.defaultPath ?? storeGet('lastSelectedDirectory');

    // 如果缓存路径不存在或无效，fallback 到系统文档目录
    if (!defaultPath) {
        defaultPath = app.getPath('documents');
    }

    const properties: Electron.OpenDialogSyncOptions['properties'] = [
        'openDirectory',
        'createDirectory',
    ];

    if (multiSelections) {
        properties.push('multiSelections');
    }

    try {
        const result = await dialog.showOpenDialog(parentWindow, {
            title,
            defaultPath,
            buttonLabel,
            properties,
        });

        if (result.canceled || !result.filePaths.length) {
            return [];
        }

        // 更新缓存：记住最后一个选择的路径（单选时就是唯一路径，多选取第一个）
        const selectedPath = result.filePaths[0];
        storeSet('lastSelectedDirectory', selectedPath);

        return result.filePaths;
    } catch (err) {
        console.error('[directorySelector] 选择文件夹失败:', err);
        return [];
    }
}