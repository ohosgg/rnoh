import { TurboModule } from "../../TurboModule";

export class SourceCodeTurboModule extends TurboModule {
  getConstants(): { scriptURL: string | null; } {
    // TODO: return a link when the bundle is loaded from a server
    return {scriptURL: null};
  }
}