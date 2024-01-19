import { IWidgetServiceApi } from './alleo.d'

export * from './alleo.d'

declare global {
    const haptic: IWidgetServiceApi
}
