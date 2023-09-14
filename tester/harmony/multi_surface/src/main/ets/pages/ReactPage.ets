import { ComponentBuilderContext, RNAbility, RNInstance, RNOHContext, RNSurface } from 'rnoh'
import { SAMPLE_VIEW_TYPE, SampleView, PropsDisplayer } from 'rnoh-sample-package'
import router from '@ohos.router'

@Entry
@Component
struct ReactPage {
  @State appKey: string = router.getParams()["appKey"]
  @StorageLink('RNAbility') private rnAbility: RNAbility = undefined
  @StorageLink('ReactInstance') rnInstance: RNInstance = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === SAMPLE_VIEW_TYPE) {
      SampleView({
        ctx: ctx.rnohContext,
        tag: ctx.descriptor.tag,
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    } else if (ctx.descriptor.type === PropsDisplayer.NAME) {
      PropsDisplayer({
        ctx: ctx.rnohContext,
        tag: ctx.descriptor.tag
      })
    }
  }

  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      Row() {
        Navigator({ target: "pages/Index", type: NavigationType.Back }) {
          Text("Go back")
            .width('100%')
            .margin({ left: 12 })
            .fontColor(Color.Blue)
        }
      }.height("5%")

      if (this.rnInstance !== undefined) {
        Row() {
          RNSurface({
            appKey: this.appKey,
            ctx: this.rnAbility.createRNOHContext({ rnInstance: this.rnInstance }),
            initialProps: {},
            buildCustomComponent: this.buildCustomComponent.bind(this),
          })
        }
        .height("95%")
      }
    }
    .width("100%")
    .height("100%")
  }
}