import type { TurboModuleContext } from '../../RNOH/TurboModule';
import { TurboModule } from '../../RNOH/TurboModule';
import window from '@ohos.window';
import { RNOHLogger } from '../../RNOH/RNOHLogger';

enum DialogButtonDirection {
  AUTO, HORIZONTAL, VERTICAL,
}

interface AlertDialogButtonOptions {
  value: string,
  action: () => void,
}

export class DevMenuTurboModule extends TurboModule {
  public static readonly NAME = 'DevMenu';

  private devMenuDialogVisible: boolean = false;
  private devMenuButtons: AlertDialogButtonOptions[] = []
  private logger: RNOHLogger;

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.logger = this.ctx.logger.clone("DevMenuTurboModule")
    this.createDevMenuDefaultButtons();
  }

  public show() {
    if (!this.devMenuDialogVisible) {
      this.showDevMenuDialog();
    }
  }

  public reload() {
    this.logger.warn("DevMenu::reload is not supported");
  }

  public debugRemotely(enableDebug: boolean) {
    this.logger.warn("DevMenu::enableDebug is not supported");
  }

  public setProfilingEnabled(enabled: boolean) {
    this.logger.warn("DevMenu::setProfilingEnabled is not supported");
  }

  public setHotLoadingEnabled(enabled: boolean) {
    this.logger.warn("DevMenu::setHotLoadingEnabled is not supported");
  }

  private createDevMenuDefaultButtons() {
    this.devMenuButtons.push({
      value: "Toggle Element Inspector",
      action: () => {
        this.ctx.rnInstance.emitDeviceEvent("toggleElementInspector", {});
        this.devMenuDialogVisible = false;
      },
    });
  }

  private showDevMenuDialog() {
    window.getLastWindow(this.ctx.uiAbilityContext).then((value) => {
      {
        const uiContext = value.getUIContext()

        const dialogParams = {
          title: "React Native Dev Menu",
          message: "",
          buttons: this.devMenuButtons,
          buttonDirection: DialogButtonDirection.VERTICAL,
          cancel: () => {
            this.devMenuDialogVisible = false;
          },
        }
        uiContext.showAlertDialog(dialogParams)
        this.devMenuDialogVisible = true;
      }
    }).catch(() => {
      this.logger.error("DevMenu dialog couldn't be displayed.");
      this.devMenuDialogVisible = false;
    })
  }
}