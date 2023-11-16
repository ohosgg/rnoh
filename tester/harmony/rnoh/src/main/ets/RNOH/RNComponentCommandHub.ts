import type {Tag} from './DescriptorBase';

export type CommandCallback = (command: string, args: unknown) => void;

/**
 * Part of the public API. Custom fabric components may listen to commands dispatched from RN.
 */
export class RNComponentCommandReceiver {
  protected commandCallbacks: Map<Tag, CommandCallback[]> = new Map();

  public registerCommandCallback(
    tag: Tag,
    callback: (command: string, args: unknown) => void,
  ) {
    this.commandCallbacks.set(tag, [
      ...(this.commandCallbacks.get(tag) || []),
      callback,
    ]);

    return () => {
      // check that the callback is still registered
      const callbacks = this.commandCallbacks.get(tag) || [];
      const idx = callbacks.indexOf(callback);
      // remove the callback
      if (idx != -1) {
        callbacks.splice(idx, 1);
      }
      // remove the tag from the map if there are no more callbacks
      if (callbacks.length === 0) {
        this.commandCallbacks.delete(tag);
      }
    };
  }
}


export class RNComponentCommandHub extends RNComponentCommandReceiver {
  public dispatchCommand(tag: Tag, command: string, args: unknown) {
    this.commandCallbacks
      .get(tag)
      ?.forEach(callback => callback(command, args));
  }
}

/**
 * @deprecated: Use RNCommandHub instead.
 * From the perspective of the native side, we don't dispatch commands but only relay them. Commands are dispatched from
 * the JS side.
 */
export type CommandDispatcher = RNComponentCommandHub;
