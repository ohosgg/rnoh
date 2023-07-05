@Entry
@Component
struct Index {
  @State p: {
    x: number,
    y: number
  } = { x: 0, y: 0 }

  build() {
    Stack() {
      Stack() {
        Text("Drag me around")
          .fontSize(12)
          .fontWeight(FontWeight.Bold)
      }
      .width(50)
      .height(50)
      .backgroundColor("red")
      .position(this.p)
      .onTouch((e) => {
        this.p = { x: e.changedTouches[0].x, y: e.changedTouches[0].y }
      })
    }
    .width('100%')
    .height("100%")
  }
}