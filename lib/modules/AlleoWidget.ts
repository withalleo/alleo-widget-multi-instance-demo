import { widgetHasDom } from "./commonFunctions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AlleoWidget<SharedVariableStructure extends Record<string, any> = Record<string, any>> {
    protected shared: Partial<SharedVariableStructure>
    protected dom: HTMLDivElement
    private readonly widgetContainerSelector: string
    private sharedVariableHandler: ProxyHandler<Partial<SharedVariableStructure>> = {
        get(defaults: Partial<SharedVariableStructure>, prop: string) {
            return haptic.getDataField(prop) === undefined ? defaults[prop] : haptic.getDataField(prop)
        },
        set(defaults: Partial<SharedVariableStructure>, prop: string, value: undefined): boolean {
            haptic.setDataField(prop, value, false) // TODO consider something like (value instanceof Array || haptic.getDataField(prop) instanceof Array) ? false : true
            return true
        },
    }

    constructor(
        defaultSharedVariables: Partial<SharedVariableStructure> = {},
        settings = {
            doNotCallWidgetReady: <boolean>false,
            doNotSetUpInteractibilityHandler: <boolean>false,
            containerSelector: <string>'.widget-container',
        },
    ) {
        this.shared = new Proxy(defaultSharedVariables, this.sharedVariableHandler)

        if (widgetHasDom(haptic)) {
            this.widgetContainerSelector = settings.containerSelector ?? '.widget-container'
            this.dom = haptic.rootNode.querySelector<HTMLDivElement>(this.widgetContainerSelector)
            if (!settings.doNotSetUpInteractibilityHandler)
                haptic.interactibility$.subscribe((v) => (this.dom.style.pointerEvents = v.interactible ? '' : 'none'))
        }
        if (!settings.doNotCallWidgetReady) haptic.widgetReady()
    }

    protected setContainerClass(className: string, add = true): void {
        // sets an HTML class for the widget container
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        const setHTMLClass = (className: string, add: boolean): void => {
            if (add) {
                haptic.rootNode.querySelector<HTMLElement>(this.widgetContainerSelector).classList.add(className)
            } else {
                try {
                    haptic.rootNode.querySelector<HTMLElement>(this.widgetContainerSelector).classList.remove(className)
                } catch (e) {}
            }
        }
        setHTMLClass(className, add)
        setHTMLClass('not-' + className, !add)
    }

    protected domSelect<HTMLElementType extends HTMLElement = HTMLElement>(query: string): HTMLElementType {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        return haptic.rootNode.querySelector<HTMLElementType>(this.widgetContainerSelector + ' ' + query)
    }
}
