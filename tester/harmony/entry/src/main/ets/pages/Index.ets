import { RNApp, RNInstance, ComponentBuilderContext } from '@ohos/rnoh'

const BUNDLE_URL = "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"

@Entry
@Component
struct Index {
  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {}

  build() {
    Column() {
      RNApp({
        rnInstance: new RNInstance(BUNDLE_URL, (ctx) => []),
        buildCustomComponent: this.buildCustomComponent
      })
    }
    .height('100%')
    .width('100%')
  }
}
