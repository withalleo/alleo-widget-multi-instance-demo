import { AnalyticsHelper, AssetHelper, ResizeHelper } from 'alleoWidgetUtils'
import { ManagerSelectorSettingsDialogHelper } from './ManagerSelectorSettingsDialogHelper'
import { AlleoMultiWidget, Message, ObjectId, Role } from './AlleoMultiWidget'

// These are the variable that are synced between all instances of this widget (but not between the 3 different widgets)
// these are available via the this.shared object within the widget
const multiInstanceDemoWidgetDefaultSharedVariables = {
    'role': <Role>'manager',
    'managerObjectId': <ObjectId | undefined>undefined,
    'side1ObjectId': <ObjectId | undefined>undefined,
    'side2ObjectId': <ObjectId | undefined>undefined,
}

// Add the widget instance.
// AlleoMultiWidget will set up a system of communication between multiple widgets on the same board.
class MultiInstanceDemoWidget extends AlleoMultiWidget<typeof multiInstanceDemoWidgetDefaultSharedVariables> {
    // initialize the widget when the page loads
    constructor() {
        super(multiInstanceDemoWidgetDefaultSharedVariables)

        // define the settings dialog. Angular Formly will be used to show the settings dialog,
        // the saved values will be stored in the widget's shared variables
        const settings = new ManagerSelectorSettingsDialogHelper({
            fields: [
                {
                    key: 'role',
                    type: 'select',
                    defaultValue: this.shared.role,
                    props: {
                        label: 'Position of this widget',
                        options: [
                            { label: 'Center (Manager)', value: <Role>'manager' },
                            {
                                label: 'Left Side',
                                value: <Role>'side-1',
                            },
                            { label: 'Right Side', value: <Role>'side-2' },
                        ],
                    },
                },
                {
                    key: 'managerObjectId',
                    type: 'select',
                    defaultValue: this.shared.managerObjectId,
                    // NOTE: in ManagerSelectorSettingsDialogHelper we set up a system that will automatically populate this dropdown with all available manager widgets on the board
                    props: {
                        label: 'Manager',
                    },
                    expressions: {
                        hide: 'model.role === "manager"',
                    },
                },
            ],
        })

        // Allow axis-independent resizing.
        // This will update the --widget-width and --widget-height CSS variables as well.
        new ResizeHelper({ width: 180, height: 100 })

        // Widgets are loaded and run from the board. Relative urls will not work. Use AssetHelper.assetsRoot to reference the public/widgetAssets folder.
        // So we have to initialize the background image via CSS.
        new AssetHelper().setupCSSUrls([
            {
                query: '', // This is a CSS selector query. You can use any valid CSS selector here. it's empty because we're referencing the widget container.
                variable: 'background-image',
                value: AssetHelper.assetsRoot + 'sample.png',
            },
        ])

        // if the new color button is clicked, set a random color for all widgets
        this.domSelect('button.new-color').onclick = () => this.setRandomColorForAllWidgets()

        // if we just added the widget to the board, let's open the settings dialog
        if (haptic.creation) settings.openSettingsDialog()

        // COMMON SAMPLES

        // this.dom is the root element of the widget. It is a div element.

        // you can use the this.domSelect() function to select a dom element inside your widget (á la querySelector)


        // if the role shared variable changes, let's do something... it is very practical, since the shared variable might be changes in an other browser.
        // This way we can make status consistent between browsers.
        // this.shared.role will update automatically

        /*
            haptic.getFieldChanged$('role').subscribe((newRole) => this.letsDoSomething(newRole))
         */

        // you can disable normal board interactions for a dom object in your widget.
        // eg. normally if you grab your widget, it will be moved around the board.
        // However, if you want to set up a draggable/scrollable element, you can use this trick:

        /*
            new EventDisableHelper(this.domSelect('.grab-handler'), EventDisableHelper.POINTER_EVENTS).autoManage()
         */

        // you can set up a color picker for your widget
        /*
            new ColorPickerHelper('fontColor', '--widget-font-color', this.shared.fontColor, {
                label: 'Font Color',
                icon: { icon: 'text', set: 'fas' },
                palette: ColorPalette.StickyNote,
                includeTransparent: false,
            })
         */

        // you can set up object action triggers, and you can accept incoming triggers
        /*

            // you can define an outgoing object action
                haptic.actionTriggers = [
                    {
                        id: 'widget-demo-action-trigger',
                        label: 'Pressed button in the widget',
                    },
                ]
            // you can trigger this with
                haptic.triggerAction('widget-demo-action-trigger')

            // you can also define an incoming object action
                haptic.actionEffects = [
                    {
                        id: 'widget-demo-incoming-trigger',
                        callback: () => this.doSomething(),
                        label: 'The widget will do something when this action is triggered',
                    },
                ]
        */

        // if your widget requires scrolling, we strongly recommend the use of the ScrollHelper.
        // Note: by default the widget will be scrollable individually.
        // But if someone is presenting (or leading), the scroll positions will be synced to the presenter's widget.
        /*
            new ScrollHelper(this.domSelect('.scrollable-container'))
         */
    }

    // sets a random color for all connected widgets
    public setRandomColorForAllWidgets(): void {
        // function that generates a random color
        const getRandomColor = () => {
            const letters = '0123456789ABCDEF'
            let color = '#'
            for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)]
            return color
        }
        const color = getRandomColor()

        // let's set the color locally
        this.setThisWidgetColor(color)
        // the manager instance should notify the sides.
        // the sides should notify the manager instance.
        if (this.shared.role === 'manager') {
            this.sendMessage({
                target: 'side-1',
                payload: {
                    color: color,
                },
            })
            this.sendMessage({
                target: 'side-2',
                payload: {
                    color: color,
                },
            })
        } else {
            this.sendMessage({
                target: 'manager',
                payload: {
                    color: color,
                },
            })
        }
    }

    // Called when a message is received
    protected override onMessage(message: Message): void {
        // this debug message will be visible in the console only in dev, and insert a prefix, otherwise the same as console.log.
        AnalyticsHelper.debug('Received message', this.shared.role, message)
        if (!message?.payload?.color) throw new Error('There was no color in the message')
        this.setThisWidgetColor(message.payload.color)
        if (this.shared.role === 'manager') {
            if (message?.sender === 'side-1') {
                this.sendMessage({
                    target: 'side-2',
                    payload: {
                        color: message.payload.color,
                    },
                })
            } else if (message?.sender === 'side-2') {
                this.sendMessage({
                    target: 'side-1',
                    payload: {
                        color: message.payload.color,
                    },
                })
            }
        }
    }

    // sets the background color of this widget via CSS
    private setThisWidgetColor(color: string): void {
        this.dom.style.setProperty('--widget-background-color', color)
    }
}

new MultiInstanceDemoWidget()
