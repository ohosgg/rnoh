@Entry
@Component
struct Index {
  @State numberOfComponents: number = 10000
  scroller: Scroller = new Scroller()
  timerId: number

  aboutToDisappear() {
    clearInterval(this.timerId)
  }

  generateRandomText(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  build() {
    Column() {
      TextInput({ text: this.numberOfComponents.toString() }).onChange((value) => {
        this.numberOfComponents = parseInt(value) || 0
      })
      Scroll(this.scroller) {
        Column() {
          ForEach(new Array(this.numberOfComponents).fill(0), () => {
            Text(this.generateRandomText(100)).textAlign(TextAlign.Start)
          })
        }.width('100%').alignItems(HorizontalAlign.Start)
      }
    }
    .width('100%')
    .height('100%')
    .alignItems(HorizontalAlign.Start)
  }
}