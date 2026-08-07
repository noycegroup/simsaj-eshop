export type DiawinWorkingProduct = {
  model: string;
  price: number;
  currency: "EUR";
  image: string;
  sourceUrl: string;
  checkedAt: string;
};

const checkedAt = "2026-08-07";

export const diawinWorkingCatalog: Record<string, DiawinWorkingProduct> = {
  "Snowy Rose": { model: "AF14", price: 109, currency: "EUR", image: "/products/diawin/af14-snowy-rose.jpg", sourceUrl: "https://d-wide.com/products/snowy-rose", checkedAt },
  "Midnight Tulip": { model: "AF16", price: 109, currency: "EUR", image: "/products/diawin/af16-midnight-tulip.jpg", sourceUrl: "https://d-wide.com/products/midnight-tulip", checkedAt },
  "Cloudy Orchid": { model: "AF17", price: 109, currency: "EUR", image: "/products/diawin/af17-cloudy-orchid.jpg", sourceUrl: "https://d-wide.com/products/cloudy-orchid", checkedAt },
  "Soft Drift": { model: "AF28", price: 75, currency: "EUR", image: "/products/diawin/af28-soft-drift.jpg", sourceUrl: "https://www.zdravmat.sk/sk/", checkedAt },
  "Morning Blue": { model: "AM18", price: 109, currency: "EUR", image: "/products/diawin/am18-morning-blue.jpg", sourceUrl: "https://d-wide.com/products/morning-blue", checkedAt },
  "Refreshing Black": { model: "AM19", price: 109, currency: "EUR", image: "/products/diawin/am19-refreshing-black.jpg", sourceUrl: "https://d-wide.com/products/refreshing-black", checkedAt },
  "Deep Motion": { model: "AM27", price: 75, currency: "EUR", image: "/products/diawin/am27-deep-motion.jpg", sourceUrl: "https://www.zdravmat.sk/sk/", checkedAt },
  "White Flow": { model: "AM29", price: 75, currency: "EUR", image: "/products/diawin/am29-white-flow.jpg", sourceUrl: "https://www.medfeet.cz/diawin-unisex-volnocasova-obuv-white-flow-white/", checkedAt },
  "Smooth Jazz": { model: "AM30", price: 119, currency: "EUR", image: "/products/diawin/am30-smooth-jazz.jpg", sourceUrl: "https://d-wide.com/products/smooth-jazz", checkedAt },
  Ethereal: { model: "FM40", price: 140, currency: "EUR", image: "/products/diawin/fm40-ethereal.jpg", sourceUrl: "https://www.diawind3.sk/product-page/ethereal", checkedAt },
  Noir: { model: "FM41", price: 140, currency: "EUR", image: "/products/diawin/fm41-noir.jpg", sourceUrl: "https://www.diawind3.sk/product-page/noir", checkedAt },
  Pure: { model: "FM42", price: 140, currency: "EUR", image: "/products/diawin/fm42-pure.jpg", sourceUrl: "https://www.diawind3.sk/product-page/pure", checkedAt },
  Ashline: { model: "FM43", price: 140, currency: "EUR", image: "/products/diawin/fm43-ashline.jpg", sourceUrl: "https://www.diawind3.sk/product-page/ashline", checkedAt },
  Nightcall: { model: "FM44", price: 140, currency: "EUR", image: "/products/diawin/fm44-nightcall.jpg", sourceUrl: "https://www.diawind3.sk/product-page/nightcall", checkedAt },
  Serene: { model: "FF45", price: 140, currency: "EUR", image: "/products/diawin/ff45-serene.jpg", sourceUrl: "https://www.diawind3.sk/product-page/serene", checkedAt },
  "Pink Punch": { model: "TF25", price: 99, currency: "EUR", image: "/products/diawin/tf25-pink-punch.jpg", sourceUrl: "https://d-wide.com/products/pink-punch", checkedAt },
  "Happy Yellow": { model: "TF26", price: 119, currency: "EUR", image: "/products/diawin/tf26-happy-yellow.jpg", sourceUrl: "https://d-wide.com/products/happy-yellow", checkedAt },
  "Black Coffee": { model: "TM24", price: 99, currency: "EUR", image: "/products/diawin/tm24-black-coffee.jpg", sourceUrl: "https://d-wide.com/products/black-coffee", checkedAt },
  "Inspo BW": { model: "TM32", price: 119, currency: "EUR", image: "/products/diawin/tm32-inspo-bw.jpg", sourceUrl: "https://d-wide.com/products/inspo-bw", checkedAt },
  "Piano Black": { model: "TM36", price: 119, currency: "EUR", image: "/products/diawin/tm36-piano-black.jpg", sourceUrl: "https://d-wide.com/products/piano-black", checkedAt },
};

export function formatWorkingPrice(product: DiawinWorkingProduct) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: product.currency }).format(product.price);
}
