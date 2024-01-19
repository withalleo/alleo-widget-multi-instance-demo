import { RealIBoardObject } from './ExposeActionHelper'
import { BoardFabricObjectType } from "alleo";

export class BoardObjectHelper {
    public static addObjectToContainer(container: RealIBoardObject, elem: RealIBoardObject): void {
        if (!container?.obj?.managedObjects || !elem?.obj?.id)
            throw new Error('addObjectToContainer: container or elem does not seems to be a proper board objects')
        if (container.obj.managedObjects.includes(elem.obj.id)) {
            haptic.logService.debug('addObjectToContainer: elem is already in container')
            return
        }
        container.obj.managedObjects.push(elem.obj.id)
        elem.obj._containerObjectInstance = container.obj
        if (elem.obj.changeSelectionState) elem.obj.changeSelectionState(elem.obj.isLocked)
        elem.obj.fire('container:added', { container: container.obj, target: elem.obj })
        container.obj.fire('container:added', { container: container.obj, target: elem.obj })
        container.obj.fire('managedobjects:changed', { target: container.obj, added: [elem.obj] })
        container.obj.canvas?.fire('container:managedobjects:changed', { target: container.obj, added: [elem.obj] })
        container.obj.repositionObjects(false)
    }

    public static removeObjectFromContainer(container: RealIBoardObject, elem: RealIBoardObject): void {
        if (!container?.obj?.managedObjects || !elem?.obj?.id)
            throw new Error('removeObjectFromContainer: container or elem does not seems to be a proper board objects')
        if (!container.obj.managedObjects.includes(elem.obj.id)) {
            haptic.logService.debug('removeObjectFromContainer: elem is not in container')
            return
        }
        container.obj.managedObjects = container.obj.managedObjects.filter((id) => id !== elem.obj.id)
        elem.obj._containerObjectInstance = undefined
        if (elem.obj.changeSelectionState) elem.obj.changeSelectionState(elem.obj.isLocked)
        elem.obj.fire('container:removed', { container: container.obj, target: elem.obj })
        container.obj.fire('container:removed', { container: container.obj, target: elem.obj })
        container.obj.fire('managedobjects:changed', { target: container.obj, removed: [elem.obj] })
        container.obj.canvas?.fire('container:managedobjects:changed', { target: container.obj, removed: [elem.obj] })
        container.obj.repositionObjects(false)
    }

    public static getBoardObjectById(id: string): RealIBoardObject {
        return haptic.board.objects.getAll().find((obj) => obj.id === id) as RealIBoardObject
    }

    public static editTextContent(textObject: RealIBoardObject, text: string): void {
        if (!textObject?.obj?.id) throw new Error('BoardObjectHelper editTextContent: textObject does not seems to be a proper board objects')
        if (textObject.type !== BoardFabricObjectType.Text) throw new Error('BoardObjectHelper editTextContent: textObject is not a text object')
        textObject.obj.textLines = [text]
        textObject.obj._templateText = text
        textObject.obj._text = [...text]

        textObject.obj.fire('editing:exited');
        textObject.obj.fire('modified');
        textObject.obj.fire('modified', { target: textObject.obj })
        textObject.obj.fire('editing:exited', { target: textObject.obj })
        textObject.obj.canvas?.fire('text:editing:exited', { target: textObject.obj })
        textObject.obj.canvas?.fire('object:modified', { target: textObject.obj })
    }
}
