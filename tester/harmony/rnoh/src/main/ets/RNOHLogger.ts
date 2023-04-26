import hilog from '@ohos.hilog';

class Logger {
  private domain: number = 0xBEEF;
  private tag: string = 'RNOH';

  constructor(domain: number, tag: string) {
    this.domain = domain;
    this.tag = tag;
  }

  public info(format: string, ...args: any[]) : void {
    hilog.info(this.domain, this.tag, "[RNOH] "+format, ...args);
  }

  public warn(format: string, ...args: any[]) : void {
    hilog.warn(this.domain, this.tag, format, ...args);
  }

  public error(format: string, ...args: any[]) : void {
    hilog.error(this.domain, this.tag, format, ...args);
  }

  public fatal(format: string, ...args: any[]) : void {
    hilog.fatal(this.domain, this.tag, format, ...args);
  }

  public debug(format: string, ...args: any[]) : void {
    hilog.debug(this.domain, this.tag, format, ...args);
  }
}

export default new Logger(0xBEEF, 'RNOH');
