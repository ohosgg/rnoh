import type { Tag, Descriptor } from './DescriptorBase';
import type { Mutation } from './Mutation';
import { MutationType } from './Mutation';
import type { RNInstanceImpl } from './RNInstance'

type RootDescriptor = Descriptor<"RootView", any>

type SubtreeListener = () => void;
type SetNativeStateFn = (componentName: string, tag: Tag, state: unknown) => void

export class DescriptorRegistry {
  private descriptorByTag: Map<Tag, Descriptor> = new Map();
  private descriptorListenersSetByTag: Map<Tag, Set<(descriptor: Descriptor) => void>> = new Map();
  private subtreeListenersSetByTag: Map<Tag, Set<SubtreeListener>> = new Map();
  private updatedUnnotifiedTags = new Set<Tag>()
  private cleanUpCallbacks: (() => void)[] = []

  constructor(
    descriptorByTag: Record<Tag, Descriptor>,
    private setNativeStateFn: SetNativeStateFn,
    private rnInstance: RNInstanceImpl,
  ) {
    for (const tag in descriptorByTag) {
      this.descriptorByTag.set(parseInt(tag), descriptorByTag[tag])
    }
    this.cleanUpCallbacks.push(this.rnInstance.subscribeToLifecycleEvents("FOREGROUND", () => {
      this.callListeners(this.updatedUnnotifiedTags)
      this.updatedUnnotifiedTags.clear()
    }))
  }

  public destroy() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  public getDescriptor<TDescriptor extends Descriptor>(tag: Tag): TDescriptor {
    return this.descriptorByTag.get(tag) as TDescriptor;
  }

  /**
   * @returns [...ancestors, descriptor]
   */
  public getDescriptorLineage(tag: Tag): Descriptor[] {
    const results: Descriptor[] = []
    let currentTag: Tag | undefined = tag
    do {
      let descriptor = this.getDescriptor(currentTag)
      currentTag = descriptor.parentTag
      results.push(descriptor)
    } while (currentTag !== undefined);
    return results.reverse();
  }

  /**
   * Called by NativeAnimatedTurboModule. This method needs to be encapsulated.
   */
  public setProps<TProps extends Object>(tag: Tag, props: TProps): void {
    let descriptor = this.getDescriptor<Descriptor<string, TProps>>(tag);

    if (!descriptor) {
      return;
    }

    descriptor.props = { ...descriptor.props, ...props };
    descriptor.rawProps = { ...descriptor.rawProps, ...props };
    const updatedDescriptor = { ...descriptor };
    this.descriptorByTag.set(tag, updatedDescriptor);

    this.descriptorListenersSetByTag.get(tag)?.forEach(cb => cb(updatedDescriptor));
    this.callSubtreeListeners(new Set([tag]));
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
    const updatedDescriptorTags = new Set(mutations.flatMap(mutation =>
    this.applyMutation(mutation)
    ));
    if (!this.rnInstance.shouldUIBeUpdated()) {
      updatedDescriptorTags.forEach(tag => this.updatedUnnotifiedTags.add(tag))
      return;
    }
    this.callListeners(updatedDescriptorTags)
  }

  private callListeners(tags: Set<Tag>): void {
    tags.forEach(tag => {
      const updatedDescriptor = this.getDescriptor(tag);
      if (!updatedDescriptor) return;
      this.descriptorListenersSetByTag.get(tag)?.forEach(cb => {
        cb(updatedDescriptor)
      });
    });
    this.callSubtreeListeners(tags);
  }

  private callSubtreeListeners(updatedDescriptorTags: Set<Tag>) {
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
      this.descriptorByTag.set(mutation.descriptor.tag, this.maybeOverwriteProps(mutation.descriptor));
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
      const mutationDescriptor = this.maybeOverwriteProps(mutation.descriptor)
      const newDescriptor = {
        ...currentDescriptor,
        ...mutation.descriptor,
        props: { ...currentDescriptor!.props, ...mutationDescriptor.props },
        rawProps: { ...currentDescriptor!.rawProps, ...mutationDescriptor.rawProps },
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

  private maybeOverwriteProps(descriptor: Descriptor) {
    /**
     * This is done to avoid creating breaking changes. Previously isDynamicBinder indicated that a third party package
     * didn't provided explicit NapiBinder and props were generated from rawProps. Currently, however descriptors have
     * rawProps property which can be used instead. `isDynamicBinder` and this change is going to be removed in the
     * future.
     */
    const props = descriptor.isDynamicBinder ? descriptor.rawProps : descriptor.props
    return {...descriptor, props}
  }

  public createRootDescriptor(tag: Tag) {
    const rootDescriptor: RootDescriptor = {
      isDynamicBinder: false,
      type: 'RootView',
      tag,
      childrenTags: [],
      props: { top: 0, left: 0, width: 0, height: 0 },
      state: {},
      rawProps: {},
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
