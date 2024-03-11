import { AlleoWidget, BoardObjectHelper, ExposeActionHelper, RealIBoardObject } from '@withalleo/alleo-widget'
import { Optional } from 'utility-types'

export type Role = 'manager' | 'side-1' | 'side-2'
export type ObjectId = string

export interface Message extends Record<string, any> {
    sender: Role
    target: Role
    payload: any
    id?: string
}

const alleoMultiWidgetDefaultSharedVariables = {
    'role': <Role>'manager',
    'managerObjectId': <ObjectId | undefined>undefined,
    'side1ObjectId': <ObjectId | undefined>undefined,
    'side2ObjectId': <ObjectId | undefined>undefined,
}

export class AlleoMultiWidget<
    SharedVariableStructure extends typeof alleoMultiWidgetDefaultSharedVariables = typeof alleoMultiWidgetDefaultSharedVariables,
> extends AlleoWidget<SharedVariableStructure> {
    // initialize the widget when the page loads
    private processedMessageIds: string[] = []

    constructor(defaultSharedVariables: Partial<SharedVariableStructure> = {}, loadLastMessageOnInit: boolean = false) {
        super(defaultSharedVariables)

        // initialize messaging between widgets
        ExposeActionHelper.exposeActions([
            {
                name: 'receiveMessage',
                action: (message: Message) => this.onIncomingMessage(message),
            },
            {
                name: 'getRole',
                action: () => this.shared.role,
            },
            {
                name: 'attach',
                action: (role: Role, id: ObjectId): boolean => {
                    switch (role) {
                        case 'manager':
                            this.shared.managerObjectId = id
                            break
                        case 'side-1':
                            this.shared.side1ObjectId = id
                            break
                        case 'side-2':
                            this.shared.side2ObjectId = id
                            break
                        default:
                            haptic.utils.assertUnreachable(role)
                    }
                    return true
                },
            },
        ])

        // connect to the manager widget
        this.connectToManager(true)
        haptic.getFieldChanged$('managerObjectId').subscribe(() => this.connectToManager())
        haptic.getFieldChanged$('role').subscribe(() => this.connectToManager())

        haptic.syncMessage$.subscribe((message) => this.onIncomingBroadcastMessage(message.data as Message))
        if (loadLastMessageOnInit) this.onIncomingBroadcastMessage(haptic.getLastSyncMessage() as Message)
    }

    // Sends a message
    protected sendMessage(message: Optional<Message, 'sender'>): void {
        message.sender = this.shared.role
        message.id = haptic.utils.uuidv4()
        haptic.logService.debug('FraudChallengeWidget', 'Sending message', message)
        this.sendBroadcastMessage(<Message>message)
        const getTargetId = (role: Role): ObjectId | undefined => {
            switch (role) {
                case 'manager':
                    return this.shared.managerObjectId || undefined
                case 'side-1':
                    return this.shared.side1ObjectId || undefined
                case 'side-2':
                    return this.shared.side2ObjectId || undefined
                default:
                    haptic.utils.assertUnreachable(role)
            }
        }
        const targetId = getTargetId(message.target)
        if (!targetId) return
        const target: RealIBoardObject = BoardObjectHelper.getBoardObjectById(targetId)
        if (!target?.obj?.data?.entryPoint?.startsWith(haptic.config.entryPoint.replace('manifest.json', '').replace('index.html', '')))
            return
        try {
            const remoteFunction: (message: Message) => any = ExposeActionHelper.getExposedFunction(target, 'receiveMessage')
            if (!remoteFunction) return
            remoteFunction(message as Message)
        } catch (e) {
            return
        }
    }

    // Called when a message is received
    protected onMessage(message: Message): void {
        haptic.logService.warn('AlleoMultiWidget', 'onMessage not implemented')
    }

    protected async connectToManager(initial: boolean = false): Promise<void> {
        if (this.shared.role === 'manager') return
        if (!this.shared.managerObjectId) return
        let connected: boolean = false
        let interval: NodeJS.Timeout
        while (true) {
            const manager: RealIBoardObject = BoardObjectHelper.getBoardObjectById(this.shared.managerObjectId)
            if (
                !manager?.obj?.data?.entryPoint?.startsWith(haptic.config.entryPoint.replace('manifest.json', '').replace('index.html', ''))
            )
                return
            try {
                connected =
                    ((ExposeActionHelper.getExposedFunction(manager, 'attach') as (role: Role, widgetId: ObjectId) => boolean)?.(
                        this.shared.role,
                        haptic.widgetId,
                    ) as boolean) || false
            } catch (e) {}
            if (connected) {
                haptic.logService.debug('FraudChallengeWidget', 'Connected to manager', this.shared.role, this.shared.managerObjectId)
                if (initial && this.shared.role !== 'manager') {
                    if (interval) clearInterval(interval)
                    interval = setInterval(() => {
                        ;(ExposeActionHelper.getExposedFunction(manager, 'attach') as (role: Role, widgetId: ObjectId) => boolean)?.(
                            this.shared.role,
                            haptic.widgetId,
                        )
                    }, 5000)
                    haptic.widgetDestroyed$.subscribe(() => {
                        if (interval) clearInterval(interval)
                    })
                }
                return
            }
            await haptic.utils.sleep(333)
        }
    }

    // handles an incoming broadcast message
    private onIncomingBroadcastMessage(message: Message): void {
        if (message?.target !== this.shared.role) return
        this.onIncomingMessage(message)
    }

    // sends a broadcast message
    private sendBroadcastMessage(message: Message): void {
        haptic.sendSyncMessage(message)
    }

    // processes an incoming message. triggers callback
    private onIncomingMessage(message: Message) {
        if (message.id && this.processedMessageIds.includes(message.id)) return
        this.processedMessageIds.push(message.id)
        haptic.logService.debug('FraudChallengeWidget', 'Incoming message', message)
        this.onMessage(message)
    }
}
