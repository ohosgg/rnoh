import { RNComponentFactory, ComponentBuilderContext } from './RNComponentFactory'
import { RNOHContext, Tag } from "./RNOH"
import { Descriptor } from './RNOH'
import { ViewBaseProps } from './RNOHCorePackage/components/RNViewBase'
import { convertColorSegmentsToString } from './RNOH'
import { TouchDispatcher } from './RNOH/TouchDispatcher'

export type RootDescriptor = Descriptor<"RootView", ViewBaseProps>

@Component
export struct RNSurface {
  ctx: RNOHContext
  appKey: string
  initialProps: Record<string, any>
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void
  surfaceWidth: number = 0
  surfaceHeight: number = 0
  surfaceOffsetX: number = 0
  surfaceOffsetY: number = 0
  @State descriptor: RootDescriptor = {} as RootDescriptor
  @State hasStartedSurface: boolean = false
  private tag: Tag
  private cleanup?: () => void = undefined
  private touchDispatcher: TouchDispatcher

  aboutToAppear() {
    this.tag = this.ctx.rnInstanceManager.createSurface(this.appKey);
    this.descriptor = this.ctx.rnInstanceManager.descriptorRegistry.getDescriptor(this.tag)
    this.touchDispatcher = new TouchDispatcher(this.tag, this.ctx.rnInstance, this.ctx.logger)
    this.cleanup = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      this.tag,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    )
  }

  aboutToDisappear() {
    this.cleanup?.();
    this.ctx.rnInstanceManager.stopSurface(this.tag);
    this.ctx.rnInstanceManager.destroySurface(this.tag);
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
    if (!this.hasStartedSurface) {
      this.ctx.rnInstanceManager.startSurface(
        this.tag,
        {
          appKey: this.appKey,
          width: this.surfaceWidth,
          height: this.surfaceHeight,
          surfaceOffsetX: this.surfaceOffsetX,
          surfaceOffsetY: this.surfaceOffsetY,
        },
        this.initialProps)
      this.hasStartedSurface = true
    } else {
      this.ctx.rnInstanceManager.updateSurfaceConstraints(this.tag, {
        appKey: this.appKey,
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
      if (this.hasStartedSurface) {
        ForEach(this.descriptor.childrenTags, (childrenTag) => {
          RNComponentFactory({ ctx: this.ctx, tag: childrenTag, buildCustomComponent: this.buildCustomComponent })
        }, childrenTag => childrenTag)
      }
    }
    .width("100%")
    .height("100%")
    .backgroundColor(convertColorSegmentsToString(this.descriptor.props.backgroundColor))
    .onAreaChange(this.handleAreaChange.bind(this))
    .onTouch(this.handleTouch.bind(this))
  }
}
