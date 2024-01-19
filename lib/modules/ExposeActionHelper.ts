import { IBoardObject } from 'alleo'
import { widgetHasDom } from './commonFunctions'

export interface RealIBoardObject extends IBoardObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj?: Record<string, any>
}

interface HTMLElementWithWidgetReference extends HTMLElement {
    widgetReference?: Record<string, AnyFunction>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: undefined[]) => any
export class ExposeActionHelper {
    public static exposeActions(actions: { name: string; action: AnyFunction }[]): void {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        if (!(haptic.rootNode as HTMLElementWithWidgetReference).widgetReference)
            (haptic.rootNode as HTMLElementWithWidgetReference).widgetReference = {}
        actions.forEach((f) => {
            ;(haptic.rootNode as HTMLElementWithWidgetReference).widgetReference[f.name] = f.action
        })
    }

    public static unExposeActions(actions: { name: string; action?: AnyFunction }[]): void {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        if (!(haptic.rootNode as HTMLElementWithWidgetReference).widgetReference) return
        actions.forEach((f) => {
            ;(haptic.rootNode as HTMLElementWithWidgetReference).widgetReference[f.name] = undefined
        })
    }

    public static getExposedFunction(widget: IBoardObject, functionName: string): AnyFunction {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        if (typeof this.listExposedFunctions(widget)[functionName] !== 'function') throw new Error('Exposed Function not found')
        return this.listExposedFunctions(widget)[functionName] as AnyFunction
    }

    public static listExposedFunctions(widget: IBoardObject): Record<string, AnyFunction> {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        return (widget as RealIBoardObject)?.obj?.component?.container?.nativeElement?.widgetReference ?? {}
    }
}
