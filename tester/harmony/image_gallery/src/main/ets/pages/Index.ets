@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State numberOfComponents: number = 300

  build() {
    Scroll() {
      Column() {
        TextInput({ text: this.numberOfComponents.toString() }).onChange((value) => {
          this.numberOfComponents = parseInt(value) || 0
        })
        Flex({ direction: FlexDirection.Row, wrap: FlexWrap.Wrap }) {
          ForEach(new Array(this.numberOfComponents).fill(0), () => {
            Image($r("app.media.placeholder2000x2000"))
              .width('33.33%')
              .aspectRatio(1)
          })
        }
      }
      .width('100%')
    }
  }
}