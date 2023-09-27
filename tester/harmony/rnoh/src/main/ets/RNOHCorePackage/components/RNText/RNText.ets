import { RNOHContext } from '../../../RNOH'
import { TextDescriptor, RNSimpleText } from './RNSimpleText'
import { RNParagraph } from './RNParagraph'

@Component
export struct RNText {
  public ctx: RNOHContext
  public tag: number
  // -------------------------------------------------------------------------------------------------------------------

  @State descriptor: TextDescriptor = {} as TextDescriptor
  private unregisterDescriptorChangesListener?: () => void = undefined

  aboutToAppear() {
    this.onDescriptorChange(this.ctx.descriptorRegistry.getDescriptor<TextDescriptor>(this.tag))
    this.unregisterDescriptorChangesListener = this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.onDescriptorChange(newDescriptor as TextDescriptor)
      }
    )
  }

  onDescriptorChange(newDescriptor: TextDescriptor) {
    this.descriptor = newDescriptor
  }

  aboutToDisappear() {
    this.unregisterDescriptorChangesListener?.()
  }

  build() {
    if (this.descriptor.props.fragments.length <= 1) {
      RNSimpleText({ ctx: this.ctx, tag: this.tag })
    } else {
      RNParagraph({ ctx: this.ctx, tag: this.tag })
    }
  }
}