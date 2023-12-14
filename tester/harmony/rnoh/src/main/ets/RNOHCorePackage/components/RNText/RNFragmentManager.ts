import {
  Point,
  RNOHContext
} from '../../../RNOH/ts';
import type { Tag } from '../../../RNOH/DescriptorBase';
import { RNViewManager } from '../../componentManagers/RNViewManager';
import { RNParagraphManager } from './RNParagraphManager';
import type { TextDescriptor } from './types';

export class RNFragmentManager extends RNViewManager {
  constructor(
    tag: Tag,
    ctx: RNOHContext,
    parentTag: Tag,
  ) {
    super(tag, ctx);
    this.parentTag = parentTag;
  }

  public canHandleTouch() {
    return true;
  }

  /**
   * Check if the touch is within a view
   * @param x - horizontal offset of the touch, relative to the view
   * @param y - vertical offset of the touch, relative to the view
   * @returns whether the touch is within the view
   */
  public isPointInView({x, y}: Point): boolean {
    const parentComponentManager = this.componentManagerRegistry.getComponentManager(this.parentTag) as RNParagraphManager;
    const parentDescriptor = this.descriptorRegistry.getDescriptor<TextDescriptor>(this.parentTag);
    // TODO: creating layout is expensive, we should cache it - https://gl.swmansion.com/rnoh/react-native-harmony/-/issues/684
    const layout = parentComponentManager.createLayout(parentDescriptor);
    const positionedLines = layout.positionedLines
    for (let line of positionedLines) {
      for (let { fragment, positionRelativeToLine, size } of line.positionedFragments) {
        if (fragment.type === 'placeholder' || fragment.extraData?.tag !== this.tag) {
          continue;
        }
        const relativePosition = { x: line.positionRelativeToParagraph.x + positionRelativeToLine.x, y: line.positionRelativeToParagraph.y + positionRelativeToLine.y };
        const withinX = x >= relativePosition.x && x <= (relativePosition.x + size.width);
        const withinY = y >= relativePosition.y && y <= (relativePosition.y + size.height);
        if (withinX && withinY) {
          return true;
        }
      }
    }
    return false
  }
}