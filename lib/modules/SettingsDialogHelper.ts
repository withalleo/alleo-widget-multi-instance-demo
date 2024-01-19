import {
    BoardFabricObjectType,
    ContextMenuButton,
    ContextMenuButtonDefinition,
    FormlyDialogModel,
    FormlyDialogSettings,
    IBoardObject,
} from 'alleo'
import { widgetHasDom } from './commonFunctions'
import { FormlySelectOption } from '@ngx-formly/core/select'

export class SettingsDialogHelper {
    public settings: FormlyDialogSettings
    private readonly callback: (didAnythingChanged: boolean) => void

    constructor(
        settings: FormlyDialogSettings,
        createSettingsButtonOnInit = true,
        callbackOnSettingsDialogClose: (didAnythingChanged: boolean) => void = undefined,
    ) {
        this.settings = settings
        this.callback = callbackOnSettingsDialogClose

        if (createSettingsButtonOnInit) this.createSettingsButton()
    }

    public createSettingsButton(button: ContextMenuButton | undefined = undefined): void {
        if (!widgetHasDom(haptic)) return
        if (button === undefined)
            button = {
                id: 'settings_icon',
                label: 'Widget Settings',
                icon: { icon: 'cogs', set: 'fas' },
                action: () => this.openSettingsDialog(),
            }
        const contextMenuButtons: ContextMenuButtonDefinition[] = haptic.contextMenuButtons
        contextMenuButtons.push(button)
        haptic.contextMenuButtons = contextMenuButtons
    }

    public async openSettingsDialog(): Promise<void> {
        haptic.showFormDialog(await this.refreshFormData(this.settings)).then((ret) => this.processFormDialogResult(ret))
    }

    protected refreshFormData(settings: FormlyDialogSettings): FormlyDialogSettings | Promise<FormlyDialogSettings> {
        /*
    TODO You shouldn't have to change the fields definition to update the form values at init. The showFormDialog options object takes an optional model field where you can set the current values.
    https://dev.azure.com/brandon0840/HAPTIC/_git/haptic-client?path=/src/Haptic.ClientApp/src/app/shared/components/formly-dialog/formly-dialog.component.ts&version=GBmaster&line=10&lineEnd=11&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents
  */
        settings.fields.forEach((setting, index) => {
            if (haptic.getDataField(setting.key) !== undefined) settings.fields[index].defaultValue = haptic.getDataField(setting.key)
        })
        return settings
    }

    protected processFormDialogResult(ret: false | '' | FormlyDialogModel): boolean {
        let didAnythingChanged = false
        if (ret === false || ret === '') {
            if (this.callback) this.callback(false)
            return false
        }

        for (const key in ret) {
            let newValue = ret[key]
            const oldValue = haptic.getDataField(key)
            if (newValue !== oldValue || !['boolean', 'string', 'number'].includes(typeof newValue)) {
                // TODO: strict compare objects and arrays as well
                if (typeof newValue === 'string' && newValue.length > 0) newValue = newValue.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
                haptic.setDataField(key, newValue, false) // TODO consider delta operation for booleans, strings and numbers
                didAnythingChanged = true
            }
        }

        if (this.callback) this.callback(didAnythingChanged)
        return didAnythingChanged
    }
}

export class ContainerSelectorSupportingSettingsDialogHelper extends SettingsDialogHelper {
    public optionsCallback: Function
    protected readonly isContainerOptional: boolean = false

    public static getAllContainersAsFormOptions(): FormlySelectOption[] {
        const possibleContainers: IBoardObject[] = haptic.board.objects.getByType(BoardFabricObjectType.Container)
        const possibleContainerOptions: FormlySelectOption[] = []
        const getLiveContainerLabel = (s: IBoardObject): string => {
            if (s.humanTextId) return s.humanTextId
            return 'Container'
        }
        possibleContainers.forEach((s) => {
            possibleContainerOptions.push({
                label: getLiveContainerLabel(s),
                value: s.id,
            })
        })
        return possibleContainerOptions
    }

    protected async refreshFormData(settings: FormlyDialogSettings): Promise<FormlyDialogSettings> {
        settings.fields.find((f) => f?.key === 'containerId').props.options = this.isContainerOptional
            ? [
                  { label: 'Do not add to Container', value: '' },
                  ...OptionalContainerSelectorSupportingSettingsDialogHelper.getAllContainersAsFormOptions(),
              ]
            : OptionalContainerSelectorSupportingSettingsDialogHelper.getAllContainersAsFormOptions()
        settings.fields.forEach((setting, index) => {
            if (haptic.getDataField(setting?.key) !== undefined) {
                settings.fields[index].defaultValue = haptic.getDataField(setting.key)
            }
        })
        return settings
    }
}

export class OptionalContainerSelectorSupportingSettingsDialogHelper extends ContainerSelectorSupportingSettingsDialogHelper {
    protected readonly isContainerOptional: boolean = true
}

export class OptionalLocationSelectorSupportingSettingsDialogHelper extends SettingsDialogHelper {
    public optionsCallback: Function

    protected async refreshFormData(settings: FormlyDialogSettings): Promise<FormlyDialogSettings> {
        settings.fields
            .filter((field) => field?.key?.toString()?.startsWith('location'))
            .forEach((location) => {
                location.props.options = [{ label: 'Not Set', value: '' }, ...this.getAllLocationsAsFormOptions()]
            })
        settings.fields.forEach((setting, index) => {
            if (haptic.getDataField(setting.key) !== undefined) {
                settings.fields[index].defaultValue = haptic.getDataField(setting.key)
            }
        })
        return settings
    }

    private getAllLocationsAsFormOptions(): FormlySelectOption[] {
        const possibleLocations: IBoardObject[] = [
            ...haptic.board.objects.getByType(BoardFabricObjectType.Slide),
            ...haptic.board.objects.getByType(BoardFabricObjectType.View),
        ]

        const possibleLocationOptions: FormlySelectOption[] = []
        const getLocationLabel = (s: IBoardObject): string => {
            if (s.humanTextId) return s.humanTextId
            if (s.type === BoardFabricObjectType.Slide) return 'Slide'
            return 'Location'
        }
        possibleLocations.forEach((s) => {
            possibleLocationOptions.push({
                label: getLocationLabel(s),
                value: s.id,
            })
        })
        return possibleLocationOptions
    }
}
