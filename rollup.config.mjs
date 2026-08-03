import terser from "@rollup/plugin-terser";

export default {
    input: "dist/index.js",
    output: {
        file: "dist/photopea.min.js",
        format: "umd",
        name: "Photopea",
        plugins: [terser()],
        sourcemap: true,
    },
};
