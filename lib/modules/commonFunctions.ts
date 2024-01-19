import { IWidgetApi, IWidgetServiceApi } from 'alleo'
import { Coordinates } from './ScrollHelper'

export function isTransparent(color: string): boolean {
    // Note: also returns true if color is undefined or empty.
    color = color.trim().toLowerCase().replace(/\s/g, '').replace(';', '')
    return !color || color === 'transparent' || (color.substring(0, 5) === 'rgba(' && color.substring(color.length - 3) === ',0)')
}

export function randomInt(min: number, max: number): number {
    if (min > max) throw new Error('randomInt: the minimum for the random was larger than the maximum')
    if (min < 0 || max < 0) throw new Error('randomInt: cannot handle negative numbers as min or max')
    min = Math.floor(min)
    max = Math.floor(max)
    const range = max - min + 1
    if (range > Math.pow(2, 32)) throw new Error('randomInt: range too large')
    const randomBytes = new Uint32Array(1)
    crypto.getRandomValues(randomBytes)
    return min + (randomBytes[0] % range)
}

export async function waitUntilDomUpdates(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                resolve()
            }, 0)
        })
    })
}

export function widgetHasDom(h: IWidgetApi | IWidgetServiceApi = haptic): h is IWidgetApi {
    return !!(h as IWidgetApi).rootNode
}

export function getWidgetCoordinates(event: PointerEvent | MouseEvent | Touch | { clientX: number; clientY: number }): Coordinates {
    if (!widgetHasDom(haptic)) throw new Error('getWidgetCoordinates: haptic does not have a dom')
    const boundingClientRect = haptic.rootNode.getBoundingClientRect()
    const hapticSize = haptic.getSize()

    const boxLeft = boundingClientRect.x
    const boxWidth = boundingClientRect.width
    const widgetWidth = hapticSize.width
    const widthRatio = widgetWidth / boxWidth
    const clientLeft = event.clientX - boxLeft
    const x = clientLeft * widthRatio

    const boxTop = boundingClientRect.y
    const boxHeight = boundingClientRect.height
    const widgetHeight = hapticSize.height
    const heightRatio = widgetHeight / boxHeight
    const clientTop = event.clientY - boxTop
    const y = clientTop * heightRatio

    return { x, y } as Coordinates
}
