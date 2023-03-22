
/** 0-1 */
type NormalizedScalar = number

/** RGBA */
type Color = [NormalizedScalar, NormalizedScalar, NormalizedScalar, NormalizedScalar]

export enum MutationType {
    CREATE = 1,
    DELETE = 2,
    INSERT = 4,
    REMOVE = 8,
    UPDATE = 16,
    REMOVE_DELETE_TREE = 32
}

type BaseDescriptorProps = {
    top: number
    left: number
    width: number
    height: number
}

type ViewDescriptor = {
    type: "View"
    props: BaseDescriptorProps & {
        backgroundColor?: Color
    }
}

type Descriptor = ViewDescriptor

type CreateMutation = {
    type: MutationType.CREATE
    descriptor: Descriptor
}

type Mutation = CreateMutation

export const subscribeToShadowTreeChanges: (onShadowTreeChange: (mutations: Mutation[]) => void) => number;
export const startReactNative: () => void;