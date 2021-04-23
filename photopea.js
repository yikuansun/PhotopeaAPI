var Photopea = {
    initEmbed: async function(elem_to_append_to, config) {
        // Example usage: Photopea.initEmbed(document.body);
        // config is optional.
        // This will not work on Chrome if third-party cookies and site data are blocked.
        var iframe = document.createElement("iframe");
        iframe.style.border = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        if (config) iframe.src = "https://www.photopea.com#" + encodeURI(config);
        else iframe.src = "https://www.photopea.com";
        elem_to_append_to.appendChild(iframe);
        var myPromise = new Promise(function(resolve, reject) {
            var messageHandle = function(e) {
                //if (e.source == iframe.contentWindow && e.data == "done") {
                    resolve(iframe);
                    window.removeEventListener("message", messageHandle);
                //}
            };
            window.addEventListener("message", messageHandle);
        });
        return await myPromise;
    },
    runScript: async function(contentWindow, script) {
        // Example usage: Photopea.runScript(myEmbed.contentWindow, "alert('hi')").then((x) => console.log(x));
        // If in a plugin, use window.parent as contentWindow.
        var myPromise = new Promise(function(resolve, reject) {
            var outputarray = [];
            var messageHandle = function(e) {
                if (e.source == contentWindow) {
                    outputarray.push(e.data);
                    if (e.data == "done") {
                        resolve(outputarray);
                        window.removeEventListener("message", messageHandle);
                    }
                }
            };
            window.addEventListener("message", messageHandle);
        });
        contentWindow.postMessage(script, "*");
        var returnedMessage = await myPromise;
        return returnedMessage;
    }
};