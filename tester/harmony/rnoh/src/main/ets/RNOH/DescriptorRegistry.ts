import matrix4 from '@ohos.matrix4';
import { Tag, Descriptor, OverflowMode } from './DescriptorBase';
import { MutationType, Mutation } from './Mutation';

type RootDescriptor = Descriptor<"RootView", any>

type SubtreeListener = () => void;
type SetNativeStateFn = (componentName: string, tag: Tag, state: unknown) => void

type ComponentBoundingBox = {
  left: number,
  right: number,
  top: number,
  bottom: number,
}

export class DescriptorRegistry {
  private descriptorByTag: Map<Tag, Descriptor> = new Map();
  private descriptorListenersSetByTag: Map<Tag, Set<(descriptor: Descriptor) => void>> = new Map();
  private subtreeListenersSetByTag: Map<Tag, Set<SubtreeListener>> = new Map();
  private componentBoundingBoxByTag: Map<Tag, ComponentBoundingBox> = new Map();

  constructor(descriptorByTag: Record<Tag, Descriptor>, private setNativeStateFn: SetNativeStateFn) {
    for (const tag in descriptorByTag) {
      this.descriptorByTag.set(parseInt(tag), descriptorByTag[tag])
    }
  }

  public getDescriptor<TDescriptor extends Descriptor>(tag: Tag): TDescriptor {
    return this.descriptorByTag.get(tag) as TDescriptor;
  }

  public getBoundingBox(tag: Tag): ComponentBoundingBox {
    return this.componentBoundingBoxByTag.get(tag) || { left: 0, right: 0, top: 0, bottom: 0 };
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
    this.updateBoundingBoxes(tag);

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
      this.componentBoundingBoxByTag.set(mutation.descriptor.tag, this.calculateBoundingBox(mutation.descriptor.tag));
      return [];
    } else if (mutation.type === MutationType.INSERT) {
      const childDescriptor = this.descriptorByTag.get(mutation.childTag)!;
      childDescriptor.parentTag = mutation.parentTag;
      this.descriptorByTag.get(mutation.parentTag)?.childrenTags.splice(
        mutation.index,
        0,
        mutation.childTag,
      );
      this.updateBoundingBoxes(mutation.parentTag);
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
      this.updateBoundingBoxes(mutation.descriptor.tag);
      return [mutation.descriptor.tag];
    } else if (mutation.type === MutationType.REMOVE) {
      const parentDescriptor = this.descriptorByTag.get(mutation.parentTag)!;
      const childDescriptor = this.descriptorByTag.get(mutation.childTag)!;
      const idx = parentDescriptor.childrenTags.indexOf(mutation.childTag);
      if (idx != -1) {
        parentDescriptor.childrenTags.splice(idx, 1);
      }
      this.updateBoundingBoxes(mutation.parentTag);
      childDescriptor.parentTag = undefined;
      return [mutation.parentTag];
    } else if (mutation.type === MutationType.DELETE) {
      this.descriptorByTag.delete(mutation.tag);
      this.componentBoundingBoxByTag.delete(mutation.tag);
      return [];
    } else if (mutation.type === MutationType.REMOVE_DELETE_TREE) {
      return [];
    }
    return [];
  }

  private updateBoundingBoxes(tag: Tag) {
    let descriptor = this.getDescriptor(tag);
    while (descriptor) {
      const previousBoundingBox = this.componentBoundingBoxByTag.get(tag);
      const newBoundingBox = this.calculateBoundingBox(tag);
      const boundingBoxChanged = !previousBoundingBox 
        || previousBoundingBox.left !== newBoundingBox.left 
        || previousBoundingBox.right !== newBoundingBox.right 
        || previousBoundingBox.top !== newBoundingBox.top 
        || previousBoundingBox.bottom !== newBoundingBox.bottom
      if (!boundingBoxChanged) {
        // no need to update the views above
        break;
      }
      this.componentBoundingBoxByTag.set(tag, newBoundingBox);
      if (descriptor.type === "ModalHostView") {
        break;
      }
      const parentTag = descriptor.parentTag;
      if (!parentTag) {
        break;
      }
      const parentDescriptor = this.getDescriptor(parentTag);
      descriptor = parentDescriptor;
      tag = parentTag;
    }
  }

  private calculateBoundingBox(tag: Tag): ComponentBoundingBox {
    const descriptor = this.getDescriptor(tag);
    if (!descriptor) {
      return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    const {origin, size} = descriptor.layoutMetrics.frame;
    let boundingBox = { left: origin.x, right: origin.x+size.width, top: origin.y, bottom: origin.y+size.height };

    // if the view has overflow, take children into account:
    if ('overflow' in descriptor.props && descriptor.props['overflow'] === OverflowMode.VISIBLE) {
      for (const childTag of descriptor.childrenTags) {
        const childDescriptor = this.getDescriptor(childTag);
        const childBoundingBox = this.componentBoundingBoxByTag.get(childTag);
        // since modals aren't rendered inside the view, we ignore them
        // when calculating the bounding box
        if (!childBoundingBox || !childDescriptor || childDescriptor.type === "ModalHostView") {
          continue;
        }
        boundingBox.left = Math.min(boundingBox.left, childBoundingBox.left + origin.x);
        boundingBox.right = Math.max(boundingBox.right, childBoundingBox.right + origin.x);
        boundingBox.top = Math.min(boundingBox.top, childBoundingBox.top + origin.y);
        boundingBox.bottom = Math.max(boundingBox.bottom, childBoundingBox.bottom + origin.y);
      }
    }

    // apply the transform to the view's bounding box
    if ('transform' in descriptor.props) {
      const transformMatrix = matrix4.init(descriptor.props['transform'] as any);
      const [left, top] = transformMatrix.transformPoint([boundingBox.left, boundingBox.top]);
      const [right, bottom] = transformMatrix.transformPoint([boundingBox.right, boundingBox.bottom]);
      boundingBox = {
        left: Math.min(left, right),
        right: Math.max(left, right),
        top: Math.min(top, bottom),
        bottom: Math.max(top, bottom),
      }
    }

    return boundingBox;
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
