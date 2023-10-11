import { DisplayMode } from './CppBridgeUtils';
import type { Tag } from './DescriptorBase';
import type { NapiBridge } from './NapiBridge';
import type { RNInstance, SurfaceContext } from './RNInstance';

export type SurfaceProps = Record<string, any>;

export class SurfaceHandle {
  private destroyed: boolean = false;
  private displayMode: DisplayMode = DisplayMode.Suspended;
  private props: SurfaceProps

  constructor(
    private rnInstance: RNInstance,
    private tag: Tag,
    private appKey: string,
    private defaultProps: SurfaceProps,
    private napiBridge: NapiBridge,
  ) {
    this.rnInstance.descriptorRegistry.createRootDescriptor(this.tag);
    this.napiBridge.createSurface(this.rnInstance.getId(), this.tag, this.appKey);
    this.props = defaultProps;
  }

  public getTag(): Tag {
    return this.tag;
  }

  public start(ctx: SurfaceContext, props: SurfaceProps) {
    if (this.destroyed) {
      throw new Error("start called on a destroyed surface");
    }
    this.props = { ...this.defaultProps, ...props };
    this.napiBridge.startSurface(
      this.rnInstance.getId(),
      this.tag,
      ctx.width,
      ctx.height,
      ctx.surfaceOffsetX,
      ctx.surfaceOffsetY,
      this.props);
  }

  public stop() {
    if (this.destroyed) {
      throw new Error("stop called on a destroyed surface");
    }
    this.napiBridge.stopSurface(this.rnInstance.getId(), this.tag);
  }

  public updateConstraints(
    {
      width,
      height,
      surfaceOffsetX,
      surfaceOffsetY
    }: SurfaceContext
  ) {
    if (this.destroyed) {
      throw new Error("updateConstraints called on a destroyed surface");
    }
    this.napiBridge.updateSurfaceConstraints(
      this.rnInstance.getId(),
      this.tag,
      width,
      height,
      surfaceOffsetX,
      surfaceOffsetY
    );
  }

  public getDisplayMode(): DisplayMode {
    return this.displayMode;
  }

  public setDisplayMode(displayMode: DisplayMode) {
    if (this.destroyed) {
      throw new Error("setDisplayMode called on a destroyed surface");
    }
    this.napiBridge.setSurfaceDisplayMode(this.rnInstance.getId(), this.tag, displayMode);
  }

  public getProps(): SurfaceProps {
    return this.props;
  }

  public setProps(props: SurfaceProps) {
    this.props = { ...this.defaultProps, ...props };
    this.napiBridge.setSurfaceProps(this.rnInstance.getId(), this.tag, this.props);
  }

  public destroy() {
    if (this.destroyed) {
      throw new Error("destroy called on a destroyed surface");
    }
    this.napiBridge.destroySurface(this.rnInstance.getId(), this.tag);
    this.rnInstance.descriptorRegistry.deleteRootDescriptor(this.tag);
  }
}