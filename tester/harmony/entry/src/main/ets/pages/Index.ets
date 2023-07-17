import { RNApp, ComponentBuilderContext, RNOHContext } from '@ohos/rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "@ohos/rnoh-sample-package"
import { DeviceEventManagerTurboModule } from "@ohos/rnoh/src/main/ets/RNOHCorePackage/turboModules/DeviceEventManagerTurboModule"

let storage = LocalStorage.GetShared()

@Entry(storage)
@Component
struct Index {
  @LocalStorageProp('RNOHContext') rnohContext: RNOHContext | undefined = undefined

  @Builder buildCustomComponent(ctx: ComponentBuilderContext) {
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
    this.rnohContext.rnInstanceManager.getTurboModule<DeviceEventManagerTurboModule>(DeviceEventManagerTurboModule.NAME).emitHardwareBackPressed();
    return true;
  }

  build() {
    Column() {
      RNApp({
        rnohContext: this.rnohContext !,
        appName: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    .height('100%')
    .width('100%')
  }
}
