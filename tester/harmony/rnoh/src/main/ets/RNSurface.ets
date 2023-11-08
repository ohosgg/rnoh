import { ComponentBuilderContext } from './RNOHCorePackage/components/RNComponentFactory';
import { RNComponentFactory } from './RNOHCorePackage';
import { convertColorSegmentsToString, Descriptor, DisplayMode, RNOHContext, Tag } from './RNOH';
import { ViewBaseProps } from './RNOHCorePackage/components/RNViewBase';
import { TouchDispatcher } from './RNOH/TouchDispatcher';
import { SurfaceHandle, SurfaceProps } from './RNOH/SurfaceHandle';
import { RNSurfaceManager } from './RNOHCorePackage/componentManagers/RNSurfaceManager';

export type RootDescriptor = Descriptor<"RootView", ViewBaseProps>;

interface SurfaceConfig1 {
  surfaceHandle: SurfaceHandle
}

interface SurfaceConfig2 {
  appKey: string,
  initialProps: SurfaceProps,
}

type SurfaceConfig = SurfaceConfig1 | SurfaceConfig2

@Component
export struct RNSurface {
  ctx!: RNOHContext;
  surfaceConfig!: SurfaceConfig;
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void;
  surfaceWidth: number = 0;
  surfaceHeight: number = 0;
  surfaceOffsetX: number = 0;
  surfaceOffsetY: number = 0;
  @State descriptor: RootDescriptor = Object() as RootDescriptor;
  @State private shouldStartSurface: boolean = false;
  private surfaceHandle!: SurfaceHandle;
  private cleanUpCallbacks: (() => void)[] = [];
  private touchDispatcher!: TouchDispatcher;
  private shouldStopSurface: boolean = false;
  private initialProps!: SurfaceProps;
  private componentManager!: RNSurfaceManager;

  aboutToAppear() {
    if (Object.keys(this.surfaceConfig).includes("surfaceHandle")) {
      this.surfaceHandle = (this.surfaceConfig as SurfaceConfig1).surfaceHandle;
      this.surfaceHandle.setDisplayMode(DisplayMode.Visible);
    } else {
      this.surfaceHandle = this.ctx.rnInstance.createSurface((this.surfaceConfig as SurfaceConfig2).appKey);
      this.initialProps = (this.surfaceConfig as SurfaceConfig2).initialProps;
      this.shouldStartSurface = true;
      this.shouldStopSurface = true;
    }
    const tag = this.surfaceHandle.getTag();
    this.componentManager = new RNSurfaceManager(tag, this.ctx);
    this.cleanUpCallbacks.push(() => {
      this.componentManager.onDestroy()
    })

    this.descriptor = this.ctx.rnInstance.descriptorRegistry.getDescriptor(tag)
    this.touchDispatcher = new TouchDispatcher(tag, this.ctx.rnInstance, this.ctx.logger)
    this.ctx.componentManagerRegistry.registerComponentManager(tag, this.componentManager);
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      tag,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    ))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
    if (this.shouldStopSurface) {
      this.surfaceHandle.stop().then(() => {
        this.surfaceHandle.destroy();
      })
    } else if (this.surfaceHandle.getDisplayMode() === DisplayMode.Visible) {
      this.surfaceHandle.setDisplayMode(DisplayMode.Suspended);
    }
  }

  onUpdateComponent(newDescriptor: Descriptor) {
    this.descriptor = newDescriptor as RootDescriptor
  }

  handleAreaChange(_oldValue: Area, newValue: Area) {
    this.surfaceWidth = newValue.width as number
    this.surfaceHeight = newValue.height as number
    this.surfaceOffsetX = newValue.globalPosition.x as number
    this.surfaceOffsetY = newValue.globalPosition.y as number
    this.updateSurfaceConstraints()
  }

  updateSurfaceConstraints() {
    if (this.shouldStartSurface) {
      this.surfaceHandle.start(
        {
          width: this.surfaceWidth,
          height: this.surfaceHeight,
          surfaceOffsetX: this.surfaceOffsetX,
          surfaceOffsetY: this.surfaceOffsetY,
        },
        this.initialProps).then(() => {
        this.surfaceHandle.setDisplayMode(DisplayMode.Visible)
      })
      this.shouldStartSurface = false

    } else {
      this.surfaceHandle.updateConstraints({
        width: this.surfaceWidth,
        height: this.surfaceHeight,
        surfaceOffsetX: this.surfaceOffsetX,
        surfaceOffsetY: this.surfaceOffsetY,
      });
    }
  }

  handleTouch(event: TouchEvent) {
    this.touchDispatcher.handleTouchEvent(event)
  }

  build() {
    Stack() {
      ForEach(this.descriptor.childrenTags, (childrenTag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
      }, (childrenTag: Tag) => childrenTag.toString())
    }
    .width("100%")
    .height("100%")
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
    .onAreaChange((oldArea, newArea) => this.handleAreaChange(oldArea, newArea))
    .onTouch((e) => this.handleTouch(e))
  }
}
