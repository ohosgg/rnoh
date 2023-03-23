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

export type InsertMutation = {
  type: MutationType.INSERT
  parentTag: Tag
  childTag: Tag
}

export type Mutation = CreateMutation | InsertMutation

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
}

export function updateDescriptorByTagFromMutations(
  descriptorByTag: Record<Tag, Descriptor>,
  mutations: Mutation[]
) {
  const newDescriptorByTag = { ...descriptorByTag }
  for (const mutation of mutations) {
    if (mutation.type === MutationType.CREATE) {
      if (mutation.descriptor.type === 'View') {
        newDescriptorByTag[mutation.descriptor.tag] = new ViewDescriptor(
          mutation.descriptor
        )
      }
    } else if (mutation.type === MutationType.INSERT) {
      newDescriptorByTag[mutation.parentTag].childrenTags.push(
        mutation.childTag
      )
    }
  }
  return newDescriptorByTag
}
