import window from '@ohos.window';
import display from '@ohos.display';
import { TurboModule, TurboModuleContext } from "../../RNOH";
import { StatusBarTurboModule } from "./StatusBarTurboModule"

declare function px2vp(arg: number): number

export class SafeAreaTurboModule extends TurboModule {
  public static readonly NAME = 'SafeAreaTurboModule';
  private statusBarTurboModule: StatusBarTurboModule

  constructor(ctx: TurboModuleContext) {
    super(ctx)
    this.statusBarTurboModule = ctx.rnInstance.getTurboModule<StatusBarTurboModule>(StatusBarTurboModule.NAME)
    this.statusBarTurboModule.subscribe("SYSTEM_BAR_VISIBILITY_CHANGE", this.onSystemBarVisibilityChange.bind(this))
    this.ctx.rnInstance.subscribeToLifecycleEvents("CONFIGURATION_UPDATE", this.onSystemBarVisibilityChange.bind(this));
  }

  private onSystemBarVisibilityChange() {
    this.getInsets().then((insets) => {
      this.ctx.rnInstance.emitDeviceEvent("SAFE_AREA_INSETS_CHANGE", insets);
    })
  }

  public async getInsets(): Promise<SafeAreaInsets> {
    const [displayCutoutInfo, systemAvoidArea, cutoutAvoidArea] = await Promise.all([
    display.getDefaultDisplaySync().getCutoutInfo(),
    this.ctx.window.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM),
    this.ctx.window.getWindowAvoidArea(window.AvoidAreaType.TYPE_CUTOUT),
    ])
    display.getDefaultDisplaySync().orientation
    const waterfallAvoidArea: window.AvoidArea = {
      visible: true,
      leftRect: displayCutoutInfo.waterfallDisplayAreaRects.left,
      rightRect: displayCutoutInfo.waterfallDisplayAreaRects.right,
      topRect: displayCutoutInfo.waterfallDisplayAreaRects.top,
      bottomRect: displayCutoutInfo.waterfallDisplayAreaRects.bottom
    }
    const avoidAreas = [cutoutAvoidArea, waterfallAvoidArea]
    if (!this.statusBarTurboModule.isStatusBarHidden()) {
      avoidAreas.push(systemAvoidArea)
    }
    const insets = getSafeAreaInsetsFromAvoidAreas(avoidAreas, this.ctx.window.getWindowProperties().windowRect)
    return mapProps(insets, (val) => px2vp(val))
  }
}

type SafeAreaInsets = {
  top: number,
  left: number,
  right: number,
  bottom: number
}

function getSafeAreaInsetsFromAvoidAreas(avoidAreas: window.AvoidArea[], windowSize: {
  width: number,
  height: number
}): SafeAreaInsets {
  return avoidAreas.reduce((currentInsets, avoidArea) => {
    return {
      top: Math.max(currentInsets.top, avoidArea.topRect.height + avoidArea.topRect.top),
      left: Math.max(currentInsets.left, avoidArea.leftRect.width + avoidArea.leftRect.left),
      right: Math.max(currentInsets.right, avoidArea.rightRect.left > 0 ? windowSize.width - avoidArea.rightRect.left : 0),
      bottom: Math.max(currentInsets.bottom, avoidArea.bottomRect.top > 0 ? windowSize.height - avoidArea.bottomRect.top : 0),
    }
  }, { top: 0, left: 0, right: 0, bottom: 0 })
}


function mapProps<TObj extends Record<string, any>>(obj: TObj, cb: <TKey extends keyof TObj>(value: TObj[TKey], key: TKey) => TObj[TKey]) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key as keyof TObj] = cb(value, key)
    return acc
  }, {} as Partial<TObj>) as TObj
}


