# Multi Instance Demo Widget Boilerplate

This is a demo boilerplate for an Alleo (or compatible) widget. 

It showcases the basic workings of a widget, that can be added to a board multiple times, 
and these added widgets can be configured to communicate with each other (acting like a secondary display.)

On a typical installation, you'd have a manager added first, and then 2 side displays.

When added to a board the widget settings will open. Make sure to assign the widget as a manager or a side display. If it is a side-display you have to select the manager as well.

## Code

The widget code is in the `src` folder. The `main.ts` file is the entry point for the widget. 
The `style.scss` file contains the widget styles. 
The `index.html` file is the HTML template for the widget. 

The `manifest.json` file contains the widget metadata. This is used by the Alleo platform to display the widget in the widget library.

The `lib` folder contains the Alleo Widget Library.

The `public/assets` folder contains the icon, preview video and other library elements. It can also contain a widgetAssets folder, which will be copied to the dist folder when building the widget, and it's contents can be referenced with the AssetHelper utility.

The `AlleoMultiWidget` class defines an Alleo widget that has multiple instances on a board. It also contains the logic to communicate with other instances of the widget on the board.

The `ManagerSelectorSettingsDialogHelper` is a settings dialog variant that contains the proper selector for the manager widget.

## Install & build

```npm install```

```npm run build-prod```

If the build is successful, the widget will be available in the `dist` folder.

To publish a widget, you will need to have a whitelisted domain to host the widget from (or include it with your on-prem installation). (HTTPS is required.)

Just upload the contents of the `dist` folder to your server, and when adding a widget, point to the uploaded `manifest.json` file.


## General Development Advice

 - To get acquainted with Alleo widgets and capabilities, please see the [widget documentation](https://meet.withalleo.com/widget-docs/) as a reference.
 - Have a look at the Alleo Widget Library in `lib/`. This contains a lot of useful stuff to make your life easier.
 - It might be required to bump the version number in the manifest file before publishing a new version of the widget. (Be mindful of caching issues!)
   - When developing/testing in the browser: in the dev panel, go to network and turn off caching. Otherwise, the browser will cache your widget, even if you hard-reload.
