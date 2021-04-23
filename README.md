# photopea.js
A JS-based wrapper for the [Photopea API](https://www.photopea.com/api/).

## Usage
Download [photopea.js](photopea.js) and add it to the head of your HTML document, or in the body before your main JS script.

## Functions
These are all asynchronous. To run them synchronously, wrap your whole code in an asynchronous function and use `await`. For example,
```
(async function() {
    alert(await Photopea.runScript(myframe.contentWindow, "app.echoToOE('Hello World!');"));
})();
```

### `initEmbed(elem_to_append_to, [config])`
> Create a Photopea embed in `elem_to_append_to`. 

Returns the iframe element created. <br />
`config` is optional. If it is to be included, it should be a string determining the JSON configuration file. <br />
Example usage: `Photopea.initEmbed(document.body).then((frame) => { ... });`

### `runScript(contentWindow, script)`
> Run `script` as a script in the Photopea process running in `contentwindow`.

Returns an array containing all data outputted by Photopea before `"done"`. <br />
Example usage: `Photopea.runScript(myEmbed.contentWindow, "app.echoToOE('Hello World!');").then((out_data) => console.log(out_data[0]));` <br />
For [plugins](https://www.photopea.com/api/plugins), use `window.parent` for `contentWindow`.