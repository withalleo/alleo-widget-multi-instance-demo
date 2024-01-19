import { widgetHasDom } from "./commonFunctions";

export class EventDisableHelper {
    protected htmlElement: HTMLElement
    public events: string[]
    public static POINTER_EVENTS: string[] = [
        'click',
        'drag',
        'dragend',
        'dragstart',
        'mousedown',
        'mouseenter',
        'mouseleave',
        'mousemove',
        'mouseout',
        'mouseover',
        'pointercancel',
        'pointerdown',
        'pointerenter',
        'pointerleave',
        'pointermove',
        'pointerout',
        'pointerover',
        'touchcancel',
        'touchenter',
        'touchleave',
        'touchmove',
        'touchstart',
    ]

    public static SCROLL_EVENTS: string[] = ['DOMMouseScroll', 'mousewheel', 'wheel', 'touchmove', 'pointermove']

    public static ALL_EVENTS: string[] = [
        ...EventDisableHelper.POINTER_EVENTS,
        ...EventDisableHelper.SCROLL_EVENTS,
        'contextmenu',
        'dblclick',
        'gotpointercapture',
        'lostpointercapture',
        'show',
    ]

    public static EXTENDED_EVENTS: string[] = [
        ...EventDisableHelper.ALL_EVENTS,
        'cdkDragEnded',
        'cdkDragMoved',
        'cdkDragStarted',
        'gesturechange',
        'gestureend',
        'gesturestart',
        'mouseup',
    ]

    public disabled = false


    constructor(element: HTMLElement = widgetHasDom(haptic) ? haptic.rootNode : undefined, events: string[] = EventDisableHelper.ALL_EVENTS) {
        this.htmlElement = element
        this.events = events.filter((event, index) => events.indexOf(event) === index)
    }

    public autoManage() {
        if (!widgetHasDom(haptic)) throw new Error('Widget does not have a dom')
        if (haptic.interactibility.interactible) this.disableEvents()
        haptic.interactibility$.subscribe((interactibility) => (interactibility.interactible ? this.disableEvents() : this.enableEvents()))
    }

    public disableEvents(events: string[] = this.events): void {
        this.disabled = true
        for (const eventName of events) this.htmlElement.addEventListener(eventName, (event) => event.stopPropagation())
    }

    public enableEvents(events: string[] = this.events): void {
        this.disabled = false
        for (const eventName of events) this.htmlElement.removeEventListener(eventName, (event) => event.stopPropagation())
    }

    public static cancelEvent(e: Event, preventDefault = true, stopPropagation = true, stopImmediatePropagation = true): void {
        if (preventDefault) e.preventDefault()
        if (stopPropagation) e.stopPropagation()
        if (stopImmediatePropagation) e.stopImmediatePropagation()
    }
}
