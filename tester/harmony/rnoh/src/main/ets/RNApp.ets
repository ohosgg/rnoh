import Device from '@system.device'
import { ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext } from "./RNOHContext"
import type { DeviceInfoTurboModule } from "./RNOHCorePackage/TurboModules/DeviceInfoTurboModule"
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
      Device.getInfo({ success: (data) => {
        this.screenDensity = data.screenDensity
        const deviceInfoTurboModule = this.rnohContext.rnInstanceManager.getTurboModule<DeviceInfoTurboModule>("DeviceInfo");
        deviceInfoTurboModule.setInitialParameters({
          screenPhysicalPixels: {
            width: data.windowWidth,
            height: data.windowHeight,
            scale: data.screenDensity,
            fontScale: 1,
            densityDpi: 1,
          },
          windowPhysicalPixels: {
            width: data.windowWidth,
            height: data.windowHeight,
            scale: data.screenDensity,
            fontScale: 1,
            densityDpi: 1,
          }
        });
        this.rnohContext.rnInstance?.initializeReactNative(data.screenDensity);
        this.shouldShow = true
      } })
    }, this.dev ? 2000 : 0)
  }

  onLayout(_children, constraint) {
    this.initialSurfaceWidth = constraint.maxWidth
    this.initialSurfaceHeight = constraint.maxHeight
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