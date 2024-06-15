import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = resolve(__dirname, "./blstWrapper.cjs");

import { Blst } from "./blst.hpp.js";

const getBlst = async () => {
  const blst = await import(path);
  return blst.default as Blst;
};

export { getBlst };
