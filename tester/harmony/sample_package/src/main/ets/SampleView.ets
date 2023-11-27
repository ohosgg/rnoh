import {
  Descriptor,
  ComponentBuilderContext,
  ViewDynamicProps,
  Tag,
  RNComponentFactory,
  RNOHContext,
  RNViewBase
} from 'rnoh';


export const SAMPLE_VIEW_TYPE: string = "SampleView"

interface SampleViewProps extends ViewDynamicProps {
  size: number
}

export type SampleViewDescriptor = Descriptor<"SampleView", SampleViewProps>


@Component
export struct SampleView {
  ctx!: RNOHContext
  tag: number = 0
  @BuilderParam buildCustomComponent: (componentBuilderContext: ComponentBuilderContext) => void
  @State descriptor: SampleViewDescriptor = {} as SampleViewDescriptor
  @State fontSize: number | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<SampleViewDescriptor>(this.tag)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as SampleViewDescriptor)
      }
    ))
    this.cleanUpCallbacks.push(this.ctx.componentCommandReceiver.registerCommandCallback(this.tag, (commandName) => {
      if (commandName === "toggleFontSize") {
        this.fontSize = this.fontSize ? undefined : 20
      }
    }))
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Text(this.descriptor.tag.toString()).fontColor("white").fontSize(this.fontSize ?? 12)
      ForEach(this.descriptor.childrenTags, (tag: Tag) => {
        RNComponentFactory({ ctx: this.ctx, tag: tag, buildCustomComponent: this.buildCustomComponent })
      }, (tag: Tag) => tag.toString())
    }
  }
}
