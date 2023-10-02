import { TurboModuleProvider } from "./TurboModuleProvider";
import { Mutation } from "./Mutation";
import { Tag } from "./DescriptorBase";
import { AttributedString, ParagraphAttributes, LayoutConstrains, measureParagraph } from "./TextLayoutManager"
import { DisplayMode } from './CppBridgeUtils';

export class NapiBridge {
  constructor(private libRNOHApp: any) {
  }

  initializeReactNative(instanceId: number, turboModuleProvider: TurboModuleProvider) {
    this.libRNOHApp?.initializeReactNative(
      instanceId,
      turboModuleProvider,
      (attributedString: AttributedString, paragraphAttributes: ParagraphAttributes, layoutConstraints: LayoutConstrains) => {
        return measureParagraph(attributedString, paragraphAttributes, layoutConstraints)
      });
  }

  emitComponentEvent(instanceId: number, tag: Tag, eventEmitRequestHandlerName: string, payload: any) {
    this.libRNOHApp?.emitComponentEvent(instanceId, tag, eventEmitRequestHandlerName, payload);
  }

  subscribeToShadowTreeChanges(
    instanceId: number,
    mutationsListener: (mutations: Mutation[]) => void,
    dispatchedCommandsListener: (tag: Tag, commandName: string, args: unknown) => void
  ) {
    this.libRNOHApp?.subscribeToShadowTreeChanges(instanceId, mutationsListener, dispatchedCommandsListener);
  }

  loadScript(instanceId: number, bundle: ArrayBuffer, sourceURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.libRNOHApp?.loadScript(instanceId, bundle, sourceURL, (errorMsg: string) => {
        errorMsg ? reject(new Error(errorMsg)) : resolve()
      });
    })
  }

  startSurface(
    instanceId: number,
    surfaceTag: number,
    initialSurfaceWidth: number,
    initialSurfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    initialProps: any) {
    this.libRNOHApp?.startSurface(
      instanceId,
      surfaceTag,
      initialSurfaceWidth,
      initialSurfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      initialProps,
    );
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

  stopSurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    this.libRNOHApp?.stopSurface(
      instanceId,
      surfaceTag,
    );
  }

  destroySurface(
    instanceId: number,
    surfaceTag: number,
  ) {
    this.libRNOHApp?.destroySurface(
      instanceId,
      surfaceTag,
    );
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
