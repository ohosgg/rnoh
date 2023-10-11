import type { Tag } from './DescriptorBase'

export type CommandCallback = (command: string, args: unknown) => void

export class CommandDispatcher {
  private commandCallbacks: Map<Tag, CommandCallback[]> = new Map()

  public registerCommandCallback(tag: Tag, callback: (command: string, args: unknown) => void) {
    this.commandCallbacks.set(tag, [...this.commandCallbacks.get(tag) || [], callback])

    return () => {
      // check that the callback is still registered
      const callbacks = this.commandCallbacks.get(tag) || []
      const idx = callbacks.indexOf(callback)
      // remove the callback
      if (idx != -1) {
        callbacks.splice(idx, 1)
      }
      // remove the tag from the map if there are no more callbacks
      if (callbacks.length === 0) {
        this.commandCallbacks.delete(tag)
      }
    }
  }

  public dispatchCommand(tag: Tag, command: string, args: unknown) {
    this.commandCallbacks.get(tag)?.forEach((callback) => callback(command, args))
  }
}