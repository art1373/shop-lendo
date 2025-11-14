import philipsHue from "@/assets/products/philips-hue.jpg";
import ikeaTradfri from "@/assets/products/ikea-tradfri.jpg";
import ps4 from "@/assets/products/ps4.jpg";
import nintendoSwitch from "@/assets/products/nintendo-switch.jpg";
import jblSpeaker from "@/assets/products/jbl-speaker.jpg";
import marshallSpeaker from "@/assets/products/marshall-speaker.jpg";

export const productImages: Record<number, string> = {
  1: philipsHue,
  2: ikeaTradfri,
  3: ps4,
  4: nintendoSwitch,
  5: jblSpeaker,
  6: marshallSpeaker,
};

export const getProductImage = (productId: number): string => {
  return productImages[productId] || philipsHue;
};
