import postDisplayComponentInit from "./components/pages/chatPage/postDisplayComponent/init";
import postComponentInit from "./components/pages/chatPage/postComponent/init";

export default function initView() {
  postDisplayComponentInit();
  postComponentInit();
}