import hilog from '@ohos.hilog';

export interface RNOHLogger {
  info(format: string, ...args: any[]): void

  warn(format: string, ...args: any[]): void

  error(format: string, ...args: any[]): void

  fatal(format: string, ...args: any[]): void

  debug(format: string, ...args: any[]): void
}

export class StandardRNOHLogger implements RNOHLogger {
  private domain: number = 0xBEEF;
  private tag: string = 'RNOH';

  public info(format: string, ...args: any[]): void {
    hilog.info(this.domain, this.tag, "[RNOH] " + format, ...args);
  }

  public warn(format: string, ...args: any[]): void {
    hilog.warn(this.domain, this.tag, format, ...args);
  }

  public error(format: string, ...args: any[]): void {
    hilog.error(this.domain, this.tag, format, ...args);
  }

  public fatal(format: string, ...args: any[]): void {
    hilog.fatal(this.domain, this.tag, format, ...args);
  }

  public debug(format: string, ...args: any[]): void {
    hilog.debug(this.domain, this.tag, format, ...args);
  }
}

