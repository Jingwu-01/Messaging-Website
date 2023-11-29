import { ModelChannel } from "../../model/channel";
import { slog } from "../../slog";
import { ViewChannel } from "../../view/datatypes";

export default function modelToViewChannels(
  modelChannels: Map<string, ModelChannel>
) {
  let viewChannelArr = new Array<ViewChannel>();
  modelChannels.forEach((modelChannel) => {
    slog.info("displayViewChannels", [
      "viewChannel name",
      modelChannel.getName(),
    ]);
    viewChannelArr.push({
      name: modelChannel.getName(),
    });
  });
  return viewChannelArr;
}
