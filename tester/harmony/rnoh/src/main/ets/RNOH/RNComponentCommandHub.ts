import type {Tag} from './DescriptorBase';

export type CommandCallback = (command: string, args: unknown) => void;

/**
 * Part of the public API. Custom fabric components may listen to commands dispatched from RN.
 */
export class RNComponentCommandReceiver {
  protected commandCallbacks: Map<Tag, CommandCallback[]> = new Map();

  // sometimes the command is dispatched before its target registers itself.
  // In those cases, we keep the commands with no registered callbacks in a backlog,
  // and when the first callback is registered, we dispatch all the commands in the backlog to it.
  // TODO: delete stale entries (keep a max count, after a timeout, or both)
  protected commandBacklogByTag: Map<Tag, { command: string, args: unknown }[]> = new Map();

  public registerCommandCallback(
    tag: Tag,
    callback: (command: string, args: unknown) => void,
  ) {
    this.commandCallbacks.set(tag, [
      ...(this.commandCallbacks.get(tag) || []),
      callback,
    ]);

    // deliver commands from the backlog.
    // If there already were some callbacks registered, the backlog will be empty,
    // and this is a noop.
    // Otherwise, we are the first (and only) callback, so we don't need to iterate over cbs
    const commandBacklog = this.commandBacklogByTag.get(tag) ?? [];
    commandBacklog.forEach(({command, args}) => callback(command, args));
    this.commandBacklogByTag.delete(tag);

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
    const callbacks = this.commandCallbacks.get(tag);

    // if callbacks are already set, just call them
    if (callbacks) {
      callbacks.forEach(callback => callback(command, args));
      return;
    }

    // otherwise, we add the command to the backlog,
    // to be called once a command callback is registered
    this.commandBacklogByTag.set(tag, [
      ...(this.commandBacklogByTag.get(tag) || []),
      {command, args},
    ]);
  }
}

/**
 * @deprecated: Use RNCommandHub instead.
 * From the perspective of the native side, we don't dispatch commands but only relay them. Commands are dispatched from
 * the JS side.
 */
export type CommandDispatcher = RNComponentCommandHub;
