/** 0-1 */
export type NormalizedScalar = number

/** RGBA */
export type Color = [
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar,
  NormalizedScalar
]

export type BaseDescriptorProps = {
  top: number
  left: number
  width: number
  height: number
}

export type Tag = number

export type ViewDescriptorProps = BaseDescriptorProps & {
  backgroundColor?: Color
}

export type ViewDescriptorData = {
  type: 'View'
  tag: Tag
  props: ViewDescriptorProps
}

export type DescriptorData = ViewDescriptorData

export type CreateMutation = {
  type: MutationType.CREATE
  descriptor: DescriptorData
}

export type DeleteMutation = {
  type: MutationType.DELETE
  tag: Tag
}

export type InsertMutation = {
  type: MutationType.INSERT
  parentTag: Tag
  childTag: Tag
}

export type RemoveMutation = {
  type: MutationType.REMOVE
  parentTag: Tag
  childTag: Tag
}

export type UpdateMutation = {
  type: MutationType.UPDATE
  descriptor: DescriptorData
}

export type Mutation =
CreateMutation
  | DeleteMutation
  | InsertMutation
  | RemoveMutation
  | UpdateMutation

export enum MutationType {
  CREATE = 1,
  DELETE = 2,
  INSERT = 4,
  REMOVE = 8,
  UPDATE = 16,
  REMOVE_DELETE_TREE = 32,
}

export class Descriptor {
  childrenTags: Tag[] = []

  public applyUpdate(data: DescriptorData) {
    console.log(JSON.stringify(data));
  }
}

export class ViewDescriptor extends Descriptor {
  constructor(public data: ViewDescriptorData) {
    super()
  }
}

export class DescriptorRegistry {
  descriptorByTag: Record<Tag, Descriptor>

  constructor(descriptorByTag: Record<Tag, Descriptor>) {
    this.descriptorByTag = descriptorByTag
  }

  public applyMutations(mutations: Mutation[]) {
    mutations.forEach((mutation) => this.applyMutation(mutation));
    // the record needs to be copied to apply updates to Ark Components.
    // TODO: figure out how to only update the components which actually changed
    this.descriptorByTag = {...this.descriptorByTag}
  }

  private applyMutation(mutation: Mutation) {
    if (mutation.type === MutationType.CREATE) {
      if (mutation.descriptor.type === 'View') {
        this.descriptorByTag[mutation.descriptor.tag] = new ViewDescriptor(
        mutation.descriptor
        )
      }
    }
    else if (mutation.type === MutationType.INSERT) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag];
      parentDescriptor.childrenTags.push(mutation.childTag)
    }
    else if (mutation.type === MutationType.UPDATE) {
      const descriptor = this.descriptorByTag[mutation.descriptor.tag];
      descriptor.applyUpdate(mutation.descriptor);
    }
    else if (mutation.type === MutationType.REMOVE) {
      const parentDescriptor = this.descriptorByTag[mutation.parentTag];
      const idx = parentDescriptor.childrenTags.indexOf(mutation.childTag);
      if (idx != -1) {
        parentDescriptor.childrenTags.splice(idx, 1);
      }
    }
    else if (mutation.type === MutationType.DELETE) {
      delete this.descriptorByTag[mutation.tag];
    }
  }
}
