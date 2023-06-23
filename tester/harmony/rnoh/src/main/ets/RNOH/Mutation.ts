import { Tag, Descriptor } from './DescriptorBase'

export enum MutationType {
  CREATE = 1,
  DELETE = 2,
  INSERT = 4,
  REMOVE = 8,
  UPDATE = 16,
  REMOVE_DELETE_TREE = 32,
}

export type CreateMutation = {
  type: MutationType.CREATE
  descriptor: Descriptor
}

export type DeleteMutation = {
  type: MutationType.DELETE
  tag: Tag
}

export type InsertMutation = {
  type: MutationType.INSERT
  parentTag: Tag
  childTag: Tag
  index: number
}

export type RemoveMutation = {
  type: MutationType.REMOVE
  parentTag: Tag
  childTag: Tag
}

export type UpdateMutation = {
  type: MutationType.UPDATE
  descriptor: Descriptor
}

export type RemoveDeleteTreeMutation = {
  type: MutationType.REMOVE_DELETE_TREE
}

export type Mutation =
| CreateMutation
  | DeleteMutation
  | InsertMutation
  | RemoveMutation
  | UpdateMutation
  | RemoveDeleteTreeMutation
