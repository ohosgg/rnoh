import display from '@ohos.display'
import { ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOH/RNOHContext"
import { RNSurface } from "./RNSurface"


@Component
@Preview
export struct RNApp {
  rnohContext: RNOHContext
  appName: string
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  @State screenDensity: number = 0
  @State shouldShow: boolean = false
  @State dev: boolean = false
  private initialSurfaceWidth: number = 0
  private initialSurfaceHeight: number = 0

  aboutToAppear() {
    // delay running the app so that debugger has a chance to connect before a potential error is thrown
    setTimeout(() => {
      display.getAllDisplays(async (err, displays) => {
        if (err.code) {
          this.rnohContext.logger.error('RNSurface: Failed to obtain displays. Code: ' + JSON.stringify(err));
          return;
        }
        const data = displays[0];
        this.screenDensity = data.densityPixels
        this.rnohContext.__napiBridge?.initializeReactNative(data.densityPixels);
        this.shouldShow = true;
      });

    }, this.dev ? 2000 : 0)
  }

  onLayout(_children, constraint) {
    if (this.initialSurfaceWidth == 0) {
      this.initialSurfaceWidth = constraint.maxWidth
      this.initialSurfaceHeight = constraint.maxHeight
    }
    else {
      this.rnohContext.__napiBridge.updateSurfaceConstraints(this.appName, constraint.maxWidth / this.screenDensity, constraint.maxHeight / this.screenDensity);
    }

  }

  build() {
    Stack() {
      if (this.screenDensity > 0 && this.shouldShow) {
        RNSurface({
          ctx: this.rnohContext,
          appName: this.appName,
          buildCustomComponent: this.buildCustomComponent,
          screenDensity: this.screenDensity,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight,
        })
      }
    }.width("100%").height("100%")
  }
}