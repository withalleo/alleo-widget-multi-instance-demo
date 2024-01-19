const boardEmbedScopes = [
    'Room',
    'RoomLegacy',
    'RoomInteractive',
    'RoomSimplified',
    'RoomScreensaver',
    'RoomWeb',
    'RoomWebScreensaver',
] as const
type BoardEmbedScope = (typeof boardEmbedScopes)[number]

export class BrowserContextHelper {
    public static getEmbedScope(): BoardEmbedScope | string | undefined {
        const getGetVariable = (name: string): string | undefined => {
            const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
            if (!match) return undefined
            return decodeURIComponent(match[1].replace(/\+/g, ' ')).trim()
        }
        return getGetVariable('embedScope')
    }
    public static isRoomApp(): boolean {
        return boardEmbedScopes.includes(BrowserContextHelper.getEmbedScope() as BoardEmbedScope)
    }
}
