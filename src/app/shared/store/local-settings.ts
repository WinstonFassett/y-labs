import { storeKey } from "@/lib/nanostores-utils/storeKey";
import { map, onMount } from "nanostores";

const LOCAL_SETTINGS_KEY = "local-settings";

export const $localSettings = map({
  trackHistoryWhenEditing: false
})

onMount($localSettings, () => {
  const savedSettings = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (savedSettings) {
    $localSettings.set(JSON.parse(savedSettings));
    console.log('loaded settings', $localSettings.get());
  }  
  return $localSettings.subscribe((settings) => {
    console.log('saving settings', settings);
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  })  
})

export const $trackHistoryWhenEditing = storeKey($localSettings, "trackHistoryWhenEditing");