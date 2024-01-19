import { EventDisableHelper } from '../alleoWidgetUtils'

export type Coordinates = { x: number; y: number }
export class ScrollHelper {
    public coordinates: Coordinates
    public disableUserScrolling: boolean
    public syncScrolling: boolean
    public syncScrollingLeaderOnly: boolean
    protected enabled = false
    protected readonly htmlElement: HTMLElement
    protected readonly eventDisableHelper: EventDisableHelper
    protected readonly sharedVariableName: string

    constructor(
        element: HTMLElement,
        autoEnableScroll = true,
        syncScrolling = true,
        syncScrollingLeaderOnly = true,
        disableUserScrolling = false,
        sharedVariableName = '_AlleoWidget_ScrollHelper_coords',
    ) {
        this.htmlElement = element
        this.eventDisableHelper = new EventDisableHelper(this.htmlElement, EventDisableHelper.SCROLL_EVENTS)
        this.sharedVariableName = sharedVariableName
        this.disableUserScrolling = disableUserScrolling
        this.syncScrollingLeaderOnly = syncScrollingLeaderOnly
        this.syncScrolling = syncScrolling
        haptic.getFieldChanged$(this.sharedVariableName).subscribe((coords) => {
            if (this.syncScrolling) this.scrollTo(coords)
        })
        if (autoEnableScroll) this.enableScroll()
    }

    public enableScroll(): void {
        this.eventDisableHelper.disableEvents()
        this.scrollToSavedPosition()
        this.htmlElement.onscroll = (event) => this.onScroll(event)
        this.enabled = true
    }

    public disableScroll(): void {
        this.eventDisableHelper.enableEvents()
        this.htmlElement.onscroll = () => undefined
        this.enabled = false
    }

    protected onScroll(event: Event) {
        if (!this.syncScrolling || !this.enabled) return
        if (this.syncScrollingLeaderOnly && !haptic.board.leadingUsers) return
        if (this.disableUserScrolling) return this.scrollToSavedPosition()
        if (event.currentTarget !== this.htmlElement) return
        const y: number = this.htmlElement.scrollTop ?? 0
        const x: number = this.htmlElement.scrollLeft ?? 0
        if (haptic.getDataField(this.sharedVariableName)?.x === x && haptic.getDataField(this.sharedVariableName)?.y === y) return
        this.htmlElement.style.scrollBehavior = 'auto'
        haptic.setDataField(this.sharedVariableName, <Coordinates>{ x, y })
    }

    protected scrollToSavedPosition() {
        if (!this.syncScrolling) return
        this.scrollTo({
            x: haptic.getDataField(this.sharedVariableName)?.x ?? 0,
            y: haptic.getDataField(this.sharedVariableName)?.y ?? 0,
        })
    }

    public scrollTo(coords: Coordinates) {
        this.coordinates = coords
        this.htmlElement.scrollTo({ left: coords.x, top: coords.y, behavior: 'auto' })
    }
}
