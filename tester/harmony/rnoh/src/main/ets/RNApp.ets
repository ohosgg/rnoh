import { ComponentBuilderContext } from './RNComponentFactory'
import { RNInstanceFactory, RNInstance, JSBundleProvider } from './RNOH'
import { RNOHContext } from "./RNOH/RNOHContext"
import { RNOHLogger } from './RNOH/RNOHLogger'
import { RNSurface } from "./RNSurface"

@Component
@Preview
export struct RNApp {
  @StorageLink('RNInstanceFactory') rnInstanceFactory: RNInstanceFactory | undefined = undefined
  @StorageLink('RNOHLogger') logger: RNOHLogger | undefined = undefined;
  @State public rnInstance: RNInstance | undefined = undefined
  public appName: string
  @BuilderParam public buildCustomComponent: (ctx: ComponentBuilderContext) => void
  public dev: boolean = false
  public jsBundleProvider: JSBundleProvider
  private rnohContext: RNOHContext
  @State private shouldShow: boolean = false

  aboutToAppear() {
    this.rnohContext = new RNOHContext("0.0.0", this.rnInstance, this.logger)
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    setTimeout(() => {
      this.shouldShow = true
    }, this.dev ? 2000 : 0)
  }

  build() {
    Stack() {
      if (this.shouldShow) {
        RNSurface({
          tag: 1,
          ctx: this.rnohContext,
          appKey: this.appName,
          buildCustomComponent: this.buildCustomComponent,
        })
      }
    }
    .width("100%")
    .height("100%")
  }
}