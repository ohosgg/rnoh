export type Result<TOk> =
  | { ok: TOk; errMsg?: undefined }
  | { ok?: undefined; errMsg: string };
