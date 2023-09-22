import { TurboModuleProvider } from "./TurboModuleProvider";
import { Mutation } from "./Mutation";
import { Tag } from "./DescriptorBase";
import TextMeasurer from "@ohos.measure"
import { DisplayMode } from './CppBridgeUtils';

declare function px2vp(px: number): number

type TextMeasurerConfig = {
  textContent: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: number;
  maxWidth?: number;
  numberOfLines: number;
  letterSpacing?: number;
}

export class NapiBridge {
  constructor(private libRNOHApp: any) {
  }

  initializeReactNative(instanceId: number, turboModuleProvider: TurboModuleProvider) {
    this.libRNOHApp?.initializeReactNative(
      instanceId,
      turboModuleProvider,
      (config: TextMeasurerConfig) => {
        const result = this.measureText(config)
        return {width: px2vp(result.width), height: px2vp(result.height)}
      });
  }

  private measureText(config: TextMeasurerConfig){
    let textSize = TextMeasurer.measureTextSize({
      textContent: config.textContent,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      fontWeight: config.fontWeight,
      maxLines: config.numberOfLines,
      letterSpacing: config.letterSpacing
    });

    if (px2vp(textSize.width as number) < config.maxWidth) {
      return textSize as {width: number, height: number};
    }

    return TextMeasurer.measureTextSize({
      textContent: config.textContent,
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      fontWeight: config.fontWeight,
      constraintWidth: config.maxWidth,
      maxLines: config.numberOfLines,
      letterSpacing: config.letterSpacing
    }) as {width: number, height: number};
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

  loadScriptFromString(instanceId: number, script: string, sourceURL = "bundle.harmony.js") {
    this.libRNOHApp?.loadScriptFromString(instanceId, script, sourceURL);
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
