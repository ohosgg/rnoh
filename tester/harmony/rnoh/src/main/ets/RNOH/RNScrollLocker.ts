import { ComponentManagerRegistry, RNScrollViewManager, RNViewManager, Tag } from 'rnoh/ts'

export class RNScrollLocker {
  public constructor(private componentManagerRegistry: ComponentManagerRegistry) {
  }

  public lockScrollContainingViewTag(viewTag: number) {
    const scrollViewManagers = this.getAncestorScrollViewManagersForViewTag(viewTag)
    const unlockScrollingCallbacks = scrollViewManagers.map(scrollViewManager => {
      return scrollViewManager.lockScrolling()
    })
    return () => {
      unlockScrollingCallbacks.forEach(unlockScrolling => {
        unlockScrolling()
      })
    }
  }

  private getAncestorScrollViewManagersForViewTag(viewTag: Tag) {
    const scrollViewManagers: RNScrollViewManager[] = []
    let currentViewTag = viewTag;
    while (currentViewTag) {
      const componentManager = this.componentManagerRegistry.getComponentManager(currentViewTag);
      if (!componentManager || !(componentManager instanceof RNViewManager)) {
        currentViewTag = undefined
        break;
      } else {
        if (componentManager instanceof RNScrollViewManager) {
          scrollViewManagers.push(componentManager)
        }
        currentViewTag = componentManager.getParentTag()
      }
    }
    return scrollViewManagers
  }
}
