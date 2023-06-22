@Entry
@Component
struct Index {
  @State opacityValue: number = 1
  @State numberOfComponents: number = 100
  timerId: number

  aboutToAppear() {
    this.timerId = setInterval(() => {
      this.opacityValue = Math.sin(new Date().getTime() / 200) / 2 + 0.5
    }, 1000 / 60)
  }

  aboutToDisappear() {
    clearInterval(this.timerId)
  }

  build() {
    Column() {
      TextInput({ text: this.numberOfComponents.toString() }).onChange((value) => {
        this.numberOfComponents = parseInt(value) || 0
      })
      Stack() {
        ForEach(new Array(this.numberOfComponents).fill(0), () => {
          Stack() {
          }
          .width(25)
          .height(25)
          .backgroundColor(Math.random() > 0.5 ? "green" : "blue")
          .position({ x: Math.random() * 350, y: Math.random() * 700 })
          .borderWidth(1)
          .opacity(Math.random())
        })
        Stack() {
        }
        .width(100)
        .height(100)
        .backgroundColor("red")
        .opacity(this.opacityValue)
        Stack() {
        }
        .width(100)
        .height(100)
        .position({x: this.opacityValue * 100, y: 100})
        .backgroundColor("red")
      }
    }
    .width('100%')
    .height('100%')
    .alignItems(HorizontalAlign.Start)
  }
}