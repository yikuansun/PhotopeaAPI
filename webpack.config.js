import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: "./src/index.js",
    output: {
        filename: "photopea.min.js",
        path: path.resolve(__dirname, "dist"),
        library: "Photopea",
        libraryExport: "default",
        libraryTarget: "umd",
        globalObject: "this",
    },
};