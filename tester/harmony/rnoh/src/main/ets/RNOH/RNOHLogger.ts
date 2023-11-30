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
  private tag: string = '#RNOH_ARK';

  public info(...args: any[]): void {
    this.log("info", ...args)
  }

  public warn(...args: any[]): void {
    this.log("warn", ...args)
  }

  public error(...args: any[]): void {
    this.log("error", ...args)
  }

  public fatal(...args: any[]): void {
    this.log("fatal", ...args)
  }

  public debug(...args: any[]): void {
    this.log("debug", ...args)
  }

  private log(severity: "info" | "debug" | "fatal" | "error" | "warn",...args: any[]): void {
    hilog[severity](this.domain, this.tag, 'X__ %{public}s', ...args);
  }
}

