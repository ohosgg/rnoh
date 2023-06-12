import { RNApp, RNInstance, ComponentBuilderContext, RNOHContext } from '@ohos/rnoh'
import { SampleView, SAMPLE_VIEW_TYPE, SamplePackage } from "@ohos/rnoh-sample-package"
import common from '@ohos.app.ability.common';

const BUNDLE_URL = "http://localhost:8081/index.bundle?platform=harmony&dev=false&minify=false"

@Entry
@Component
struct Index {
  rnInstance = new RNInstance(
    BUNDLE_URL,
    "app_name",
    getContext(this) as common.UIAbilityContext,
    (ctx) => [
      new SamplePackage(ctx)
    ]
  );
  rnohContext: RNOHContext = new RNOHContext(this.rnInstance);

  @Builder buildCustomComponent(ctx: ComponentBuilderContext) {
    if (ctx.descriptor.type === SAMPLE_VIEW_TYPE) {
      SampleView({ ctx: ctx.rnohContext, tag: ctx.descriptor.tag, buildCustomComponent: this.buildCustomComponent.bind(this) })
    }
  }

  build() {
    Column() {
      RNApp({
        rnohContext: this.rnohContext,
        buildCustomComponent: this.buildCustomComponent.bind(this)
      })
    }
    .height('100%')
    .width('100%')
  }
}
