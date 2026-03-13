import {defineStore} from 'pinia';

export const useBarStore = defineStore('bar', {
    state: () => ({
        isMax: false,
    }),
    actions: {
        setMax(isMax: boolean) {
            this.isMax = isMax;
        },
    },
});
