import { RNApp, RNInstance } from '@ohos/rnoh'

@Entry
@Component
struct Index {
  build() {
    Column() {
      RNApp({ rnInstance: new RNInstance((ctx) => []) })
    }
    .height('100%')
    .width('100%')
    .backgroundColor("blue")
  }
}
