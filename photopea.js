var Photopea = {
    initEmbed: async function(elem_to_append_to, environment) {
        /*var*/ iframe = document.createElement("iframe");
        iframe.style.border = "0";
        if (environment) iframe.src = "https://www.photopea.com#" + encodeURI(environment);
        else iframe.src = "https://www.photopea.com";
        var myPromise = new Promise(function(resolve, reject) {
            var messageHandle = function(e) {
                //if (/*e.source == iframe.contentWindow && */e.data == "done") {
                    resolve(iframe);
                    window.removeEventListener("message", messageHandle);
                //}
            };
            window.addEventListener("message", messageHandle);
        });
        elem_to_append_to.appendChild(iframe);
        return await myPromise;
    },
    runScript: async function(contentWindow, script) {
        // Example usage: Photopea.runScript(myEmbed.contentWindow, "alert('hi')").then((x) => console.log(x));
        var myPromise = new Promise(function(resolve, reject) {
            var messageHandle = function(e) {
                if (e.source == contentWindow) {
                    resolve(e.data);
                    window.removeEventListener("message", messageHandle);
                }
            };
            window.addEventListener("message", messageHandle);
        });
        contentWindow.postMessage(script, "*");
        var returnedMessage = await myPromise;
        return returnedMessage;
    }
};