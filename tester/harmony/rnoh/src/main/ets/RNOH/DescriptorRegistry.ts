import { Tag, Descriptor } from './DescriptorBase';
import { MutationType, Mutation } from './Mutation';

type RootDescriptor = Descriptor<"RootView", any>

type SubtreeListener = () => void;
type SetNativeStateFn = (componentName: string, tag: Tag, state: unknown) => void

export class DescriptorRegistry {
  private descriptorByTag: Map<Tag, Descriptor> = new Map();
  private descriptorListenersSetByTag: Map<Tag, Set<(descriptor: Descriptor) => void>> = new Map();
  private subtreeListenersSetByTag: Map<Tag, Set<SubtreeListener>> = new Map();

  constructor(
    descriptorByTag: Record<Tag, Descriptor>,
    private setNativeStateFn: SetNativeStateFn,
  ) {
    for (const tag in descriptorByTag) {
      this.descriptorByTag.set(parseInt(tag), descriptorByTag[tag])
    }
  }

  public getDescriptor<TDescriptor extends Descriptor>(tag: Tag): TDescriptor {
    return this.descriptorByTag.get(tag) as TDescriptor;
  }

  /**
   * @returns [...ancestors, descriptor]
   */
  public getDescriptorLineage(tag: Tag): Descriptor[] {
    const results: Descriptor[]  = []
    let currentTag: Tag | undefined = tag
    do {
      let descriptor = this.getDescriptor(currentTag)
      currentTag = descriptor.parentTag
      results.push(descriptor)
    } while(currentTag !== undefined);
    return results.reverse();
  }

  public setProps<TProps extends Object>(tag: Tag, props: TProps): void {
    let descriptor = this.getDescriptor<Descriptor<string, TProps>>(tag);

    if (!descriptor) {
      return;
    }

    descriptor.props = { ...descriptor.props, ...props };
    const updatedDescriptor = { ...descriptor };
    this.descriptorByTag.set(tag, updatedDescriptor);

    this.descriptorListenersSetByTag.get(tag)?.forEach(cb => cb(updatedDescriptor));
    this.callSubtreeListeners([tag]);
  }

  public setState<TState extends Object>(tag: Tag, state: TState): void {
    let descriptor = this.getDescriptor<Descriptor<string, TState>>(tag);
    if (!descriptor) {
      return;
    }

    // we don't update the local state, since Fabric will
    // supply it in a mutation
    this.setNativeStateFn(descriptor.type, tag, state);
  }

  public applyMutations(mutations: Mutation[]) {
    const updatedComponents = mutations.flatMap(mutation =>
    this.applyMutation(mutation),
    );
    const uniqueUpdated = [...new Set(updatedComponents)];
    uniqueUpdated.forEach(tag => {
      const updatedDescriptor = this.getDescriptor(tag);
      if (!updatedDescriptor) return;
      this.descriptorListenersSetByTag.get(tag)?.forEach(cb => {
        cb(updatedDescriptor)
      });
    });
    this.callSubtreeListeners(uniqueUpdated);
  }

  private callSubtreeListeners(updatedDescriptorTags: Tag[]) {
    const setOfSubtreeListenersToCall = new Set<SubtreeListener>();
    for (const tag of updatedDescriptorTags) {
      let descriptor = this.descriptorByTag.get(tag);
      while (descriptor) {
        const listeners = this.subtreeListenersSetByTag.get(descriptor.tag);
        if (listeners) {
          for (const listener of listeners) {
            setOfSubtreeListenersToCall.add(listener);
          }
        }
        if (descriptor.parentTag) {
          descriptor = this.descriptorByTag.get(descriptor.parentTag);
        } else {
          break;
        }
      }
    }
    setOfSubtreeListenersToCall.forEach(listener => {
      listener();
    });
  }

  public subscribeToDescriptorChanges(
    tag: Tag,
    listener: (descriptor: Descriptor) => void,
  ) {
    if (!this.descriptorListenersSetByTag.has(tag)) {
      this.descriptorListenersSetByTag.set(tag, new Set());
    }
    this.descriptorListenersSetByTag.get(tag)!.add(listener);
    return () => {
      this.removeDescriptorChangesListener(tag, listener);
    };
  }

