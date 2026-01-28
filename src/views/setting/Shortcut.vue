<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {useSettingStore} from "@/store/settingStore";
import {pWarning} from "@/util/pLoad";
import {Events} from "@/runtime";

// i18n
const {t} = useI18n();
const settingStore = useSettingStore()

// 过滤数据
const shortcut = ref('')

async function onShowHotkeyChange(key: string) {
  if (!key.includes("+") || key.length == 1) {
    pWarning(t("setting.shortcut.double"))
    return;
  }
  if (key === settingStore.sc_hide) {
    return;
  }

  // 注册快捷键
  const old = settingStore.sc_hide
  settingStore.setSc_hide(key)
  if (!settingStore.sc_switch) {
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
  shortcut.value = settingStore.sc_hide
})


</script>

<template>
  <MyLayout>
    <template #top>
      <el-space class="space">
        <div class="title">
          {{ $t("setting.shortcut.title") }}
        </div>
      </el-space>
    </template>
    <template #bottom>
      <el-row :gutter="20"
              style="margin-left: 0; margin-right: 0;">
        <el-col class="spark" :span="24">
          <div class="box">
            <ul class="info-list">
              <li style="height: 30px">
                <strong>
                  {{ $t('setting.shortcut.show') }} :
                </strong>
                <MyHotkeyInput v-model="shortcut" @change="onShowHotkeyChange"/>
              </li>
            </ul>
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

.box {
  border-radius: 8px;
  text-align: left;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  font-size: 18px;
  margin: 8px 0;
}
</style>
