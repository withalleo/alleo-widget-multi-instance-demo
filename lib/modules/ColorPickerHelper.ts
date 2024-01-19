import { ColorPalette, ContextMenuButtonDefinition, ContextMenuColor } from 'alleo'
import { DefaultColors, isTransparent, widgetHasDom } from '../alleoWidgetUtils'

export class ColorPickerHelper {
    public color: string
    private readonly handle: string
    private readonly cssHandle: string

    private widgetContainer: HTMLDivElement

    constructor(
        handle = 'color',
        CSSVariable = '--widget-color',
        defaultColor: string = DefaultColors.primary,
        coloPickerSettings: Partial<{
            label: string
            icon: { icon: string; set: string }
            palette: string
            includeTransparent: boolean
        }> = {
            label: 'Text Color',
            icon: { icon: 'text', set: 'fas' },
            palette: 'Text',
            includeTransparent: false,
        },
        widgetContainerSelector = '.widget-container',
        callbackOnColorChange: (color: string) => void = undefined,
        displayColorPickerButtonOnInit = true,
    ) {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        this.color = defaultColor
        this.handle = handle
        this.cssHandle = CSSVariable
        this.widgetContainer = haptic.rootNode.querySelector<HTMLDivElement>(widgetContainerSelector)

        if (displayColorPickerButtonOnInit) this.createColorPickerButton(undefined, coloPickerSettings)

        haptic.getFieldChanged$(handle).subscribe((color) => {
            if (!color) return
            this.onUpdate(color)
            if (callbackOnColorChange) callbackOnColorChange(color)
        })
        this.onUpdate(this.color)
    }

    public createColorPickerButton(
        button: ContextMenuColor | undefined = undefined,
        coloPickerSettings: Partial<{
            label: string
            icon: { icon: string; set: string }
            palette: string
            includeTransparent: boolean
        }>,
    ): void {
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        if (button === undefined)
            button = <ContextMenuColor>{
                id: this.handle + '_icon',
                type: 'color',
                label: isTransparent(this.color) ? coloPickerSettings.label + ' (transparent)' : coloPickerSettings.label,
                icon: coloPickerSettings.icon,
                palette: ColorPalette[coloPickerSettings.palette],
                includeTransparent: coloPickerSettings.includeTransparent,
                color: isTransparent(this.color) ? DefaultColors.widgetButton : this.color,
                action: (color) => this.setColor(color),
            }
        const contextMenuButtons: ContextMenuButtonDefinition[] = haptic.contextMenuButtons
        contextMenuButtons.push(button)
        haptic.contextMenuButtons = contextMenuButtons
    }

    public onUpdate(color: string): void {
        this.color = color
        this.widgetContainer.style.setProperty(this.cssHandle, this.color)
        this.updateColorBarColor(this.handle + '_icon', this.color)
    }

    public setColor(color: string): void {
        haptic.setDataField(this.handle, color, false)
    }

    private updateColorBarColor(id: string, color: string): void {
        // updates a widget config bar color button's color
        if (!widgetHasDom(haptic)) throw new Error('No DOM available')
        color = isTransparent(color) ? DefaultColors.widgetButton : color
        haptic.contextMenuButtons.forEach((button, i: number) => {
            if (button?.id === id && button?.type === 'color') {
                haptic.contextMenuButtons[i]['color'] = color
                let label: string = haptic.contextMenuButtons[i]['label'].replace(' (transparent)', '')
                if (isTransparent(color)) label += ' (transparent)'
                haptic.contextMenuButtons[i]['label'] = label
            }
        })
    }
}
