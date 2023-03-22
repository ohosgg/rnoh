import rnoh from 'librnoh.so'



@Preview
@Component
export struct RNSurface {
  @State descriptorByTag: Record<number, any> = {}

  aboutToAppear() {
    rnoh.onComponentDescriptorTreeUpdate((mutations) => {
      for (const mutation of mutations) {
        console.log(mutation)
      }

//      this.componentDescriptorTree = newComponentDescriptorTree
    });
  }

  build() {
    Row() {
      Column() {
        Button(rnoh ? "RNOH defined" : "RNOH undefined")
          .onClick(
            () => {
              rnoh.simulateComponentDescriptorTreeUpdate()
            }
          )
      }
      .width('100%')
    }
    .height('100%')
    .backgroundColor("gray")
  }
}
