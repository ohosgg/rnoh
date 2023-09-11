# Native API

## Entry

### Single Instance, Single Bundle
```ts
// harmony/entry/src/main/ets/entryability/EntryAbility.ts

import { RNAbility } from 'rnoh/ts';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }
}
```

```ts
// harmony/entry/src/main/ets/pages/Index.ets

import { ... } from 'rnoh'
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct Index {
  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    // bind custom components
  }

  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      RNApp({
        // name used to register components in AppRegistry
        appKey: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        // RNApp takes the responsibility of creating and managing RNInstance
        rnInstance: { createRNPackages },
        // if provided, RNApp will try to run the bundle on rnInstance
        jsBundleProvider: new DefaultJSBundleProvider()
      })
    }
    .height('100%')
    .width('100%')
  }
}
```

### Single Instance, Multiple Bundles
```ts
// harmony/entry/src/main/ets/entryability/EntryAbility.ts

import { RNAbility } from 'rnoh/ts';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }

  async onCreate(ctx) {
    super(ctx)
    const rnInstance = this.createAndRegisterRNInstance({ createRNPackages })
    await rnInstance.runJSBundle(new AssetsBundleProvider("core.bundle.js"))
    AppStorage.setOrCreate("MyRnInstance", rnInstance)
  }
}
```

```ts
// harmony/entry/src/main/ets/pages/Index.ets

import { ... } from 'rnoh'
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @StorageLink('MyRnInstance') rnInstance: RNInstance | undefined = undefined 
  
  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    // bind custom components
  }

  build() {
    Column() {
      RNApp({
        appKey: "app_name",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        rnInstance: this.rnInstance,
        jsBundleProvider: new AssetsBundleProvider("featureA.bundle.js", { canOnlyRunOnce: true, })
      })
    }
    .height('100%')
    .width('100%')
  }
}
```

## Multiple Instances, Single Bundle
```ts
// harmony/entry/src/main/ets/entryability/EntryAbility.ts

import {RNAbility} from 'rnoh/ts';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }
}
```

```ts
// harmony/entry/src/main/ets/pages/Index.ets

import { ... } from 'rnoh'
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    // bind custom components
  }

  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      RNApp({
        appKey: "first_app",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        rnInstance: { createRNPackages },
        // canOnlyRunOnce prevents RNInstance from running the same bundle. It's useful, if `RNInstance`` lives in `RNAbility` and bundle is loaded from `aboutToAppear``
        jsBundleProvider: new AssetsJSBundleProvider("first.bundle.js", { canOnlyRunOnce: true })
      }),
      RNApp({
        appKey: "second_app",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        rnInstance: { createRNPackages },
        jsBundleProvider: new AssetsJSBundleProvider("second.bundle.js", { canOnlyRunOnce: true })
      })
    }
    .height('100%')
    .width('100%')
  }
}
```

## Multiple Instances, Multiple Bundles
```ts
// harmony/entry/src/main/ets/entryability/EntryAbility.ts

import { RNAbility } from 'rnoh/ts';
import { createRNPackages } from '../RNPackagesFactory'

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }

  async onCreate(ctx) {
    super(ctx)
    const rnInstance1 = this.createAndRegisterRNInstance({ createRNPackages, initialParams: {} })
    const rnInstance2 = this.createAndRegisterRNInstance({ createRNPackages, initialParams: {} })
    await rnInstance1.runJSBundle(new AssetsBundleProvider("basic.bundle.js"))
    await rnInstance2.runJSBundle(new AssetsBundleProvider("basic.bundle.js"))
    AppStorage.setOrCreate("MyRNInstance1", rnInstance1)
    AppStorage.setOrCreate("MyRNInstance2", rnInstance2)
  }
}
```

```ts
// harmony/entry/src/main/ets/pages/Index.ets

import { ... } from 'rnoh'

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined
  @StorageLink('MyRNInstance1') rnInstance1: RNInstance | undefined = undefined 
  @StorageLink('MyRNInstance2') rnInstance2: RNInstance | undefined = undefined 

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    // bind custom components
  }

  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  build() {
    Column() {
      RNApp({
        appKey: "first_app",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        rnInstance: this.rnInstance1,
        jsBundleProvider: new AssetsJSBundleProvider("featureA.bundle.js")
      }),
      RNApp({
        appKey: "second_app",
        buildCustomComponent: this.buildCustomComponent.bind(this),
        rnInstance: this.rnInstance2,
        jsBundleProvider: new AssetsJSBundleProvider("featureB.bundle.js")
      })
    }
    .height('100%')
    .width('100%')
  }
}
```

## Multiple Surfaces, Single Instance, Single Bundle

```ts
// harmony/entry/src/main/ets/entryability/EntryAbility.ts

import { RNAbility } from 'rnoh/ts';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }
}
```

```ts
// harmony/entry/src/main/ets/pages/Index.ets

import { ... } from 'rnoh'
import { createRNPackages } from '../RNPackagesFactory'

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') private rnAbility: RNAbility | undefined = undefined
  private rnInstance: RNInstance | undefined = undefined
  private rnohContext: RNOHContext | undefined = undefined
  private shouldShowSurfaces: boolean = false

  @Builder
  buildCustomComponent(ctx: ComponentBuilderContext) {
    // bind custom components
  }

  onBackPress() {
    return this.rnAbility?.onBackPress();
  }

  aboutToAppear() {
    this.rnInstance = this.rnAbility.createAndRegisterRNInstance({ createRNPackages })
    this.rnohContext = this.rnAbility.createRNOHContext(rnInstance)
    this.rnInstance.runJSBundle(new DefaultJSBundleProvider()).then(() => {
      this.shouldShowSurfaces = true
    })
  }

  aboutToDisappear() {
    this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance)
  }

  build() {
    Column() {
      if (this.shouldShowSurfaces) {
        RNSurface({
          appKey: "componentA",
          ctx: this.rnohContext,
          buildCustomComponent: this.buildCustomComponent.bind(this),
          rnInstance: this.rnInstance
        })
        RNSurface({
          appKey: "componentB",
          ctx: this.rnohContext,
          buildCustomComponent: this.buildCustomComponent.bind(this),
          rnInstance: this.rnInstance
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
```

## Packages

T.B.D.

