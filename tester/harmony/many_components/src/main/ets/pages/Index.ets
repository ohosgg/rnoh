@Entry
@Component
struct Index {
  @State numberOfComponents: number = 100
  @State isVisible: boolean = true;

  build() {
    Column() {
      TextInput({ text: this.numberOfComponents.toString() }).onChange((value) => {
        this.numberOfComponents = parseInt(value) || 0
      })
      Button(this.isVisible ? 'hide components' : 'show components').onClick(() => {
        this.isVisible = !this.isVisible;
      })
      if (this.isVisible) {
        Stack() {
          ForEach(new Array(this.numberOfComponents).fill(0), () => {
            Stack() {
            }
            .width(25)
            .height(25)
            .backgroundColor(Math.random() > 0.5 ? "green" : "blue")
            .position({ x: Math.random() * 350, y: Math.random() * 700 })
            .borderWidth(1)
            //.opacity(Math.random())
          })
        }
      }
    }

    .width('100%')
    .height('100%')
    .alignItems(HorizontalAlign.Start)
  }
}