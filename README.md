# photopea.js
A JS-based wrapper for the [Photopea API](https://www.photopea.com/api/).

## Installation
The easiest way to install photopea.js is through a CDN.
```
haven't set it up yet... come back later.
```
You can also download [`photopea.min.js`](./dist/photopea.min.js) and host it yourself:
```
<script src="./photopea.min.js"></script>
```
If you're using a Node framework, like Webpack, Rollup, or Vite, simply install with npm:
```
npm install photopea
```
You can then import the module in your code:
```
import Photopea from "photopea";
```

## Usage
`Photopea` is a class with methods that can interact with any instance of Photopea.
### Constructors
For plugins, use window.parent as the Photopea content window:
```
let pea = new Photopea(window.parent);
```
To create a new Photopea embed, use `Photopea.createEmbed`:
```
Photopea.createEmbed(container).then(async (pea) => {
    // photopea initialized
    // pea is the new Photopea object
    // you can also use async/await:
    /*
    let pea = await Photopea.createEmbed(container);
    */
});
```
`container` is the parent DOM element and should be a `div` with a set width and height.
### Methods
#### `async runScript(script)`
- `script` (string): the [script](https://www.photopea.com/learn/scripts) to run in Photopea.
- Returns: an array containing all of the scripts outputs, ending with `"done"`.
#### `async loadAsset(asset)`
- `asset` (ArrayBuffer): a buffer of the asset to load in Photopea.
- Returns: `[ "done" ]`.