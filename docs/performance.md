# Performance

## Rendering a large number of components

This benchmark represents an unusual situation, however it was easy to perform.

### Conclusions

**react-native-harmony is ~2 times slower than react-native-android and ~6 times slower than ArkUI. These values are more or less what was expected.**

### Details

Rendering ~10,000 tiny views.

- Commit https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fb3c847070e866075d0c662d2adad587d681a506
- Environment: emulator - HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis

![](./checkerboard-example-preview.png)

|                                  | ArkUI                                                                                                   | react-native-harmony                                                                                              | react-native-android                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Recording                        | [arkui-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/arkui-checkerboard.mp4) | [rn-harmony-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-10000-fb3c84.mp4) | [rn-android-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-android-checkerboard.mp4) |
| Mean [ms]                        | 1588                                                                                                    | 9488                                                                                                              | 4307.5                                                                                                            |
| Sample size                      | 5                                                                                                       | 5                                                                                                                 | 4                                                                                                                 |
| Standard Dev. [ms]               | 70                                                                                                      | 842                                                                                                               | 51                                                                                                                |
| Confidence level                 | 95%                                                                                                     | 95%                                                                                                               | 95%                                                                                                               |
| Margin of error (T-Student) [ms] | 87                                                                                                      | 1045                                                                                                              | 81                                                                                                                |
| Upper limit [ms]                 | 1675                                                                                                    | 10533                                                                                                             | 4389                                                                                                              |
| Lower limit [ms]                 | 1501                                                                                                    | 8443                                                                                                              | 4226                                                                                                              |

## Animations

Animations, although they are not essential from the functional perspective, they enhance UX and are used in almost every application.

### Conclusions

**Animations performance is not good enough. When native driver is not used, the performance is similar both on react-native-harmony and react-native-android. The native driver has potential to significantly improve the animation's performance on react-native-harmony although its implementation might be tricky.**

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

Startup time gives the first impression to the user. Users may assume that if the startup is slow, the app may struggle with other aspects as well.

### Conclusions

**react-native-harmony's startup time is ~4 times slower than ArkUI and ~5 times slower than react-native-android. There is a room for improvement on the react-native-harmony side e.g. currently, react-native-harmony tries to download a JS bundle from the metro server and fallbacks to included JS bundle.**

### Details

- Commit https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/beb980274c5110e9144f16e09050646c5e691c2b
- Environment: emulator - HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis
- Application complexity: low ("hello world" example)

|                    | ArkUI | react-native-harmony | react-native-android |
| ------------------ | ----- | -------------------- | -------------------- |
| Mean [ms]          | 734   | 2984                 | 556                  |
| Sample size        | 5     | 5                    | 5                    |
| Standard Dev. [ms] | 77    | 80                   | 22                   |

## Interaction

In this test, a simple component with a text inside was dragged on the screen.

## Conclusions

react-native-harmony loses 4.5 FPS to ArkUI and react-native-android. react-native-android feels smoother than ArkUI.

### Details

- Environment: emulator - HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: ArkUI and rn-harmony: custom script that analyzes hdc output; Android: perf monitor
- Application complexity: minimal
- ArkUI emits touch event 60 times per second
- Component was dragged with `adb shell input swipe`


|                     | ArkUI | react-native-harmony | react-native-android |
| ------------------- | ----- | -------------------- | -------------------- |
| Mean [FPS]          | 59,58 | 55,04                | 60                   |
| Sample size         | 5     | 5                    | 1                    |
| Standard Dev. [FPS] | 0.7   | 3                    | 0                    |

## Text rendering

This benchmark's intention was to test rendering of large amounts of Text views in a Scroll/Scrollview. This can give us an idea about the performance of rendering text.

### Conclusions

**The rendering of text is slightly slower on ArkUI than on react-native-android. react-native-harmony is noticeably slower than ArkUI. We suspect sending scroll events from ArkUI to React may have the impact on performance but this must be yet confirmed. **

### Details

- Commit: https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/8bb8b4f41ecad9db2c274f0fc470fb83dff2f5d4
- Environment: emulator - HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 6850U, 16 GB RAM
- Measurement method: analysis fom output of Flipper - RN Perf Monitor on Android, and hitrace on Harmony
- Application complexity: low (scrollview with n text components)

|                                     | ArkUI | react-native-harmony | react-native-android |
| ----------------------------------- | ----- | -------------------- | -------------------- |
| Sample size                         | 5     | 5                    | 5                    |
| Mean - 1000 comp. [FPS]             | 58.2  | 51.7                 | 59.5                 |
| 95th percentile - 1000 comp. [FPS]  | 56.0  | 52.1                 | 60.0                 |
| Standard Dev. - 1000 comp. [FPS]    | 1.9   | 2.4                  | 0.3                  |
| Mean - 10000 comp. [FPS]            | 24.2  | 10.3                 | 33.5                 |
| 95th percentile - 10000 comp. [FPS] | 21.4  | 10.4                 | 34.0                 |
| Standard Dev. - 10000 comp. [FPS]   | 1.3   | 0.4                  | 1.6                  |

## Image rendering

T.B.D.

## ScrollView vs FlatList

T.B.D.

## Memory usage

T.B.D.
