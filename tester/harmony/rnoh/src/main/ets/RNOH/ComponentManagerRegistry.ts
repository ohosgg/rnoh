import type { ComponentManager } from './ComponentManager';
import type { Tag } from './DescriptorBase';

export class ComponentManagerRegistry {
  private componentManagerByTag: Map<Tag, ComponentManager>;

  constructor() {
    this.componentManagerByTag = new Map();
  }

  public getComponentManager(tag: Tag): ComponentManager {
    return this.componentManagerByTag.get(tag);
  }

  public registerComponentManager(tag: Tag, manager: ComponentManager) {
    const alreadyRegisteredManager = this.componentManagerByTag.get(tag)
    if (alreadyRegisteredManager) {
      alreadyRegisteredManager.onDestroy()
    }
    this.componentManagerByTag.set(tag, manager);
    return () => {
      const componentManager = this.componentManagerByTag.get(tag)
      if (componentManager === manager) {
        /**
         * RN may quickly remove and create a component with the same tag. In such situations,
         * OldComponent::aboutToDisappear is called after NewComponent::aboutToAppear, thus removing
         * a component manager for a new component.
         */
        componentManager.onDestroy()
        this.componentManagerByTag.delete(tag);
      }

    }
  }

  public getComponentManagerLineage(tag: Tag): ComponentManager[] {
    const results: ComponentManager[] = []
    let currentTag: Tag | undefined = tag
    do {
      const componentManager = this.getComponentManager(currentTag)
      if (!componentManager) {
        // https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/707
        break;
      }
      currentTag = componentManager.getParentTag()
      results.push(componentManager)
    } while (currentTag !== undefined);
    return results.reverse();
  }

}