import { DisplayMode } from './CppBridgeUtils';
import type { Tag } from './DescriptorBase';
import type { NapiBridge } from './NapiBridge';
import type { RNInstance, SurfaceContext } from './RNInstance';

export type SurfaceProps = Record<string, any>;

export class SurfaceHandle {
  private destroyed: boolean = false;
  private displayMode: DisplayMode = DisplayMode.Suspended;
  private props: SurfaceProps
  private startingPromise: Promise<unknown> | undefined = undefined
  private isRunning: boolean = false

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

  public async start(ctx: SurfaceContext, props: SurfaceProps) {
    if (this.destroyed) {
      throw new Error("start called on a destroyed surface");
    }
    this.props = { ...this.defaultProps, ...props };
    this.startingPromise = this.napiBridge.startSurface(
      this.rnInstance.getId(),
      this.tag,
      ctx.width,
      ctx.height,
      ctx.surfaceOffsetX,
      ctx.surfaceOffsetY,
      this.props);
    this.startingPromise.then(() => {
      this.isRunning = true
    })
    return this.startingPromise
  }

  public async stop() {
    if (this.destroyed) {
      throw new Error("stop called on a destroyed surface");
    }
    if (this.startingPromise) {
      await this.startingPromise
    }
    const promise = this.napiBridge.stopSurface(this.rnInstance.getId(), this.tag);
    promise.then(() => {
      this.isRunning = false
    })
    return promise
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

  public async destroy() {
    if (this.destroyed) {
      throw new Error("destroy called on a destroyed surface");
    }
    if (this.isRunning) {
      throw new Error("Surface must be stopped before can be destroyed")
    }
    await this.napiBridge.destroySurface(this.rnInstance.getId(), this.tag);
    this.destroyed = true
    this.rnInstance.descriptorRegistry.deleteRootDescriptor(this.tag);
  }
}