<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {pWarning} from "@/util/pLoad";
import {Events} from "@/runtime";
import {useShortcutStore} from "@/store/shortcutStore";
import {useShortcut} from "@/util/useShortcut";

// i18n
const {t} = useI18n();
const shortcutStore = useShortcutStore()

// 页面快捷键
const {registerShortcut, unbindShortcut, clearShortcut} = useShortcut();

// 空数据
const nullData = ref(t('shortcut.null'))

// 过滤数据
const appHide = ref('')
const globalShow = ref('')

async function onAppHideChange(key: string) {
  if (!key.includes("+") || key.length == 1) {
    pWarning(t("shortcut.double"))
    return;
  }
  if (key === shortcutStore.appHide) {
    return;
  }

  // 注册快捷键
  const old = shortcutStore.appHide
  shortcutStore.appHide = key
  if (!shortcutStore.appSwitch) {
    return;
  }
  // 解绑旧的快捷键
  unbindShortcut(old)
  // 绑定新的快捷键
  registerShortcut(shortcutStore.appHide, () => {
    Events.Emit({name: "hide", data: true});
  })
}

async function onGlobalShowChange(key: string) {
  if (!key.includes("+") || key.length == 1) {
    pWarning(t("shortcut.double"))
    return;
  }

  if (key.split("+").length < 3) {
    pWarning(t("shortcut.three"))
    return;
  }


  if (key === shortcutStore.globalShow) {
    return;
  }

  // 注册快捷键
  const old = shortcutStore.globalShow
  shortcutStore.globalShow = key
  if (!shortcutStore.globalSwitch) {
    return;
  }
  Events.Emit({
    name: "shortcut:register",
    data: {
      name: "showOrHide",
      type: "global",
      old: old,
      key: key
    }
  })
}

onMounted(() => {
  appHide.value = shortcutStore.appHide
  globalShow.value = shortcutStore.globalShow
})

watch(
    () => shortcutStore.appSwitch,
    (newVal) => {
      if (newVal) {
        registerShortcut(shortcutStore.appHide, () => {
          Events.Emit({name: "hide", data: true});
        })
      } else {
        clearShortcut()
      }
    })


</script>

<template>
  <MyLayout>
    <template #top>
      <el-space class="space">
        <div class="title">
          {{ $t("shortcut.title") }}
        </div>
      </el-space>
    </template>
    <template #bottom>
      <el-row :gutter="20" class="spark"
              style="margin-left: 0; margin-right: 0;">
        <el-col :span="6">
          <span class="demonstration">{{ $t('shortcut.describe') }}</span>
          <div class="dTitle">
            <strong>
              {{ $t('shortcut.hide') }}
            </strong>
          </div>
        </el-col>
        <el-col :span="8">
          <span class="demonstration">{{ $t('shortcut.app.title') }}</span>
          <MyHotkeyInput v-model="appHide" @change="onAppHideChange"/>
        </el-col>
        <el-col :span="8">
          <span class="demonstration">{{ $t('shortcut.global.title') }}</span>
          <MyHotkeyInput v-model="nullData" :disabled="true"/>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="spark"
              style="margin-left: 0; margin-right: 0;margin-top: 15px">
        <el-col :span="6">
          <div class="dTitle">
            <strong>
              {{ $t('shortcut.show') }}
            </strong>
          </div>
        </el-col>
        <el-col :span="8">
          <MyHotkeyInput v-model="nullData" :disabled="true"/>
        </el-col>
        <el-col :span="8">
          <MyHotkeyInput v-model="globalShow" @change="onGlobalShowChange"/>
        </el-col>
      </el-row>


      <el-row :gutter="20" class="spark"
              style="margin-left: 0; margin-right: 0;margin-top: 15px">
        <el-col>
          <div class="dTitle">
            <strong>
              {{ $t('shortcut.app.on') }}
            </strong>
            <el-switch
                v-model="shortcutStore.appSwitch"
                class="set-switch"
                style="margin-left: 28px"
            />
          </div>
          <div class="dTitle">
            <strong>
              {{ $t('shortcut.global.on') }}
            </strong>
            <el-switch
                v-model="shortcutStore.globalSwitch"
                class="set-switch"
                style="margin-left: 28px"
            />
          </div>
        </el-col>
      </el-row>
    </template>
  </MyLayout>
</template>

<style scoped>
.space {
  margin-top: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-left: 10px;
}

.spark {
  max-width: 95%;
}

.demonstration {
  display: block;
  color: var(--text-color);
  opacity: 0.3;
  font-size: 14px;
  margin-bottom: 20px;
}

.dTitle {
  font-size: 18px;
  padding-top: 6px;
}

.set-switch {
  margin-left: 10px;
  --el-switch-border-color: var(--text-color);
  --el-switch-on-color: var(--left-item-selected-bg);
  --el-switch-off-color: transparent;
}

:deep(.el-switch__core) {
  width: 46px;
  height: 26px;
  border-radius: 12px;
  border: 2px solid var(--text-color);
}

:deep(.el-switch__core .el-switch__action) {
  margin-left: 2px;
  background-color: var(--text-color);
}

:deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
  left: calc(100% - 21px);
}

</style>
