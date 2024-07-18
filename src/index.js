export default class Photopea {
    static sayHello() {
        return 'Hi, I am Tom.'
    }

    static async initEmbed(parentElement, config) {
        let _config = "";
        if (typeof(config) == "object") _config = JSON.stringify(config);
        else if (typeof(config) == "string") _config = config;
        let frame = document.createElement("iframe");
        frame.style.border = "0";
        frame.style.width = "100%";
        frame.style.height = "100%";
        if (config) frame.src = "https://www.photopea.com#" + encodeURI(_config);
        else frame.src = "https://www.photopea.com";
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
    constructor(contentWindow) {
        this.contentWindow = contentWindow;
    }

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

    async _pause(ms=10) {
        return await new Promise((res, rej) => {
            setTimeout(() => { res(); }, ms);
        });
    }
}