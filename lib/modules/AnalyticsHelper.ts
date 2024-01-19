export class AnalyticsHelper {
    public static getWidgetName(): string | undefined {
        if (haptic.config?.name?.length && haptic.config.name !== 'external' && haptic.config.name !== 'internal') return haptic.config.name
        if (!haptic.config?.entryPoint) return undefined
        let entrypoint = haptic.config.entryPoint.replace('manifest.json', '').replace('index.html', '').trim()
        if (entrypoint.endsWith('/')) entrypoint = entrypoint.slice(0, -1)
        return entrypoint.split('/').pop() || undefined
    }

    public static trackEvent(action: string, payload: Record<string, any> = {}): void {
        const widgetName: string = AnalyticsHelper.getWidgetName() || 'unknown'
        const trackName: string = widgetName + ' | ' + action
        const trackPayload: Record<string, any> = {
            ...payload,
            widgetName,
            action,
            widgetId: haptic.widgetId,
            widgetEntryPoint: haptic.config.entryPoint,
        }

        haptic.trackAnalyticsEvent(trackName, trackPayload)
    }

    public static debug(...params: any[]): void {
        haptic.logService.debug('[WIDGET] ' + (AnalyticsHelper.getWidgetName() || 'anonymous'), ...params)
    }
    public static info(...params: any[]): void {
        haptic.logService.info('[WIDGET] ' + (AnalyticsHelper.getWidgetName() || 'anonymous'), ...params)
    }
    public static warn(...params: any[]): void {
        haptic.logService.warn('[WIDGET] ' + (AnalyticsHelper.getWidgetName() || 'anonymous'), ...params)
    }
    public static error(...params: any[]): void {
        haptic.logService.error('[WIDGET] ' + (AnalyticsHelper.getWidgetName() || 'anonymous'), ...params)
    }
}
