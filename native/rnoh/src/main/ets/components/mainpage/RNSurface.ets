import {subscribeToShadowTreeChanges, startReactNative} from 'librnoh.so'

@Preview
@Component
export struct RNSurface {
  @State descriptorByTag: Record<number, any> = {}

  aboutToAppear() {
    subscribeToShadowTreeChanges((mutations) => {
      for (const mutation of mutations) {
        console.log(mutation)
      }
    });
  }

  build() {
    Row() {
      Column() {
        Button("Start RN")
          .onClick(
            () => {
              startReactNative()
            }
          )
      }
      .width('100%')
    }
    .height('100%')
    .backgroundColor("gray")
  }
}
