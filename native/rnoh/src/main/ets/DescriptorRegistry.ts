import { Tag, Descriptor } from './descriptor'
import { MutationType, Mutation } from './mutations'

export class DescriptorRegistry {
  descriptorByTag: Record<Tag, Descriptor>

  constructor(descriptorByTag: Record<Tag, Descriptor>) {
    this.descriptorByTag = descriptorByTag
  }

  public getDescriptor<TDescriptor extends Descriptor>(tag: Tag): TDescriptor {
    return this.descriptorByTag[tag.toString()] as TDescriptor
  }

  public applyMutations(mutations: Mutation[]) {
    mutations.forEach((mutation) => this.applyMutation(mutation))
    // The record needs to be copied to apply updates to Ark Components.
    this.descriptorByTag = { ...this.descriptorByTag }
  }

  private applyMutation(mutation: Mutation) {
    if (mutation.type === MutationType.CREATE) {
      this.descriptorByTag[mutation.descriptor.tag] = mutation.descriptor
    } else if (mutation.type === MutationType.INSERT) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag]
      parentDescriptor.childrenTags.push(mutation.childTag)
    } else if (mutation.type === MutationType.UPDATE) {
      const currentDescriptor = this.descriptorByTag[mutation.descriptor.tag]
      this.descriptorByTag[mutation.descriptor.tag] = {
        ...currentDescriptor,
        ...mutation.descriptor,
      }
    } else if (mutation.type === MutationType.REMOVE) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag]
      const idx = parentDescriptor.childrenTags.indexOf(mutation.childTag)
      if (idx != -1) {
        parentDescriptor.childrenTags.splice(idx, 1)
      }
    } else if (mutation.type === MutationType.DELETE) {
      delete this.descriptorByTag[mutation.tag]
    }
  }
}
