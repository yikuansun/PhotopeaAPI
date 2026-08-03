/**
 * Interact with a Photopea window from an outer environment or a plugin.
 */
declare class Photopea {
    /**
     * Creates an iframe with a Photopea window.
     * @param {HTMLDivElement} parentElement The container element of the embed. Should be an empty div with set width & height
     * @param {Object} config Photopea configuration object (can be Object or JSON string). See https://www.photopea.com/api/
     * @returns {Promise<Photopea>} a new Photopea object, whose contentWindow is that of the new iframe.
     */
    static createEmbed(parentElement: HTMLDivElement, config?: string | Record<string, unknown>): Promise<Photopea>;
    readonly contentWindow: Window;
    /**
     * Create a new Photopea object.
     * @param {Window} contentWindow The Window where Photopea is running. For embeds, this should be the iframe's contentWindow. For plugins, this should be window.parent
     */
    constructor(contentWindow: Window);
    /**
     * Execute a script within the Photopea window. See https://www.photopea.com/learn/scripts
     * @param {string} script The JavaScript to execute.
     * @returns {Promise<Array>} an array containing all outputs from Photopea until "done"
     */
    runScript<T = unknown>(script: string): Promise<Array<T | "done">>;
    /**
     * Load an asset in Photopea.
     * @param {ArrayBuffer} asset the brush, font, style, image etc. to be loaded in Photopea.
     * @returns {Promise<["done"]>} [ "done" ]
     */
    loadAsset(asset: ArrayBuffer): Promise<unknown[]>;
    /**
     * Open an image in the Photopea window.
     * @param {string} url The URI of the image (png, svg, jpg, etc.). Ensure that the content can be fetched cross-origin.
     * @param {boolean} asSmart Whether to add the image to the current document. Should be set to false for the image to be opened in a new document, or if there are no documents already open.
     * @returns {Promise<["done"]>} [ "done" ]
     */
    openFromURL(url: string, asSmart?: boolean): Promise<["done"]>;
    /**
     * Export the document as a png or jpg file.
     * @param {string} type png or jpg
     * @returns {Promise<Blob>} the exported image. To get it as a URL, use URL.createObjectURL
     */
    exportImage(type?: "png" | "jpg"): Promise<Blob>;
    private _pause;
}
export default Photopea;
