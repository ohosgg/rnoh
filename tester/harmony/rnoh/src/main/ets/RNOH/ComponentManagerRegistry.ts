import { ComponentManager } from './ComponentManager';
import { Tag } from './DescriptorBase';

export class ComponentManagerRegistry {
  private componentManagerByTag: Map<Tag, ComponentManager>;

  constructor() {
    this.componentManagerByTag = new Map();
  }

  public getComponentManager(tag: Tag): ComponentManager {
    return this.componentManagerByTag.get(tag);
  }

  public registerComponentManager(tag: Tag, manager: ComponentManager) {
    this.componentManagerByTag.set(tag, manager);
    return () => {
      this.componentManagerByTag.delete(tag);
    }
  }

}