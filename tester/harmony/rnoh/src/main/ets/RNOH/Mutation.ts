import type { Tag, Descriptor } from './DescriptorBase'

export enum MutationType {
  CREATE = 1,
  DELETE = 2,
  INSERT = 4,
  REMOVE = 8,
  UPDATE = 16,
  REMOVE_DELETE_TREE = 32,
}

export function getHumanNameFromMutationType(mutationType: MutationType) {
  switch (mutationType) {
    case MutationType.CREATE:
      return "CREATE"
    case MutationType.DELETE:
      return "DELETE"
    case MutationType.INSERT:
      return "INSERT"
    case MutationType.REMOVE:
      return "REMOVE"
    case MutationType.UPDATE:
      return "UPDATE"
    case MutationType.REMOVE_DELETE_TREE:
      return "REMOVE_DELETE_TREE"
    default:
      return "UNKNOWN"
  }
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

