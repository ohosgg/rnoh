import type { TurboModuleProvider } from "./TurboModuleProvider";
import type { Mutation } from "./Mutation";
import type { Tag } from "./DescriptorBase";
import type { AttributedString, ParagraphAttributes, LayoutConstrains } from "./TextLayoutManager";
import { measureParagraph } from "./TextLayoutManager"
import type { DisplayMode } from './CppBridgeUtils';

export class NapiBridge {
  constructor(private libRNOHApp: any) {
  }

  createReactNativeInstance(instanceId: number,
                        turboModuleProvider: TurboModuleProvider,
                        mutationsListener: (mutations: Mutation[]) => void,
                        componentCommandsListener: (tag: Tag,
                                                     commandName: string,
                                                     args: unknown) => void) {
    this.libRNOHApp?.createReactNativeInstance(
      instanceId,
      turboModuleProvider,
      mutationsListener,
      componentCommandsListener,
      (attributedString: AttributedString, paragraphAttributes: ParagraphAttributes, layoutConstraints: LayoutConstrains) => {
        try {
          return measureParagraph(attributedString, paragraphAttributes, layoutConstraints)
        } catch (err) {
          console.error(err)
          throw err
        }
      });
  }

  emitComponentEvent(instanceId: number, tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.libRNOHApp?.emitComponentEvent(instanceId, tag, eventEmitRequestHandlerName, payload);
  }

  loadScript(instanceId: number, bundle: ArrayBuffer, sourceURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.libRNOHApp?.loadScript(instanceId, bundle, sourceURL, (errorMsg: string) => {
        errorMsg ? reject(new Error(errorMsg)) : resolve()
      });
    })
  }

  async startSurface(
    instanceId: number,
    surfaceTag: number,
    initialSurfaceWidth: number,
    initialSurfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    initialProps: any) {
    return new Promise(resolve => {
      this.libRNOHApp?.startSurface(
        instanceId,
        surfaceTag,
        initialSurfaceWidth,
        initialSurfaceHeight,
        surfaceOffsetX,
        surfaceOffsetY,
        initialProps,
        () => resolve(undefined)
      );
    })
  }

  updateSurfaceConstraints(
    instanceId: number,
    surfaceTag: number,
    surfaceWidth: number,
    surfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
  ) {
    this.libRNOHApp?.updateSurfaceConstraints(
      instanceId,
      surfaceTag,
      surfaceWidth,
      surfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY
    );
  }

  createSurface(
    instanceId: number,
    surfaceTag: number,
    appKey: string,
  ) {
    this.libRNOHApp?.createSurface(
      instanceId,
      surfaceTag,
      appKey,
    );
  }

  setSurfaceProps(
    instanceId: number,
    surfaceTag: number,
    props: Record<string, any>,
  ) {
    this.libRNOHApp?.setSurfaceProps(
      instanceId,
      surfaceTag,
      props,
    )
  }

  async stopSurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    return new Promise((resolve) => {
      this.libRNOHApp?.stopSurface(
        instanceId,
        surfaceTag,
        () => resolve(undefined)
      );
    })
  }

  async destroySurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    return new Promise((resolve) => {
      this.libRNOHApp?.destroySurface(
        instanceId,
        surfaceTag,
        () => resolve(undefined)
      );
    })
  }

  setSurfaceDisplayMode(instanceId: number, surfaceTag: Tag, displayMode: DisplayMode): void {
    this.libRNOHApp?.setSurfaceDisplayMode(instanceId, surfaceTag, displayMode);
  }

  callRNFunction(instanceId: number, moduleName: string, functionName: string, args: unknown[]): void {
    this.libRNOHApp?.callRNFunction(instanceId, moduleName, functionName, args);
  }

  onMemoryLevel(level: number): void {
    this.libRNOHApp?.onMemoryLevel(level)
  }

  updateState(instanceId: number, componentName: string, tag: Tag, state: unknown): void {
    this.libRNOHApp?.updateState(instanceId, componentName, tag, state)
  }
}
