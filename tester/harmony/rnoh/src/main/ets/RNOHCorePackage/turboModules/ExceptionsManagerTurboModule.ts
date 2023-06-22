import { TurboModule } from "../../RNOH/TurboModule";

export type StackFrame = {
  column?: number,
  file?: string,
  lineNumber?: number,
  methodName: string,
  collapse?: boolean,
};

export type ExceptionData = {
  message: string,
  originalMessage?: string,
  name?: string,
  componentStack?: string,
  stack: StackFrame[],
  id: number,
  isFatal: boolean,
  extraData?: Object,
};

export class ExceptionsManagerTurboModule extends TurboModule {
  reportFatalException(message: string, stack: StackFrame[], exceptionId: number): void {
    this.ctx.logger.error(`ExceptionsManager::reportFatalException ${message}`);
    stack.forEach((frame) => {
      this.ctx.logger.error(JSON.stringify(frame));
    });

    throw new Error(message);
  }

  reportSoftException(message: string, stack: StackFrame[], exceptionId: number): void {
    this.ctx.logger.error(`ExceptionsManager::reportSoftException ${message}`);
    stack.forEach((frame) => {
      this.ctx.logger.error(JSON.stringify(frame));
    });
  }

  reportException(data: ExceptionData): void {
    this.ctx.logger.error(`ExceptionsManager::reportException ${data.message}`);
    data.stack.forEach((frame) => {
      this.ctx.logger.error(JSON.stringify(frame));
    });

    if (data.isFatal) {
      throw new Error(data.message);
    }
  }

  updateExceptionMessage(message: string, stack: StackFrame[], exceptionId: number): void {
    this.ctx.logger.error(`ExceptionsManager::updateExceptionMessage ${message}`);
    stack.forEach((frame) => {
      this.ctx.logger.error(JSON.stringify(frame));
    });
  }

  dismissRedbox(): void {
    // NOOP for now
  }
}