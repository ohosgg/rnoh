import { RNOHContext, Tag } from "../../RNOH"
import { CustomComponentBuilder } from "./RNComponentFactory"

@Component
export struct RNPullToRefreshView {
  public static readonly NAME = "PullToRefreshView"
  public ctx!: RNOHContext
  public tag: number = 0
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  @State private childrenTags: Tag[] = []

  aboutToAppear() {
    this.childrenTags = this.ctx.descriptorRegistry.getDescriptor(this.tag).childrenTags
  }

  build() {
    /**
     * RNScrollView displays Refresh component if PullToRefreshView is its direct parent.
     * Native Refresh component works correctly, only when a native Scroll is its direct child.
     */
    this.buildCustomComponent({
      rnohContext: this.ctx,
      descriptor: this.ctx.descriptorRegistry.getDescriptor(this.childrenTags[0])
    })
  }
}