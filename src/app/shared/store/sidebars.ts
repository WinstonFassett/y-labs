import { toggleStore } from "./toggle"

export const $showRightSidebar = toggleStore(false)
export const $showLeftSidebar = toggleStore()