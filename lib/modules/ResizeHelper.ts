import { widgetHasDom } from "./commonFunctions";

export class ResizeHelper {
    private readonly dom: HTMLElement

    constructor(
        minSize = { width: 100, height: 100 },
        callback: ({ width, height }) => undefined | void = undefined,
        updateCss = true,
        widgetContainerSelector = '.widget-container',
    ) {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        this.dom = haptic.rootNode.querySelector<HTMLElement>(widgetContainerSelector)
        haptic.enableResizing = true
        haptic.setMinSize(minSize.width, minSize.height)
        if (updateCss) {
            this.dom.style.setProperty('--widget-width', haptic.getSize().width + 'px')
            this.dom.style.setProperty('--widget-height', haptic.getSize().height + 'px')
        }
        if (updateCss || callback !== undefined)
            new ResizeObserver(() => {
                // TODO use ResizeObserverCallback to get width / height
                const width: number = haptic.getSize().width
                const height: number = haptic.getSize().height
                if (updateCss) {
                    this.dom.style.setProperty('--widget-width', width + 'px')
                    this.dom.style.setProperty('--widget-height', height + 'px')
                }
                if (callback) callback({ width, height })
            }).observe(haptic.rootNode)
    }
}
