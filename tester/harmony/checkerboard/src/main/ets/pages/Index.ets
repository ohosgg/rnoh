const N_ROWS = 256
const N_COLS = 128
const SIZE = 3

@Entry
@Component
struct Index {
  @State isCheckerboardVisible: boolean = false

  build() {
    Column() {
      AnimationPreview()
      Button("Show checkerboard").onClick(() => {
        this.isCheckerboardVisible = !this.isCheckerboardVisible
      })
      if (this.isCheckerboardVisible) {
        Column() {
          ForEach(new Array(N_ROWS).fill(0), (_val, colId) => {
            Row() {
              ForEach(new Array(N_COLS).fill(0), (_val, rowId) => {
                Box({ colorId: (rowId + colId) % 3 })
              })
            }.width("100%")
          })
        }
      }
    }.width("100%").height("100%").backgroundColor("black").alignItems(HorizontalAlign.Start)
  }
}

@Component
struct AnimationPreview {
  @State isAnimationVisible: boolean = false
  @State rectWidth: number = 100

  build() {
    Column() {
      Stack()
        .width(this.rectWidth)
        .height(100)
        .backgroundColor("red")
        .animation({ duration: 1000 })
        .onClick(() => {
          this.rectWidth = this.rectWidth > 200 ? 100 : 300
        })
    }
  }
}

@Component
struct Box {
  @State colorId: number = 0

  getColor() {
    if (this.colorId === 1) return "green"
    if (this.colorId === 2) return "blue"
    return "red"
  }

  build() {
    Stack() {
    }
    .width(SIZE)
    .height(SIZE)
    .backgroundColor(this.getColor())
  }
}