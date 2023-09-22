import { ComponentBuilderContext, RNAbility, RNInstance, RNSurface, SurfaceHandle} from 'rnoh'
import { SAMPLE_VIEW_TYPE, SampleView, PropsDisplayer } from 'rnoh-sample-package'
import router from '@ohos.router'

@Entry
@Component
struct ReactPage {
  @State appKey: string = router.getParams()["appKey"]
  @State surfaceHandle: SurfaceHandle | undefined = undefined;
  @State showSurface: boolean = false;
  @StorageLink('RNAbility') private rnAbility: RNAbility = undefined
  @StorageLink('AppRNInstance') rnInstance: RNInstance = undefined

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

  getOrCreateSurface() {
    const surfacesMap: Record<string, SurfaceHandle> = AppStorage.get("ReactSurfaceByAppKey");

    if (surfacesMap[this.appKey]) {
      return surfacesMap[this.appKey];
    }

    const surfaceHandle = this.rnInstance.createSurface(this.appKey);
    surfaceHandle.start(
      {
        width: 384,
        height: 715,
        surfaceOffsetX: 0,
        surfaceOffsetY: 0,
      },
      {});
    surfacesMap[this.appKey] = surfaceHandle;
    return surfaceHandle;
  }

  aboutToAppear() {
    this.surfaceHandle = this.getOrCreateSurface();
  }

  aboutToDisappear() {}

  build() {
    Column() {
      Row() {
        Navigator({ target: "pages/Index", type: NavigationType.Back }) {
          Text("Go back")
            .width('100%')
            .margin({ left: 12 })
            .fontColor(Color.Blue)
        }
      }.height("5%")


      if (!this.showSurface) {
        Row() {
          Button("Show Surface")
            .onClick(() => this.showSurface = !this.showSurface)
        }
        .height("5%")
        .enabled(this.surfaceHandle !== undefined)
      } else {
        Row() {
          RNSurface({
            ctx: this.rnAbility.createRNOHContext({ rnInstance: this.rnInstance }),
            buildCustomComponent: this.buildCustomComponent.bind(this),
            surfaceConfig: { surfaceHandle: this.surfaceHandle },
          })
        }
        .height("95%")
      }
    }
    .width("100%")
    .height("100%")
  }
}