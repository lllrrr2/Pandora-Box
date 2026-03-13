<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {pWarning} from "@/util/pLoad";
import {Events} from "@/runtime";
import {useShortcutStore} from "@/store/shortcutStore";

// i18n
const {t} = useI18n();
const shortcutStore = useShortcutStore()

// 过滤数据
const shortcut = ref('')

async function onShowHotkeyChange(key: string) {
  if (!key.includes("+") || key.length == 1) {
    pWarning(t("shortcut.double"))
    return;
  }
  if (key === shortcutStore.sc_hide) {
    return;
  }

  // 注册快捷键
  const old = shortcutStore.sc_hide
  shortcutStore.setSc_hide(key)
  if (!shortcutStore.sc_switch) {
    return;
  }
  Events.Emit({
    name: "shortcut:register",
    data: {
      name: "showOrHide",
      old: old,
      key: key
    }
  })
}

onMounted(() => {
  shortcut.value = shortcutStore.sc_hide
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
              {{ $t('shortcut.show') }}
            </strong>
          </div>
        </el-col>
        <el-col :span="8">
          <span class="demonstration">{{ $t('shortcut.app') }}</span>
          <MyHotkeyInput v-model="shortcut" @change="onShowHotkeyChange"/>
        </el-col>
        <el-col :span="8">
          <span class="demonstration">{{ $t('shortcut.global') }}</span>
          <MyHotkeyInput v-model="shortcut" @change="onShowHotkeyChange"/>
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

</style>
