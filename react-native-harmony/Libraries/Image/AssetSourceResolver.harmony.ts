import {
  getAssetDestRelativePath,
  Asset,
} from '@rnoh/react-native-harmony-cli/src/assetResolver';

type ResolvedAssetSource = {
  readonly __packager_asset: boolean;
  readonly width?: number;
  readonly height?: number;
  readonly uri: string;
  readonly scale: number;
};

class AssetSourceResolver {
  constructor(
    private serverUrl: string | undefined,
    private jsbundleUrl: string | undefined,
    private asset: Asset
  ) {}

  public defaultAsset(): ResolvedAssetSource {
    return {
      __packager_asset: this.asset.__packager_asset,
      uri: `asset://${getAssetDestRelativePath(this.asset)}`,
      scale: 1,
      width: this.asset.width,
      height: this.asset.height,
    };
  }
}

module.exports = AssetSourceResolver;
