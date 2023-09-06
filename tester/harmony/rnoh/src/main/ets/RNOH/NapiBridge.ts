import { TurboModuleProvider } from "./TurboModuleProvider";
import { Mutation } from "./Mutation";
import { Tag } from "./DescriptorBase";
import TextMeasurer from "@ohos.measure"

declare function px2vp(px: number): number

type TextMeasurerConfig = {
  textContent: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: number;
  maxWidth?: number;
  numberOfLines: number;
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
      maxLines: config.numberOfLines
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
      maxLines: config.numberOfLines
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
    initialSurfaceWidth: number,
    initialSurfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
    appName: string,
    initialProps: any) {
    this.libRNOHApp?.startSurface(
      instanceId,
      initialSurfaceWidth,
      initialSurfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY,
      appName,
      initialProps,
    );
  }

  updateSurfaceConstraints(
    instanceId: number,
    appName: string,
    surfaceWidth: number,
    surfaceHeight: number,
    surfaceOffsetX: number,
    surfaceOffsetY: number,
  ) {
    this.libRNOHApp?.updateSurfaceConstraints(
      instanceId,
      appName,
      surfaceWidth,
      surfaceHeight,
      surfaceOffsetX,
      surfaceOffsetY
    );
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
