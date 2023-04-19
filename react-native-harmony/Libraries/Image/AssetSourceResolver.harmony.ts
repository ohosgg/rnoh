type PackagerAsset = {
  readonly __packager_asset: boolean;
  readonly fileSystemLocation?: string;
  readonly httpServerLocation: string;
  readonly width?: number;
  readonly height?: number;
  readonly scales: number[];
  readonly hash: string;
  readonly name: string;
  readonly type: string;
  [key: string]: any;
};

type ResolvedAssetSource = {
  readonly __packager_asset: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly uri: string;
  readonly scale: number;
};

class AssetSourceResolver {
  constructor(private serverUrl: string | undefined, private jsbundleUrl: string | undefined, private asset: PackagerAsset) {
  }

  public defaultAsset(): ResolvedAssetSource {
    return {
      __packager_asset: this.asset.__packager_asset,
      uri: this.getResourcePath(),
      scale: 1,
      width: this.asset.width,
      height: this.asset.height
    };
  }

  private getResourcePath() {
    const dirPathRelativeToProjectRoot = this.asset.httpServerLocation.replace("/assets/", "");
    return `asset://${dirPathRelativeToProjectRoot}/${this.asset.name}.${this.asset.type}`;
  }
}

module.exports = AssetSourceResolver;

