import { DeploymentSettingsHelper } from '../alleoWidgetUtils'

export class DefaultLocale {
    public static timeFormat: '12hrs' | '24hrs' =
        DeploymentSettingsHelper.settings?.locale?.timeFormat ??
        !new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(0).match(/AM/)
            ? '24hrs'
            : '12hrs'
    public static dateFormat = undefined // TODO add dateFormat
    public static timeZone: string =
        DeploymentSettingsHelper.settings?.locale?.timeZone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        'America/Indiana/Indianapolis'
    public static unitSystem: 'imperial' | 'si' =
        DeploymentSettingsHelper.settings?.locale?.unitSystem ?? ['US', 'LR'].includes(navigator.language.slice(-2).toUpperCase())
            ? 'imperial'
            : 'si'
    public static language: string = DeploymentSettingsHelper.settings?.locale?.language ?? 'EN-US'
    public static txt(englishDefaultText: string, languageCode: string | 'original' = DefaultLocale.language): string {
        languageCode = languageCode.toLowerCase()
        if (languageCode === 'original') return englishDefaultText
        return (
            DeploymentSettingsHelper.settings?.translation?.['deployment']?.[englishDefaultText] ??
            DeploymentSettingsHelper.settings?.translation?.[languageCode]?.[englishDefaultText] ??
            DeploymentSettingsHelper.settings?.translation?.[languageCode.substring(0, 2)]?.[englishDefaultText] ??
            DeploymentSettingsHelper.settings?.translation?.[englishDefaultText] ??
            englishDefaultText
        )
    }
}
