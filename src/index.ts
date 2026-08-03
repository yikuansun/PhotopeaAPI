/**
 * Interact with a Photopea window from an outer environment or a plugin.
 */
class Photopea {
    /**
     * Creates an iframe with a Photopea window.
     * @param {HTMLDivElement} parentElement The container element of the embed. Should be an empty div with set width & height
     * @param {Object} config Photopea configuration object (can be Object or JSON string). See https://www.photopea.com/api/
     * @returns {Promise<Photopea>} a new Photopea object, whose contentWindow is that of the new iframe.
     */
    static async createEmbed(
        parentElement: HTMLDivElement,
        config?: string | Record<string, unknown>,
    ): Promise<Photopea> {
        let _config = "";
        if (typeof(config) == "object") _config = JSON.stringify(config);
        else if (typeof(config) == "string") _config = config;
        const frame = document.createElement("iframe");
        frame.style.border = "0";
        frame.style.width = "100%";
        frame.style.height = "100%";
        if (config) frame.src = `https://www.photopea.com/#${encodeURI(_config)}`;
        else frame.src = "https://www.photopea.com/#";
        parentElement.appendChild(frame);
        const contentWindow = frame.contentWindow;
        if (!contentWindow) throw new Error("Unable to access the Photopea iframe window.");

        const waitForInit = new Promise<Photopea>((resolve) => {
            const messageHandle = (e: MessageEvent) => {
                if (e.source == frame.contentWindow && e.data == "done") {
                    const pea = new Photopea(contentWindow);
                    window.removeEventListener("message", messageHandle);
                    resolve(pea);
                }
            };
            window.addEventListener("message", messageHandle);
        });
        return waitForInit;
    }

    readonly contentWindow: Window;
    /**
     * Create a new Photopea object.
     * @param {Window} contentWindow The Window where Photopea is running. For embeds, this should be the iframe's contentWindow. For plugins, this should be window.parent
     */
    constructor(contentWindow: Window) {
        this.contentWindow = contentWindow;
    }

    /**
     * Execute a script within the Photopea window. See https://www.photopea.com/learn/scripts
     * @param {string} script The JavaScript to execute.
     * @returns {Promise<Array>} an array containing all outputs from Photopea until "done"
     */
    async runScript<T = unknown>(script: string): Promise<Array<T | "done">> {
        await this._pause();
        const waitForMessage = new Promise<Array<T | "done">>((resolve) => {
            const outputs: Array<T | "done"> = [];
            const messageHandle = (e: MessageEvent) => {
                if (e.source == this.contentWindow) {
                    outputs.push(e.data as T | "done");
                    if (e.data == "done") {
                        window.removeEventListener("message", messageHandle);
                        resolve(outputs);
                    }
                }
            };
            window.addEventListener("message", messageHandle);

            this.contentWindow.postMessage(script, "*");
        });
        return waitForMessage;
    }

    /**
     * Load an asset in Photopea.
     * @param {ArrayBuffer} asset the brush, font, style, image etc. to be loaded in Photopea.
     * @returns {Promise<["done"]>} [ "done" ]
     */
    async loadAsset(asset: ArrayBuffer): Promise<unknown[]> {
        await this._pause();
        const waitForMessage = new Promise<unknown[]>((resolve) => {
            const outputs: unknown[] = [];
            const messageHandle = (e: MessageEvent) => {
                if (e.source == this.contentWindow) {
                    outputs.push(e.data);
                    if (e.data == "done") {
                        window.removeEventListener("message", messageHandle);
                        resolve(outputs);
                    }
                }
            };
            window.addEventListener("message", messageHandle);

            this.contentWindow.postMessage(asset, "*");
        });
        return waitForMessage;
    }

    /**
     * Open an image in the Photopea window.
     * @param {string} url The URI of the image (png, svg, jpg, etc.). Ensure that the content can be fetched cross-origin.
     * @param {boolean} asSmart Whether to add the image to the current document. Should be set to false for the image to be opened in a new document, or if there are no documents already open.
     * @returns {Promise<["done"]>} [ "done" ]
     */
    async openFromURL(url: string, asSmart = true): Promise<["done"]> {
        await this._pause();
        if (asSmart) {
            let layerCountOld: number | "done" = "done";
            while (layerCountOld == "done") layerCountOld = (await this.runScript<number>(`app.echoToOE(app.activeDocument.activeLayer.parent.layers.length)`))[0];
            let layerCountNew: number | "done" = layerCountOld;
            await this.runScript(`app.open("${url}", null, true);`);
            while (layerCountNew == layerCountOld || layerCountNew == "done") {
                layerCountNew = (await this.runScript<number>(`app.echoToOE(app.activeDocument.activeLayer.parent.layers.length)`))[0];
            }
        }
        else {
            let documentsCountOld: number | "done" = "done";
            while (documentsCountOld == "done") documentsCountOld = (await this.runScript<number>(`app.echoToOE(app.documents.length)`))[0];
            let documentsCountNew: number | "done" = documentsCountOld;
            await this.runScript(`app.open("${url}", null, false);`);
            while (documentsCountNew == documentsCountOld || documentsCountNew == "done") {
                documentsCountNew = (await this.runScript<number>(`app.echoToOE(app.documents.length)`))[0];
            }
        }
        return ["done"];
    }

    /**
     * Export the document as a png or jpg file.
     * @param {string} type png or jpg
     * @returns {Promise<Blob>} the exported image. To get it as a URL, use URL.createObjectURL
     */
    async exportImage(type: "png" | "jpg" = "png"): Promise<Blob> {
        await this._pause();
        let buffer: ArrayBuffer | "done" = "done";
        while (buffer == "done") {
            const data = await this.runScript<ArrayBuffer>(`app.activeDocument.saveToOE("${type}");`);
            buffer = data[0];
        }
        return new Blob([ buffer ], {
            type: "image/" + type,
        });

    }

    private _pause(ms = 10): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

export default Photopea;
