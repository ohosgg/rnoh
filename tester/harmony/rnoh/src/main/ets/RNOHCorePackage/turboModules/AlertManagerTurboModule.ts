import { TurboModule, TurboModuleContext } from '../../RNOH/TurboModule';
import window from '@ohos.window';

type AlertOptions = {
  title: string
  message?: string
  primaryButton?: string
  secondaryButton?: string
  cancellable: boolean
}

export class AlertManagerTurboModule extends TurboModule {
  public static readonly NAME = 'AlertManager';

  constructor(protected ctx: TurboModuleContext) {
    super(ctx);

  }

  private constants = {
    buttonClicked: 'buttonClicked',
    dismissed: 'dismissed',
    primaryButton: 1,
    secondaryButton: 2,
  }

  private parseButton(button?: string, buttonKey?: number, onAction?: (action: string, buttonKey?: number) => void) {
    if (button) {
      return ({
        value: button,
        action: () => {
          onAction(this.constants.buttonClicked, buttonKey);
        }
      })
    }
    return undefined;
  }

  getConstants() {
    return this.constants;
  }

  alert(options: AlertOptions, onError: (error: string) => void, onAction: (action: string, buttonKey?: number) => void) {
    window.getLastWindow(this.ctx.uiAbilityContext).then((value) => {
      {
        const uiContext = value.getUIContext()

        const primaryButton = this.parseButton(options.primaryButton, this.constants.primaryButton, onAction);
        const secondaryButton = this.parseButton(options.secondaryButton, this.constants.secondaryButton, onAction);

        const alertParams = {
          title: options.title,
          message: options.message,
          autoCancel: options.cancellable,
          primaryButton: primaryButton,
          secondaryButton: secondaryButton,
          cancel: () => {
            onAction(this.constants.dismissed);
          },
        }
        uiContext.showAlertDialog(alertParams)
      }
    }).catch(() => onError("Alert dialog couldn't be displayed."))
  }
}