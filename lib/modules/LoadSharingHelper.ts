export type SharedLock = {
    connectionId: string
    lastUpdate: number
}
export class LoadSharingHelper {
    private timer: NodeJS.Timeout
    private readonly callback: (lastEntryRelativeTime?: number) => void
    private checkInterval: number
    private readonly dataFieldName: string
    public static defaultLock: SharedLock = { connectionId: '', lastUpdate: 0 }
    private takeOverTimeout: number

    constructor(
        callback: (lastEntryRelativeTime?: number) => void,
        checkInterval = 300,
        takeOverTimeout = checkInterval + 5000,
        dataFieldName = 'processLock',
    ) {
        this.callback = callback
        this.checkInterval = checkInterval
        this.dataFieldName = dataFieldName
        this.takeOverTimeout = takeOverTimeout
        this.startTimer()
        haptic.widgetDestroyed$.subscribe(() => this.onDestroy())
    }

    private onDestroy() {
        this.stopTimer()
    }

    public stopTimer() {
        clearInterval(this.timer)
    }

    public startTimer() {
        this.timer = setInterval(() => this.check(), this.checkInterval)
    }

    public restartTimer(interval: number | undefined = undefined, takeOverTimeOut: number = interval + 5000) {
        if (interval) {
            this.checkInterval = interval
            this.takeOverTimeout = takeOverTimeOut
        }
        this.stopTimer()
        this.startTimer()
    }

    private async check(): Promise<void> {
        let currentLock: SharedLock = haptic.getDataField(this.dataFieldName)
        if (!currentLock) currentLock = LoadSharingHelper.defaultLock
        const myConnectionId = haptic.currentUser.connectionId
        const lastEntryRelativeTime = haptic.serverTimeMsec - currentLock.lastUpdate

        if (currentLock.connectionId != myConnectionId && lastEntryRelativeTime < this.checkInterval + this.takeOverTimeout) return

        const newLock: SharedLock = {
            connectionId: myConnectionId,
            lastUpdate: haptic.serverTimeMsec,
        }
        haptic.setDataField(this.dataFieldName, newLock, true)
        this.callback(lastEntryRelativeTime)
    }
}
