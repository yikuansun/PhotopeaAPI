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
    static async createEmbed(parentElement, config) {
        let _config = "";
        if (typeof(config) == "object") _config = JSON.stringify(config);
        else if (typeof(config) == "string") _config = config;
        let frame = document.createElement("iframe");
        frame.style.border = "0";
        frame.style.width = "100%";
        frame.style.height = "100%";
        if (config) frame.src = `https://www.photopea.com/#${encodeURI(_config)}`;
        else frame.src = "https://www.photopea.com/#";
        parentElement.appendChild(frame);
        let waitForInit = new Promise(function(res, rej) {
            let messageHandle = (e) => {
                if (e.source == frame.contentWindow && e.data == "done") {
                    let pea = new Photopea(frame.contentWindow);
                    window.removeEventListener("message", messageHandle);
                    res(pea);
                }
            };
            window.addEventListener("message", messageHandle);
        });
        return await waitForInit;
    }

    contentWindow;
    /**
     * Create a new Photopea object.
     * @param {Window} contentWindow The Window where Photopea is running. For embeds, this should be the iframe's contentWindow. For plugins, this should be window.parent
     */
    constructor(contentWindow) {
        this.contentWindow = contentWindow;
    }

    /**
     * Execute a script within the Photopea window. See https://www.photopea.com/learn/scripts
     * @param {string} script The JavaScript to execute.
     * @returns {Promise<Array>} an array containing all outputs from Photopea until "done"
     */
    async runScript(script) {
        await this._pause();
        let waitForMessage = new Promise((res, rej) => {
            let outputs = [];
            let messageHandle = (e) => {
                if (e.source == this.contentWindow) {
                    outputs.push(e.data);
                    if (e.data == "done") {
                        window.removeEventListener("message", messageHandle);
                        res(outputs);
                    }
                }
            };
            window.addEventListener("message", messageHandle);

            this.contentWindow.postMessage(script, "*");
        });
        return await waitForMessage;
    }

    /**
     * Load an asset in Photopea.
     * @param {ArrayBuffer} asset the brush, font, style, image etc. to be loaded in Photopea.
     * @returns {Promise<["done"]>} [ "done" ]
     */
    async loadAsset(asset) {
        await this._pause();
        let waitForMessage = new Promise((res, rej) => {
            let outputs = [];
            let messageHandle = (e) => {
                if (e.source == this.contentWindow) {
                    outputs.push(e.data);
                    if (e.data == "done") {
                        window.removeEventListener("message", messageHandle);
                        res(outputs);
                    }
                }
            };
            window.addEventListener("message", messageHandle);

            this.contentWindow.postMessage(asset, "*");
        });
        return await waitForMessage;        
    }

    /**
     * Open an image in the Photopea window.
     * @param {string} url The URI of the image (png, svg, jpg, etc.). Ensure that the content can be fetched cross-origin.
     * @param {boolean} asSmart Whether to add the image to the current document. Should be set to false for the image to be opened in a new document, or if there are no documents already open.
     * @returns {Promise<["done"]} [ "done" ]
     */
    async openFromURL(url, asSmart=true) {
        await this._pause();
        let layerCountOld = "done";
        while (layerCountOld == "done") layerCountOld = (await this.runScript(`app.echoToOE(${asSmart?"app.activeDocument.layers.length":"app.documents.length"})`))[0];
        let layerCountNew = layerCountOld;
        await this.runScript(`app.open("${url}", null, ${asSmart});`);
        while (layerCountNew == layerCountOld || layerCountNew == "done") {
            layerCountNew = (await this.runScript(`app.echoToOE(${asSmart?"app.activeDocument.layers.length":"app.documents.length"})`))[0];
        }
        return [ "done" ];
    }

    /**
     * Export the document as a png or jpg file.
     * @param {string} type png or jpg
     * @returns {Promise<Blob>} the exported image. To get it as a URL, use URL.createObjectURL
     */
    async exportImage(type="png") {
        await this._pause();
        let buffer = "done";
        while (buffer == "done") {
            let data = await this.runScript(`app.activeDocument.saveToOE("${type}");`);
            buffer = data[0];
        }
        return new Blob([ buffer ], {
            type: "image/" + type,
        });

    }

    async _pause(ms=10) {
        return await new Promise((res, rej) => {
            setTimeout(() => { res(); }, ms);
        });
    }
}

export default Photopea;
