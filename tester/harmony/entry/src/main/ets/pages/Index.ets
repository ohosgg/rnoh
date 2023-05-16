import { RNApp, RNInstance, ComponentBuilderContext } from '@ohos/rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, SampleViewDescriptor, SamplePackage } from "@ohos/rnoh-sample-package"

const BUNDLE_URL = "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"

@Entry
@Component
struct Index {
  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === SAMPLE_VIEW_TYPE) {
      SampleView({ descriptor: ctx.descriptor as SampleViewDescriptor })
    }
  }

  build() {
    Column() {
      RNApp({
        rnInstance: new RNInstance(BUNDLE_URL, (ctx) => [
          new SamplePackage(ctx)
        ]),
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    .height('100%')
    .width('100%')
  }
}
