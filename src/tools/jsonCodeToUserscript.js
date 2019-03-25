import convertCodeV1toV2 from "./convertCodeV1toV2";
import convertCodeV2toV3 from "./convertCodeV2toV3";
import jsonToUserscript from "./jsonToUserscript";

const jsonCodeToUserscript = (text) => {
  let json = JSON.parse(text);

  if (json.version === 1) {
    json = convertCodeV1toV2(json);
  }

  if (json.version === 2) {
    json = convertCodeV2toV3(json);
  }

  return jsonToUserscript(json);
};

export default jsonCodeToUserscript;