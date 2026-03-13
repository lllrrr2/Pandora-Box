import {defineStore} from 'pinia';
import {defaultPersist} from "@/types/persist";

export const useShortcutStore = defineStore('shortcut', {
    state: () => ({
        sc_switch: false,
        sc_hide: 'Ctrl+W',
    }),
    actions: {
        setSc_switch(sc_switch: any) {
            this.sc_switch = sc_switch;
        },
        setSc_hide(sc_hide: any) {
            this.sc_hide = sc_hide;
        },
    },
    persist: defaultPersist,
});
