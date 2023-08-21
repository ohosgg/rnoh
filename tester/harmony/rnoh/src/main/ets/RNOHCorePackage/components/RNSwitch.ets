import { ColorSegments, Descriptor, convertColorSegmentsToString, RNOHContext } from '../../RNOH'
import { ViewBaseProps, RNViewBase } from './RNViewBase'

export type SwitchProps = ViewBaseProps & {
  trackColor?: ColorSegments
  thumbColor?: ColorSegments
  value?: boolean
  disabled?: boolean
}

export type SwitchDescriptor = Descriptor<"Switch", SwitchProps>

@Component
export struct RNSwitch {
  ctx: RNOHContext
  tag: number
  @State private descriptor: SwitchDescriptor = {} as SwitchDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<SwitchDescriptor>(this.tag)
    this.ctx.logger.info(JSON.stringify(this.descriptor.props));
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as SwitchDescriptor)
      }
    )
  }

  onChange(isOn: boolean) {
    this.ctx.rnInstanceManager.emitComponentEvent(
      this.descriptor.tag,
      "onChange",
      {
        value: isOn,
        target: this.descriptor.tag,
      }
    )
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      Toggle({ type: ToggleType.Switch, isOn: this.descriptor.props.value })
        .selectedColor(convertColorSegmentsToString(this.descriptor.props.trackColor))
        .switchPointColor(convertColorSegmentsToString(this.descriptor.props.thumbColor))
        .onChange(this.onChange.bind(this))
        .enabled(!this.descriptor.props.disabled)
    }
  }
}