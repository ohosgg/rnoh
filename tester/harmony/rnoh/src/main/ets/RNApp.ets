import { ComponentBuilderContext } from './RNComponentFactory'
import { RNInstanceFactory, RNInstance } from './RNOH'
import JavaScriptLoader from './RNOH/JavaScriptLoader'
import { RNOHContext } from "./RNOH/RNOHContext"
import { RNOHLogger } from './RNOH/RNOHLogger'
import { RNSurface } from "./RNSurface"


@Component
@Preview
export struct RNApp {
  @LocalStorageLink('RNInstanceFactory') rnInstanceFactory: RNInstanceFactory | undefined = undefined
  @LocalStorageLink('RNOHLogger') logger: RNOHLogger | undefined = undefined;
  @State rnInstance: RNInstance | undefined = undefined
  appName: string
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  dev: boolean = false
  private rnohContext: RNOHContext
  @State private shouldShow: boolean = false

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    setTimeout(() => {
      this.rnohContext = new RNOHContext("0.0.0", this.rnInstance, this.logger)
      this.rnInstance.initialize()

      // TODO: rework bundle loading
      const javaScriptLoader = new JavaScriptLoader(this.rnInstance.abilityContext.resourceManager, this.logger);
      javaScriptLoader.loadBundle(this.rnInstance.getBundleURL())
        .catch((error) => {
          // NOTE: temporary fallback to local bundle file,
          // until we figure out how to pass bundle URL as launch param
          // to the Ark app
          this.logger.error(error);
          this.logger.info("Falling back to local bundle.");
          return javaScriptLoader.loadBundle("bundle.harmony.js")
        }).then((bundle) => {
          this.rnInstance.loadScriptFromString(bundle)
          this.shouldShow = true;
        });
    }, this.dev ? 2000 : 0)
  }

  build() {
    Stack() {
      if (this.shouldShow) {
        RNSurface({
          tag: 1,
          ctx: this.rnohContext,
          appName: this.appName,
          buildCustomComponent: this.buildCustomComponent,
        })
      }
    }
    .width("100%")
    .height("100%")
  }
}