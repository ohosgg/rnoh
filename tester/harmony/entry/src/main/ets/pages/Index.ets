import { RNApp, RNInstance, ComponentBuilderContext } from '@ohos/rnoh'

@Entry
@Component
struct Index {
  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {}

  build() {
    Column() {
      RNApp({
        rnInstance: new RNInstance((ctx) => []),
        buildCustomComponent: this.buildCustomComponent
      })
    }
    .height('100%')
    .width('100%')
  }
}
