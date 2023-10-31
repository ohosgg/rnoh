@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State numberOfComponents: number = 300

  build() {
    Scroll() {
      Column() {
        TextInput({ text: this.numberOfComponents.toString() }).onChange((value) => {
          this.numberOfComponents = Number(value) || 0
        })
        Flex({ direction: FlexDirection.Row, wrap: FlexWrap.Wrap }) {
          ForEach(new Array(this.numberOfComponents).fill(0), () => {
            Image($r("app.media.placeholder2000x2000"))
              .width('100%')
              .aspectRatio(1)
              .interpolation(ImageInterpolation.High)

          })
        }
      }
      .width('100%')
    }
  }
}