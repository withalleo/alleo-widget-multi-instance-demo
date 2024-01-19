import { DeploymentSettingsHelper } from '../alleoWidgetUtils'

export class DefaultColors {
    protected static theme = haptic.board.ui.themeColors ?? null
    public static text: string = DeploymentSettingsHelper.settings?.colors?.text ?? DefaultColors.theme?.accent?.['A100'] ?? '#ffffff'
    public static textContrast: string =
        DeploymentSettingsHelper.settings?.colors?.textContrast ?? DefaultColors.theme?.accent?.contrast?.['50'] ?? '#051825'
    public static background: string =
        DeploymentSettingsHelper.settings?.colors?.background ?? DefaultColors.theme?.background?.['900'] ?? '#051825'
    public static widgetButton: string =
        DeploymentSettingsHelper.settings?.colors?.widgetButton ?? DefaultColors.theme?.accent?.contrast?.['900'] ?? '#f9fff6'
    public static primary: string = DeploymentSettingsHelper.settings?.colors?.primary ?? DefaultColors.theme?.primary?.['500'] ?? '#6da8ff'
    public static rainbow: string[] = DeploymentSettingsHelper.settings?.colors?.rainbow ?? [
        '#00345c',
        '#3d3e76',
        '#734284',
        '#a84384',
        '#d54776',
        '#f65b5d',
        '#ff7d3b',
        '#ffa600',
        '#09944d',
        '#006c74',
    ]
}
