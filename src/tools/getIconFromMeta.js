import colorToIcon from "./colorToIcon";

const getIconFromMeta = (meta) => {
  let result = '';
  if (meta.icon64) {
    result = meta.icon64;
  } else
  if (meta.icon) {
    result = meta.icon;
  }
  return colorToIcon(result);
};

export default getIconFromMeta;