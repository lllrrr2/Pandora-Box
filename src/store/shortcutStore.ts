import {defineStore} from 'pinia';
import {defaultPersist} from "@/types/persist";

export const useShortcutStore = defineStore('shortcut', {
    state: () => ({
        appSwitch: false,
        globalSwitch: false,
        appHide:'Ctrl+W',
        globalShow: 'Ctrl+Shift+W',
    }),
    persist: defaultPersist,
});
