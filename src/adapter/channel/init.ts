import { slog } from "../../slog";
import { SelectChannelEvent } from "../../view/datatypes";
import getAdapter from "../adapter";


export function initChannels() {
    document.addEventListener("channelSelected",
    function(evt: CustomEvent<SelectChannelEvent>) {
        slog.info("initChannels", ["Channel Selected", `${evt.detail.name}`]);
        getAdapter().setOpenChannel(evt.detail.name);
    });
}