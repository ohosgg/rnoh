import { RNApp, ComponentBuilderContext, RNInstanceFactory, RNAbility } from 'rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, PropsDisplayer } from "rnoh-sample-package"
import { createRNPackages } from '../RNPackagesFactory'

let storage = LocalStorage.getShared()

@Entry(storage)
@Component
struct Index {
  @LocalStorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @LocalStorageLink('RNInstanceFactory') rnInstanceFactory: RNInstanceFactory | undefined = undefined

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
    // NOTE: this is required since `Ability`'s `onBackPressed` function always
    // terminates or puts the app in the background, but we want Ark to ignore it completely
    // when handled by RN
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
        RNApp({
          rnInstance: this.rnInstanceFactory.createInstance({
            bundleUrl: 'http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false',
            initialProps: { foo: 'bar' },
            packages: createRNPackages({})
          }),
          appName: "app_name",
          buildCustomComponent: this.buildCustomComponent.bind(this),
          dev: true,
        })
    }
    .height('100%')
    .width('100%')
  }
}
