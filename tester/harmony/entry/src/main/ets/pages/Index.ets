import { RNApp, ComponentBuilderContext, RNOHContext } from '@ohos/rnoh'
import { SampleView, SAMPLE_VIEW_TYPE } from "@ohos/rnoh-sample-package"

let storage = LocalStorage.GetShared()

@Entry(storage)
@Component
struct Index {
  @LocalStorageProp('RNOHContext') rnohContext: RNOHContext | undefined = undefined

  @Builder buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === SAMPLE_VIEW_TYPE) {
      SampleView({
        ctx: ctx.rnohContext,
        tag: ctx.descriptor.tag,
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
  }

  build() {
    Column() {
      RNApp({
        rnohContext: this.rnohContext!,
        appName: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    .height('100%')
    .width('100%')
  }
}
