<script setup lang="ts">
import createApi from "@/api";
import {pError, pLoad, pSuccess} from "@/util/pLoad";
import {isHttpOrHttps} from "@/util/format";
import {Profile} from "@/types/profile";
import {useI18n} from "vue-i18n";

const {t} = useI18n();

// 获取当前 Vue 实例的 proxy 对象
const {proxy} = getCurrentInstance()!;
const api = createApi(proxy);

const DEEP_LINK_IMPORTED_EVENT = 'deeplink-profile-imported';
const DEEP_LINK_HOST = 'install-config';
const KNOWN_DEEP_LINK_EXTRA_KEYS = new Set(['name']);


type DeepLinkPayload = string | { rawUrl?: string; url?: string; name?: string };

function setupDeepLinkHandler() {

  const ensureDeepLinkReady = () => {
    try {
      window.pxDeepLink.notifyReady();
    } catch (error) {
      console.error('Failed to notify deeplink readiness', error);
    }
  };

  const importProfileFromDeepLink = async (payload: DeepLinkPayload) => {
    const normalized = normalizeDeepLinkPayload(payload);
    const parsed = normalized.rawUrl ? parseDeepLinkUrl(normalized.rawUrl) : null;
    const subscriptionUrl = parsed?.url ?? normalized.directUrl;
    const profileName = normalized.name ?? parsed?.name;

    if (!subscriptionUrl) {
      pError(t('profiles.deeplink.invalid-url'));
      return;
    }

    if (!isHttpOrHttps(subscriptionUrl)) {
      pError(t('profiles.deeplink.invalid-url-format'));
      return;
    }

    const profile = new Profile();
    profile.content = subscriptionUrl;
    if (profileName) {
      profile.title = profileName;
    }

    try {
      await pLoad(t('profiles.deeplink.importing'), async () => {
        const result = await api.addProfileFromInput(profile);
        if (Array.isArray(result) && result.length > 0) {
          window.dispatchEvent(new CustomEvent(DEEP_LINK_IMPORTED_EVENT, {
            detail: {profiles: result}
          }));
        }
      });
      pSuccess(t('profiles.deeplink.import-success'));
    } catch (error: any) {
      if (error && typeof error === 'object' && 'message' in error && error.message) {
        pError(error.message);
      } else {
        pError(t('profiles.deeplink.import-failed'));
      }
    }
  };

  window.pxDeepLink.onImportProfile(importProfileFromDeepLink);

  const handleWindowFocus = () => ensureDeepLinkReady();
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      ensureDeepLinkReady();
    }
  };

  window.addEventListener('focus', handleWindowFocus);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  ensureDeepLinkReady();
}

function normalizeDeepLinkPayload(payload: DeepLinkPayload): { rawUrl?: string; directUrl?: string; name?: string } {
  if (typeof payload === 'string') {
    return {rawUrl: payload};
  }

  if (typeof payload === 'object') {
    return {
      rawUrl: payload.rawUrl,
      directUrl: payload.url,
      name: payload.name,
    };
  }

  return {};
}

function parseDeepLinkUrl(link: string): { url: string; name?: string } | null {
  try {
    const parsed = new URL(link);
    if (parsed.protocol !== 'pandora-box:') {
      return null;
    }

    const host = parsed.hostname || parsed.host;
    if (host && host.toLowerCase() !== DEEP_LINK_HOST) {
      return null;
    }

    const query = parsed.search.startsWith('?') ? parsed.search.slice(1) : '';
    if (!query) {
      return null;
    }

    const segments = query.split('&');
    let urlValue: string | null = null;
    const extras: Record<string, string> = {};

    for (const segment of segments) {
      if (!segment) {
        continue;
      }

      const [rawKey, ...rawRest] = segment.split('=');
      const key = rawKey;
      const value = rawRest.join('=');

      if (key === 'url' && urlValue === null) {
        urlValue = value;
        continue;
      }

      if (urlValue !== null && KNOWN_DEEP_LINK_EXTRA_KEYS.has(key)) {
        extras[key] = safeDecode(value);
      }
    }

    if (!urlValue) {
      return null;
    }

    const decodedUrl = safeDecode(urlValue);
    if (!decodedUrl) {
      return null;
    }

    return {
      url: decodedUrl,
      name: extras['name'],
    };
  } catch {
    return null;
  }
}

function safeDecode(value?: string) {
  if (value === undefined) {
    return undefined;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

onMounted(setupDeepLinkHandler)
</script>