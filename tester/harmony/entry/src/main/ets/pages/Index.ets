import type {
  ComponentBuilderContext} from 'rnoh';
import {
  RNApp,
  RNAbility,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider
} from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import { createRNPackages } from '../RNPackagesFactory'
import { TouchDisplayer } from './TouchDisplayer'

@Entry
@Component
struct Index {
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
    // NOTE: this is required since `Ability`'s `onBackPressed` function always
    // terminates or puts the app in the background, but we want Ark to ignore it completely
    // when handled by RN
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      if (this.rnAbility) {
        // TouchDisplayer() {
          RNApp({
            rnInstanceConfig: {createRNPackages},
            initialProps: { foo: "bar" },
            appKey: "app_name",
            buildCustomComponent: this.buildCustomComponent.bind(this),
            jsBundleProvider: new AnyJSBundleProvider([
              new MetroJSBundleProvider(),
              new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'hermes_bundle.hbc'),
              new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'bundle.harmony.js')]),
          })
        // }
      }
    }
    .height('100%')
    .width('100%')
  }
}
