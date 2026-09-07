import Mousetrap from 'mousetrap';

/**
 * 1. Mousetrap 兼容性转换函数
 * 将 "Ctrl+S" 或 "Cmd+D" 转换为 Mousetrap 识别的 "ctrl+s" 或 "command+d"
 * 建议：将 Ctrl 和 Cmd 统一映射为 'mod' 以实现真正的跨平台
 */
function toMousetrapFormat(keyString: string): string {
    return keyString
        .split('+')
        .map((part) => {
            const lowerPart = part.trim().toLowerCase();
            switch (lowerPart) {
                case 'cmd':
                    return 'command'; // 或使用 'mod'
                case 'ctrl':
                    return 'ctrl';    // 或使用 'mod'
                default:
                    return lowerPart;
            }
        })
        .join('+');
}

// 记录当前组件注册的所有键位，用于统一卸载
const registeredKeys = new Set<string>();

/**
 * 2. Vue 3 组合式 Hook
 */
export function useShortcut() {

    /**
     * 注册快捷键
     * @param displayKey 字符串格式，如 "Ctrl+S" 或 "Cmd+Shift+P"
     * @param callback 回调函数
     */
    const registerShortcut = (
        displayKey: string,
        callback: (e: KeyboardEvent, combo: string) => void
    ) => {
        const mousetrapKey = toMousetrapFormat(displayKey);

        Mousetrap.bind(mousetrapKey, (e, combo) => {
            callback(e as KeyboardEvent, combo);
        });

        registeredKeys.add(mousetrapKey);

        // 返回当前按键的独立解绑函数
        return () => unbindShortcut(displayKey);
    };

    /**
     * 手动解绑快捷键
     */
    const unbindShortcut = (displayKey: string) => {
        const mousetrapKey = toMousetrapFormat(displayKey);
        Mousetrap.unbind(mousetrapKey);
        registeredKeys.delete(mousetrapKey);
    };

    /**
     * 清除所有快捷键
     */
    const clearShortcut = () => {
        registeredKeys.forEach((key) => Mousetrap.unbind(key));
        registeredKeys.clear();
    }

    return {
        registerShortcut,
        unbindShortcut,
        clearShortcut
    };
}