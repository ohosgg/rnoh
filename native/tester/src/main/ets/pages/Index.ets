import {RNSurface} from '@ohos/rnoh'

@Entry
@Component
struct Index {
  build() {
    Column() {
      RNSurface()
    }
    .height('100%')
    .width('100%')
    .backgroundColor("blue")
  }
}
