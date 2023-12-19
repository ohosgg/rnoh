import type { ComponentManager } from './ComponentManager';
import type { Tag } from './DescriptorBase';
import type { RNOHLogger } from "./RNOHLogger"

export class ComponentManagerRegistry {
  private componentManagersByTag: Map<Tag, ComponentManager[]>;
  private logger: RNOHLogger
  constructor(logger: RNOHLogger) {
    this.componentManagersByTag = new Map();
    this.logger = logger.clone("ComponentManagerRegistry")
  }

  public getComponentManager(tag: Tag): ComponentManager | undefined {
    const componentManagers = this.componentManagersByTag.get(tag);
    if (!componentManagers || componentManagers.length === 0) {
      return undefined
    }
    if (componentManagers.length > 1) {
      this.logger.clone("getComponentManager").warn(`Found ${componentManagers.length} component managers with the same tag (${tag})`)
    }
    return componentManagers[componentManagers.length - 1]
  }

  public registerComponentManager(tag: Tag, manager: ComponentManager) {
    const componentManagers = this.componentManagersByTag.get(tag)
    if (!componentManagers) {
      this.componentManagersByTag.set(tag, [])
    }
    this.componentManagersByTag.get(tag)!.push(manager)

    return () => {
      const componentManagers = this.componentManagersByTag.get(tag)
      if (componentManagers) {
        manager.onDestroy()
        const filteredComponentManagers = componentManagers.filter(cm => cm !== manager)
        this.componentManagersByTag.set(tag, filteredComponentManagers)
        if (filteredComponentManagers.length === 0) {
          this.componentManagersByTag.delete(tag);
        }
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