  private removeDescriptorChangesListener(
    tag: Tag,
    listener: (descriptor: Descriptor) => void,
  ) {
    const callbacksSet = this.descriptorListenersSetByTag.get(tag);
    callbacksSet?.delete(listener);
    if (callbacksSet?.size === 0) {
      this.descriptorListenersSetByTag.delete(tag);
    }
  }

  public subscribeToDescriptorSubtreeChanges(
    rootTag: Tag,
    listener: SubtreeListener,
  ) {
    if (!this.subtreeListenersSetByTag.has(rootTag)) {
      this.subtreeListenersSetByTag.set(rootTag, new Set());
    }
    this.subtreeListenersSetByTag.get(rootTag)!.add(listener);

    return () => {
      const callbacksSet = this.descriptorListenersSetByTag.get(rootTag);
      callbacksSet?.delete(listener);
      if (callbacksSet?.size === 0) {
        this.descriptorListenersSetByTag.delete(rootTag);
      }
    };
  }

  private applyMutation(mutation: Mutation): Tag[] {
    if (mutation.type === MutationType.CREATE) {
      this.descriptorByTag.set(mutation.descriptor.tag, mutation.descriptor);
      return [];
    } else if (mutation.type === MutationType.INSERT) {
      const childDescriptor = this.descriptorByTag.get(mutation.childTag)!;
      childDescriptor.parentTag = mutation.parentTag;
      this.descriptorByTag.get(mutation.parentTag)?.childrenTags.splice(
        mutation.index,
        0,
        mutation.childTag,
      );
      return [mutation.childTag, mutation.parentTag];
    } else if (mutation.type === MutationType.UPDATE) {
      const currentDescriptor = this.descriptorByTag.get(mutation.descriptor.tag);
      const children = currentDescriptor!.childrenTags;
      const newDescriptor = {
        ...currentDescriptor,
        ...mutation.descriptor,
        props: { ...currentDescriptor?.props, ...mutation.descriptor.props },
        childrenTags: children,
      };
      this.descriptorByTag.set(mutation.descriptor.tag, newDescriptor);
      return [mutation.descriptor.tag];
    } else if (mutation.type === MutationType.REMOVE) {
      const parentDescriptor = this.descriptorByTag.get(mutation.parentTag)!;
      const childDescriptor = this.descriptorByTag.get(mutation.childTag)!;
      const idx = parentDescriptor.childrenTags.indexOf(mutation.childTag);
      if (idx != -1) {
        parentDescriptor.childrenTags.splice(idx, 1);
      }
      childDescriptor.parentTag = undefined;
      return [mutation.parentTag];
    } else if (mutation.type === MutationType.DELETE) {
      this.descriptorByTag.delete(mutation.tag);
      return [];
    } else if (mutation.type === MutationType.REMOVE_DELETE_TREE) {
      return [];
    }
    return [];
  }

  public createRootDescriptor(tag: Tag) {
    const rootDescriptor: RootDescriptor = {
      isDynamicBinder: false,
      type: 'RootView',
      tag,
      childrenTags: [],
      props: { top: 0, left: 0, width: 0, height: 0 },
      state: {},
      layoutMetrics: {
        frame: {
          origin: {
            x: 0,
            y: 0,
          },
          size: {
            width: 0,
            height: 0,
          }
        }
      }
    }
    this.descriptorByTag.set(tag, rootDescriptor)
  }

  public deleteRootDescriptor(tag: Tag) {
    const descriptor = this.getDescriptor(tag);
    if (descriptor?.type !== "RootView") {
      return;
    }
    // delay deleting the root descriptor until the mutation
    // removing all its children has been applied
    if (descriptor.childrenTags.length === 0) {
      this.descriptorByTag.delete(tag);
      return;
    }
    const unsubscribe = this.subscribeToDescriptorChanges(tag, (newDescriptor) => {
      if (newDescriptor.childrenTags.length === 0) {
        unsubscribe();
        this.descriptorByTag.delete(tag);
      }
    });
  }

  public getDescriptorByTagMap() {
    return this.descriptorByTag
  }
}
