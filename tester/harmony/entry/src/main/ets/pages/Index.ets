import { ComponentBuilderContext, RNOHLogger } from 'rnoh';
import {
  RNApp,
  RNAbility,
  AnyJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
  TraceJSBundleProviderDecorator
} from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import font from '@ohos.font';
import { createRNPackages } from '../RNPackagesFactory'

@Builder
function CustomComponentBuilder(ctx: ComponentBuilderContext) {
  if (ctx.componentName === SAMPLE_VIEW_TYPE) {
    SampleView({
      ctx: ctx.rnohContext,
      tag: ctx.tag,
      buildCustomComponent: CustomComponentBuilder
    })
  } else if (ctx.componentName === PropsDisplayer.NAME) {
    PropsDisplayer({
      ctx: ctx.rnohContext,
      tag: ctx.tag
    })
  }
}

/**
 * If you want to use custom fonts, you need to register them here.
 * We should support react-native-asset to handle registering fonts automatically.
 */
const fonts: font.FontOptions[] = [
  {
    familyName: 'Pacifico-Regular',
    familySrc: '/assets/fonts/Pacifico-Regular.ttf'
  },
  {
    familyName: 'StintUltraCondensed-Regular',
    familySrc: '/assets/fonts/StintUltraCondensed-Regular.ttf'
  }
]

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @State shouldShow: boolean = false
  private logger!: RNOHLogger

  aboutToAppear() {
    this.logger = this.rnAbility!.getLogger().clone("Index")
    const stopTracing = this.logger.clone("aboutToAppear").startTracing()
    for (const customFont of fonts) {
      font.registerFont(customFont)
    }
    this.shouldShow = true
    stopTracing()
  }

  onBackPress(): boolean | undefined {
    // NOTE: this is required since `Ability`'s `onBackPressed` function always
    // terminates or puts the app in the background, but we want Ark to ignore it completely
    // when handled by RN
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      if (this.rnAbility && this.shouldShow) {
        RNApp({
          rnInstanceConfig: { createRNPackages },
          initialProps: { "foo": "bar" } as Record<string, string>,
          appKey: "app_name",
          buildCustomComponent: CustomComponentBuilder,
          jsBundleProvider: new TraceJSBundleProviderDecorator(new AnyJSBundleProvider([
            new MetroJSBundleProvider(),
            new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'hermes_bundle.hbc'),
            new ResourceJSBundleProvider(this.rnAbility.context.resourceManager, 'bundle.harmony.js')]), this.rnAbility.getLogger()),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
