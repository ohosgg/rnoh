import {
  RNApp,
  ComponentBuilderContext,
  RNAbility,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
} from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct ReactApplicationPage {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
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
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      RNApp({
        rnInstance: {createRNPackages},
        initialProps: { foo: "bar" },
        appKey: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        jsBundleProvider: new AnyJSBundleProvider([new MetroJSBundleProvider(), new ResourceJSBundleProvider(this.rnAbility.context.resourceManager)]),
      })
    }
    .height('100%')
    .width('100%')
  }
}
