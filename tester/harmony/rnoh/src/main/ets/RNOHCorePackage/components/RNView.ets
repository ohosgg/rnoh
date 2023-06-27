import { RNOHContext } from '../../RNOH/RNOHContext'
import { RNViewBase } from './RNViewBase'

@Component
export struct RNView {
  ctx: RNOHContext
  tag: number
  @BuilderParam renderDescriptors: () => void

  build() {
    RNViewBase({
      ctx: this.ctx,
      tag: this.tag,
    }) {
      this.renderDescriptors()
    }
  }
}