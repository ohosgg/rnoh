# Performance

## Testing session #1

- Environment: HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis
- react-native-android run in development mode and with the Fabric renderer turned off whereas react-native-harmony run with the development mode turned off and the Fabric renderer turned on.
- This session contains only one sample so it may not be statistically significant. 

Mounting Deep Tree scenario checks how quickly complex component with nested views can be mounted. Updating Colors scenario checks how quickly component non-layout properties can be updated.

|                         | react-native-harmony                                                                                                                                                                                                     | react-native-android                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Recording               | ![](./rn-harmony.mp4)                                                                                                                                                                                                    | ![](./rn-android.mp4)                |
| Tests page              | Noticeable judders when scrolling and test cases mount/unmount components. It may be caused by communicating with Timer turbo module which lives on the main thread. Animations aren't as smooth as they are on Android. | Scrolling and animations are smooth. |
| Mounting Deep Tree      | **3.46 s (+34 %)**                                                                                                                                                                                                       | **2.58 s**                           |
| Mounting Deep Tree (20) | Components mount/unmount once. Maybe ArkTS optimizes this behavior or this RN implementation doesn't handle mutations properly.                                                                                          | -                                    |
| Updating Colors         | **4.85 s**                                                                                                                                                                                                               | **5.66 s (+17 %)**                   |
| Updating Layout         | **17.46 s (+36 %)**                                                                                                                                                                                                      | **12.83 s**                          |

## Testing session #2

- Environment: HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis

Rendering **~10,000** views.

![](./checkerboard-example-preview.png)


|                                  | ArkUI                                                                                                   | react-native-harmony                                                                                              | react-native-android                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Recording                        | [arkui-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/arkui-checkerboard.mp4) | [rn-harmony-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-checkerboard.mp4) | [rn-android-checkerboard.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-android-checkerboard.mp4) |
| Mean [ms]                        | **1588**                                                                                                | **66505 (~42 times slower than ArkUI)**                                                                           | **4307.5 (~2.7 times slower than ArkUI)**                                                                         |
| Sample size                      | 5                                                                                                       | 4                                                                                                                 | 4                                                                                                                 |
| Standard Dev. [ms]               | 70                                                                                                      | 475                                                                                                               | 51                                                                                                                |
| Confidence level                 | 95%                                                                                                     | 95%                                                                                                               | 95%                                                                                                               |
| Margin of error (T-Student) [ms] | 87                                                                                                      | 756                                                                                                               | 81                                                                                                                |
| Upper limit [ms]                 | 1675                                                                                                    | 67261                                                                                                             | 4389                                                                                                              |
| Lower limit [ms]                 | 1501                                                                                                    | 65749                                                                                                             | 4226                                                                                                              |

## Testing session #3

- Environment: HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis

Rendering **~2500** views.

![](./2500-views.png)

|                                  | ArkUI                                                                                               | react-native-harmony                                                                                          | react-native-android                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Recording                        | [arkui-2500-views.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/arkui-2500-views.mp4) | [rn-harmony-2500-views.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-harmony-2500-views.mp4) | [rn-android-2500-views.mp4](https://gl.swmansion.com/rnoh/file-storage/-/blob/main/rn-android-2500-views.mp4) |
| Mean [ms]                        | **436**                                                                                             | **5900 (~14 times slower than ArkUI)**                                                                        | **1104  (~2.5 times slower than ArkUI)**                                                                      |
| Sample size                      | 5                                                                                                   | 5                                                                                                             | 5                                                                                                             |
| Standard Dev. [ms]               | 121                                                                                                 | 166                                                                                                           | 36                                                                                                            |
| Confidence level                 | 95%                                                                                                 | 95%                                                                                                           | 95%                                                                                                           |
| Margin of error (T-Student) [ms] | 150                                                                                                 | 206                                                                                                           | 45                                                                                                            |
| Upper limit [ms]                 | 586                                                                                                 | 6106                                                                                                          | 1149                                                                                                          |
| Lower limit [ms]                 | 285                                                                                                 | 5694                                                                                                          | 1059                                                                                                          |


## Testing session #4 - "Providers fix" evaluation

- Commit https://gl.swmansion.com/rnoh/react-native-harmony/-/commit/fb3c847070e866075d0c662d2adad587d681a506
- Environment: HarmonyOS System-image-phone 3.1.0.306 Release, AMD Ryzen 5900X, 32 GB RAM
- Measurement method: recording analysis

Rendering **~10,000** views. ArkUI and react-native-android data is copied from testing session #2.

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