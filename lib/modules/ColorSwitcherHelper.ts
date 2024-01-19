import { ContextMenuButton, ContextMenuButtonDefinition } from 'alleo'
import { ColorPickerHelper, DefaultColors, widgetHasDom } from "../alleoWidgetUtils";

export class ColorSwitcherHelper extends ColorPickerHelper {
    constructor(
        handle = 'fontColor',
        CSSVariable = '--widget-font-color',
        defaultColor: string = DefaultColors.text,
        coloPickerSettings: Partial<{
            label: string
            icon: { icon: string; set: string }
            palette: string
            includeTransparent: boolean
        }> = {
            label: 'Switch Text Color',
            icon: { icon: 'adjust', set: 'fas' },
        },
        widgetContainerSelector = '.widget-container',
        callbackOnColorChange: (color: string) => undefined = undefined,
        displayColorSwitcherButtonOnInit = true,
    ) {
        super(handle, CSSVariable, defaultColor, coloPickerSettings, widgetContainerSelector, callbackOnColorChange, false)
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        if (displayColorSwitcherButtonOnInit) {
            const button: ContextMenuButton = <ContextMenuButton>{
                id: handle + '_icon',
                label: coloPickerSettings.label,
                icon: coloPickerSettings.icon,
                action: () => {
                    const color: string = this.color === DefaultColors.text ? DefaultColors.textContrast : DefaultColors.text
                    haptic.setDataField(handle, color, false)
                },
            }
            const contextMenuButtons: ContextMenuButtonDefinition[] = haptic.contextMenuButtons
            contextMenuButtons.push(button)
            haptic.contextMenuButtons = contextMenuButtons
        }
    }
}
