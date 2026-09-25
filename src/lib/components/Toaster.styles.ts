import { TOAST_ITEM_WIDTH } from "./ToastItem.styles";
import { scaled } from "../scale";
export const EXTRA_LIFT = 70;
const EDGE_MARGIN = 24;

export const STYLE_KEY = "toaster";
export const STYLE_CSS = `
.sandwich-toast-announcements {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.sandwich-toaster {

  position: fixed;
  width: ${scaled(TOAST_ITEM_WIDTH)};
  z-index: 2147483647;
}
.sandwich-toaster--top {
  top: ${EDGE_MARGIN}px;
}
.sandwich-toaster--bottom {
  bottom: ${EDGE_MARGIN}px;
}
.sandwich-toaster--left {
  left: ${EDGE_MARGIN}px;
}
.sandwich-toaster--center {
  left: 50%;
  transform: translateX(-50%);
}
.sandwich-toaster--right {
  right: ${EDGE_MARGIN}px;
}
`;
