import { ComponentBuilderContext } from './RNComponentFactory'
import { RNInstance, JSBundleProvider, RNInstanceOptions, RNAbility } from './RNOH'
import { RNSurface } from "./RNSurface"

@Component
@Preview
export struct RNApp {
  /**
   * RNInstance or RNInstanceOptions used to create RNInstance.
   * If RNInstanceOptions are provided, this component takes the responsibility for creating and managing RNInstance.
   */
  public rnInstance: RNInstance | RNInstanceOptions = undefined
  /**
   * App name. Check react-native/Libraries/AppRegistry for more info.
   */
  public appKey: string
  /**
   * If provided, Runs JS Bundle against rnInstance. Creates surface after bundle has been loaded.
   */
  public jsBundleProvider: JSBundleProvider | undefined = undefined
  /**
   * Initial properties for the main component of the React Native app.
   */
  public initialProps: Record<string, any>
  /**
   * Builds a custom fabric component.
   */
  @BuilderParam public buildCustomComponent: (ctx: ComponentBuilderContext) => void
  // -------------------------------------------------------------------------------------------------------------------
  @StorageLink('RNAbility') private rnAbility: RNAbility = undefined
  private rnInstance_: RNInstance
  @State private shouldShow: boolean = false
  private shouldDestroyRNInstance: boolean = false

  aboutToAppear() {
    this.rnInstance_ = this.getOrCreateRNInstance()
    if (this.jsBundleProvider && this.rnInstance_.getBundleExecutionStatus(this.jsBundleProvider.getURL()) === undefined) {
      this.rnInstance_.runJSBundle(this.jsBundleProvider).then(() => {
        this.shouldShow = true
      })
    } else {
      this.shouldShow = true
    }
  }

  aboutToDisappear() {
    if (this.shouldDestroyRNInstance)
      this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance_)
  }

  private getOrCreateRNInstance(): RNInstance {
    if ("getId" in this.rnInstance) {
      return this.rnInstance
    } else {
      const options = this.rnInstance
      this.shouldDestroyRNInstance = true
      return this.rnAbility.createAndRegisterRNInstance(options)
    }
  }

  build() {
    Stack() {
      if (this.shouldShow) {
        RNSurface({
          ctx: this.rnAbility.createRNOHContext({ rnInstance: this.rnInstance_ }),
          appKey: this.appKey,
          buildCustomComponent: this.buildCustomComponent,
          initialProps: this.initialProps ?? {}
        })
      }
    }
    .width("100%")
    .height("100%")
  }
}