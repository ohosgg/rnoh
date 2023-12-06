import { CustomComponentBuilder } from './RNOHCorePackage'
import { RNInstanceOptions } from './RNOH';
import { RNInstance, JSBundleProvider, RNAbility, RNOHLogger } from './RNOH'
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
  public rnInstanceConfig!: RNInstanceConfig
  /**
   * App name. Check react-native/Libraries/AppRegistry for more info.
   */
  public appKey: string = ''
  /**
   * If provided, Runs JS Bundle against rnInstance. Creates surface after bundle has been loaded.
   */
  public jsBundleProvider: JSBundleProvider | undefined = undefined
  /**
   * Initial properties for the main component of the React Native app.
   */
  public initialProps: Record<string, string> = {}
  /**
   * Builds a custom fabric component.
   */
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  /**
   * Called before a surface is visible, and rnInstance is available.
   */
  public onSetUp: (rnInstance: RNInstance) => Promise<void> | void = () => Promise.resolve()
  // -------------------------------------------------------------------------------------------------------------------
  @StorageLink('RNAbility') private rnAbility: RNAbility = {} as RNAbility
  private rnInstance!: RNInstance
  @State private shouldShow: boolean = false
  private shouldDestroyRNInstance: boolean = false
  private cleanUpCallbacks: (() => void)[] = []
  private logger!: RNOHLogger

  aboutToAppear() {
    this.logger = this.rnAbility.getLogger().clone("RNApp")
    const stopTracing = this.logger.clone("aboutToAppear").startTracing()
    try {
      (async () => {
        await (async () => {
          this.rnInstance = await this.getOrCreateRNInstance()
          await this.onSetUp(this.rnInstance)
          const jsBundleExecutionStatus = this.rnInstance.getBundleExecutionStatus(this.jsBundleProvider?.getURL())
          if (this.jsBundleProvider && jsBundleExecutionStatus === undefined) {
            await this.rnInstance.runJSBundle(this.jsBundleProvider)
            this.shouldShow = true
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
        })()
        stopTracing()
      })()
    } catch(reason) {
      if (typeof reason === "string")
        this.rnAbility.getLogger().error(reason)
      else if (reason instanceof Error) {
        this.rnAbility.getLogger().error(reason.message)
      } else {
        this.rnAbility.getLogger().error("Fatal exception")
      }
      stopTracing()
    }
  }

  aboutToDisappear() {
    const stopTracing = this.logger.clone("aboutToDisappear").startTracing()
    if (this.shouldDestroyRNInstance)
      this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance)
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
    stopTracing()
  }

  private getOrCreateRNInstance(): Promise<RNInstance> {
    if (Object.keys(this.rnInstanceConfig).includes("rnInstance")) {
      return Promise.resolve((this.rnInstanceConfig as CustomRNInstance).rnInstance)
    } else {
      const options = this.rnInstanceConfig
      this.shouldDestroyRNInstance = true
      return this.rnAbility.createAndRegisterRNInstance(options as RNInstanceOptions)
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
    }.width("100%")
    .height("100%")
  }
}