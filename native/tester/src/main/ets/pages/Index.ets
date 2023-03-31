import { RNApp } from '@ohos/rnoh'

@Entry
@Component
struct Index {
  build() {
    Column() {
      RNApp()
    }
    .height('100%')
    .width('100%')
    .backgroundColor("blue")
  }
}
