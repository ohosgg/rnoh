import type { CustomComponentBuilder } from './RNOHCorePackage'
import type { RNInstanceOptions } from './RNOH';
import { RNInstance, JSBundleProvider, RNAbility } from './RNOH'
import { RNSurface } from "./RNSurface"

interface CustomRNInstance {
  rnInstance: RNInstance
}

export type RNInstanceConfig = CustomRNInstance | RNInstanceOptions

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
  @BuilderParam public buildCustomComponent: CustomComponentBuilder
  // -------------------------------------------------------------------------------------------------------------------
  @StorageLink('RNAbility') private rnAbility: RNAbility = undefined
  private rnInstance: RNInstance
  @State private shouldShow: boolean = false
  private shouldDestroyRNInstance: boolean = false
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.getOrCreateRNInstance().then(rnInstance => {
      this.rnInstance = rnInstance
      const jsBundleExecutionStatus = this.rnInstance.getBundleExecutionStatus(this.jsBundleProvider.getURL())
      if (this.jsBundleProvider && jsBundleExecutionStatus === undefined) {
        this.rnInstance.runJSBundle(this.jsBundleProvider).then(() => {
          this.shouldShow = true
        })
        return;
      }
      if (jsBundleExecutionStatus !== "DONE") {
        this.cleanUpCallbacks.push(this.rnInstance.subscribeToLifecycleEvents("JS_BUNDLE_EXECUTION_FINISH", (args) => {
          if (args.appKeys.includes(this.appKey)) {
            this.shouldShow = true
          }
        }))
      } else {
        this.shouldShow = true
      }
    }).catch(reason => {
      if (typeof reason === "string")
        this.rnAbility.getLogger().error(reason)
      else if (reason instanceof Error) {
        this.rnAbility.getLogger().error(reason.message)
      } else {
        this.rnAbility.getLogger().error("Fatal exception")
      }
    })
  }

  aboutToDisappear() {
    if (this.shouldDestroyRNInstance)
      this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance)
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
  }

  private getOrCreateRNInstance(): Promise<RNInstance> {
    if ("rnInstance" in this.rnInstanceConfig) {
      return Promise.resolve(this.rnInstanceConfig.rnInstance)
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