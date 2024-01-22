import { BoardFabricObjectType, ExposeActionHelper, FormlyDialogSettings, RealIBoardObject, SettingsDialogHelper  } from '@withalleo/alleo-widget'
import { FormlySelectOption } from '@ngx-formly/core/select'

// A Settings dialog variant that supports a dropdown for selecting a manager widget
export class ManagerSelectorSettingsDialogHelper extends SettingsDialogHelper {
    protected async refreshFormData(settings: FormlyDialogSettings): Promise<FormlyDialogSettings> {
        settings.fields
            .filter((field) => field?.key?.toString() === 'managerObjectId')
            .forEach((managerObject) => {
                managerObject.props.options = [{ label: 'Not Set', value: undefined }, ...this.getManagersForThisWidget()]
            })
        settings.fields.forEach((setting, index) => {
            if (haptic.getDataField(setting.key) !== undefined) {
                settings.fields[index].defaultValue = haptic.getDataField(setting.key)
            }
        })
        return settings
    }

    private getManagersForThisWidget(): FormlySelectOption[] {
        const getLabel = (s: RealIBoardObject): string => {
            return 'Fraud Challenge Manager (' + s.id.substring(0, 8) + '...)'
        }

        const manifestUrl: string = haptic.config.entryPoint.replace('manifest.json', '').replace('index.html', '')
        const possibleObjects: RealIBoardObject[] = (haptic.board.objects
            .getByType(BoardFabricObjectType.Widget) as RealIBoardObject[])
            .filter((widget ) => {
                haptic.logService.debug('FraudChallengeWidget', 'Checking widget', widget)
                if (!widget?.id || widget.id === haptic.widgetId) return false
                if (!widget.obj?.data?.entryPoint?.startsWith(manifestUrl)) return false
                if (ExposeActionHelper.getExposedFunction(widget, 'getRole')?.() !== 'manager') return false
                return true
            })
        let res: FormlySelectOption[] = []
        possibleObjects.forEach((s) => {
            res.push({
                label: getLabel(s),
                value: s.id,
            })
        })
        return res
    }
}
