import rnoh from 'librnoh.so'

@Preview
@Component
export struct RNSurface {
  // number will be replaced with the actual tree in the future
  @State componentDescriptorTree: number = 42

  aboutToAppear() {
    rnoh.onComponentDescriptorTreeUpdate((newComponentDescriptorTree) => {
      this.componentDescriptorTree = newComponentDescriptorTree
    });
  }

  build() {
    Row() {
      Column() {
        Text(this.componentDescriptorTree.toString())
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
        Button("Update state")
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
