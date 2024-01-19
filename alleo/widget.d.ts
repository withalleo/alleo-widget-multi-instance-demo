import { IWidgetApi } from './alleo.d'

export * from './alleo.d'

declare global {
    const haptic: IWidgetApi
}
