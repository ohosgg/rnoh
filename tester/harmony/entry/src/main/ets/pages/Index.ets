import {
  RNApp,
  ComponentBuilderContext,
  RNInstanceFactory,
  RNAbility,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
  RNInstance,
} from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @StorageLink('RNInstanceFactory') rnInstanceFactory: RNInstanceFactory | undefined = undefined
  rnInstance: RNInstance = undefined

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
    // NOTE: this is required since `Ability`'s `onBackPressed` function always
    // terminates or puts the app in the background, but we want Ark to ignore it completely
    // when handled by RN
    return this.rnAbility?.onBackPress();
  }

  aboutToAppear() {
    this.rnInstance = this.rnInstanceFactory.createInstance({
      initialProps: { foo: 'bar' },
      packages: createRNPackages({}),
    });
    this.rnInstance.executeJS(new AnyJSBundleProvider(
      [new MetroJSBundleProvider(), new ResourceJSBundleProvider(this.rnAbility.context.resourceManager)]));
  }

  build() {
    Column() {
      RNApp({
        rnInstance: this.rnInstance,
        appName: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        dev: true,
      })
    }
    .height('100%')
    .width('100%')
  }
}
