# Performance

## Rendering a large number of components

### Conclusions
**react-native-harmony is ~2 times slower than react-native-android and ~6 times slower than ArkUI.**

### Details
Rendering ~10,000 tiny views.

- Commit https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fb3c847070e866075d0c662d2adad587d681a506
- Environment: emulator - HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis

![](./checkerboard-example-preview.png)


|                                  | ArkUI                                                                                                   | react-native-harmony                                                                                              | react-native-android                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Recording                        | [arkui-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/arkui-checkerboard.mp4) | [rn-harmony-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-10000-fb3c84.mp4) | [rn-android-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-android-checkerboard.mp4) |
| Mean [ms]                        | **1588**                                                                                                | **9488 (~6 times slower than ArkUI)**                                                                             | **4307.5 (~2.7 times slower than ArkUI)**                                                                         |
| Sample size                      | 5                                                                                                       | 5                                                                                                                 | 4                                                                                                                 |
| Standard Dev. [ms]               | 70                                                                                                      | 842                                                                                                               | 51                                                                                                                |
| Confidence level                 | 95%                                                                                                     | 95%                                                                                                               | 95%                                                                                                               |
| Margin of error (T-Student) [ms] | 87                                                                                                      | 1045                                                                                                              | 81                                                                                                                |
| Upper limit [ms]                 | 1675                                                                                                    | 10533                                                                                                             | 4389                                                                                                              |
| Lower limit [ms]                 | 1501                                                                                                    | 8443                                                                                                              | 4226                                                                                                              |


## Animations
### Conclusions
**Animations performance is not good enough. When native driver is not used, they performance is similar on react-native-harmony and on react-native-android. The native driver has potential to significantly improve the animation performance on react-native-harmony although its implementation might be tricky.**

### Observations

- ArkUI example demonstrates better framerate when rendering 5000 elements than react-native-harmony when rendering 500 elements.
- react-native-harmony and react-native-android when react-native-android (without the native driver) have similar framerate when rendering 500 elements.
- The native driver significantly improves animation performance for react-native-android.
- The impact of the native driver grows with the number of elements.
- Number of elements impacts the performance of animating nonlayoutable properties (like opacity) similarly on react-native-harmony and react-native-android.

### Details

- Commit https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/4f2315dcac3b82931f6bf1f2d14f6e76a07bbe84
- Environment: emulator HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM

|           | ArkUI                                                                                            | react-native-harmony                                                                                      | react-native-android                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Recording | [arkui.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-native-4f2315.mp4) | [rn-harmony.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-animations-4f2315.mp4) | [rn-android.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-android-animations-4f2315.mp4) |


## Startup time

T.B.D.

## Interaction

T.B.D.

## Text rendering

T.B.D.

## Image rendering

T.B.D.

## ScrollView vs FlatList

T.B.D.

## Memory usage

T.B.D.