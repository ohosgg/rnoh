import { ComponentBuilderContext } from './RNComponentFactory'
import { RNInstance, JSBundleProvider, RNInstanceOptions, RNAbility } from './RNOH'
import { RNSurface } from "./RNSurface"

export type RNInstanceConfig = {
  rnInstance : RNInstance
} | RNInstanceOptions;

@Component
@Preview
export struct RNApp {
  /**
   * RNInstance or RNInstanceOptions used to create RNInstance.
   * If RNInstanceOptions are provided, this component takes the responsibility for creating and managing RNInstance.
   */
  public rnInstanceConfig: RNInstanceConfig = undefined
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
  private rnInstance: RNInstance
  @State private shouldShow: boolean = false
  private shouldDestroyRNInstance: boolean = false

  aboutToAppear() {
    this.rnInstance = this.getOrCreateRNInstance()
    if (this.jsBundleProvider && this.rnInstance.getBundleExecutionStatus(this.jsBundleProvider.getURL()) === undefined) {
      this.rnInstance.runJSBundle(this.jsBundleProvider).then(() => {
        this.shouldShow = true
      })
    } else {
      this.shouldShow = true
    }
  }

  aboutToDisappear() {
    if (this.shouldDestroyRNInstance)
      this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance)
  }

  private getOrCreateRNInstance(): RNInstance {
    if ("rnInstance" in this.rnInstanceConfig) {
      return this.rnInstanceConfig.rnInstance
    } else {
      const options = this.rnInstanceConfig
      this.shouldDestroyRNInstance = true
      return this.rnAbility.createAndRegisterRNInstance(options)
    }
  }

  build() {
    Stack() {
      if (this.shouldShow) {
        RNSurface({
          ctx: this.rnAbility.createRNOHContext({ rnInstance: this.rnInstance }),
          surfaceConfig: {
            initialProps: this.initialProps ?? {},
            appKey: this.appKey,
          },
          buildCustomComponent: this.buildCustomComponent,
        })
      }
    }
    .width("100%")
    .height("100%")
  }
}