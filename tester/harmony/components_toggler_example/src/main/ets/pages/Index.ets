@Entry
@Component
struct Index {
  @State numberOfComponents: number = 100
  @State isComponentVisible: boolean = false

  aboutToAppear() {
    setInterval(() => {
      this.isComponentVisible = !this.isComponentVisible
    }, 1000)
  }

  build() {
    Row() {
      Column() {
        Stack() {
          Scroll() {
            Column() {
              ForEach(new Array(this.numberOfComponents).fill(0), (_, idx) => {
                Stack() {
                  Text(idx.toString())
                }.width("100%").height(100).backgroundColor("red")
              })
            }
          }


        }.height("50%")

        if (this.isComponentVisible) {
          Stack() {
            ForEach(new Array(500).fill(0), (_, idx) => {
              Stack() {
              }
              .width(100)
              .height(100)
              .backgroundColor("blue")
              .borderWidth(1)
              .position({ x: Math.random() * 200 - 100, y: Math.random() * 200 })
            })
          }.height("50%")
        }
      }.align(Alignment.TopStart).height("100%")
    }
    .height('100%')
  }
}