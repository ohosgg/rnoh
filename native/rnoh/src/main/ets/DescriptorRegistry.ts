import { Tag, Descriptor } from './descriptor'
import { MutationType, Mutation } from './mutations'

export class DescriptorRegistry {
  descriptorByTag: Record<Tag, Descriptor>
  componentUpdateCallbacks: Map<Tag, (descriptor: Descriptor) => void> = new Map();

  constructor(descriptorByTag: Record<Tag, Descriptor>) {
    this.descriptorByTag = descriptorByTag
  }

  public getDescriptor<TDescriptor extends Descriptor>(tag: Tag): TDescriptor {
    return this.descriptorByTag[tag.toString()] as TDescriptor
  }

  public applyMutations(mutations: Mutation[]) {
    const updatedComponents = mutations
      .flatMap((mutation) => this.applyMutation(mutation))
    const uniqueUpdated = [...new Set(updatedComponents)]
    uniqueUpdated.forEach((tag) => {
      const updatedDescriptor = this.getDescriptor(tag);
      // NOTE: we use the spread operator here, to create a shallow
      // copy of the descriptor object. This will cause the subscribed
      // component to update
      this.componentUpdateCallbacks.get(tag)?.({...updatedDescriptor})
    })
  }

  public registerComponentUpdateCallback(tag: Tag, callback: (descriptor: Descriptor) => void) {
    this.componentUpdateCallbacks.set(tag, callback)

    return () => {
      if (this.componentUpdateCallbacks.get(tag) === callback) {
        this.componentUpdateCallbacks.delete(tag)
      }
    }
  }

  private applyMutation(mutation: Mutation): Tag[] {
    console.log("[RNOH] mutation: ", JSON.stringify(mutation))
    if (mutation.type === MutationType.CREATE) {
      this.descriptorByTag[mutation.descriptor.tag] = mutation.descriptor
      return []
    } else if (mutation.type === MutationType.INSERT) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag]
      parentDescriptor.childrenTags.push(mutation.childTag)
      return [mutation.childTag, mutation.parentTag]
    } else if (mutation.type === MutationType.UPDATE) {
      const currentDescriptor = this.descriptorByTag[mutation.descriptor.tag]
      this.descriptorByTag[mutation.descriptor.tag] = {
        ...currentDescriptor,
        ...mutation.descriptor,
      }
      return [mutation.descriptor.tag]
    } else if (mutation.type === MutationType.REMOVE) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag]
      const idx = parentDescriptor.childrenTags.indexOf(mutation.childTag)
      if (idx != -1) {
        parentDescriptor.childrenTags.splice(idx, 1)
      }
      return [mutation.parentTag]
    } else if (mutation.type === MutationType.DELETE) {
      delete this.descriptorByTag[mutation.tag]
      return []
    }
  }
}
