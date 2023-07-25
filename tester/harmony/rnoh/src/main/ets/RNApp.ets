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
        this.rnohContext.__napiBridge?.initializeReactNative();
        if (this.initialSurfaceWidth != 0) {
          this.rnohContext.__napiBridge.updateSurfaceConstraints(this.appName, px2vp(this.initialSurfaceWidth), px2vp(this.initialSurfaceHeight));
        }
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
      this.rnohContext.__napiBridge.updateSurfaceConstraints(this.appName, px2vp(constraint.maxWidth), px2vp(constraint.maxHeight));
    }

  }

  build() {
    Stack() {
      if (this.shouldShow) {
        RNSurface({
          ctx: this.rnohContext,
          appName: this.appName,
          buildCustomComponent: this.buildCustomComponent,
          initialSurfaceWidth: this.initialSurfaceWidth,
          initialSurfaceHeight: this.initialSurfaceHeight,
        })
      }
    }.width("100%").height("100%")
  }
}