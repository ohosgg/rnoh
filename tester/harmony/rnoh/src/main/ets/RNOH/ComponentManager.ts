import { Tag } from "./DescriptorBase";

export abstract class ComponentManager {
  onDestroy() {}
  abstract getParentTag(): Tag
  abstract getTag(): Tag
}
