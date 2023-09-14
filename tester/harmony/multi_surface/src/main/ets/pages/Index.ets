import {
  RNAbility,
  RNInstance,
} from 'rnoh'
import { createRNPackages } from '../RNPackagesFactory'

const PAGES = [
  ['app_name', "App"],
  ['tester', "Tester Example"],
  ['animations', "Animations Example"],
  ['checkerboard', "Checkerboard Example"],
  ['chessboard', "Chessboard Example"],
  ['cursor', "Cursor Example"],
  ['image_gallery', "ImageGallery Example"],
  ['large_image_scroll', "LargeImageScroll Example"],
  ['text_scroll', "TextScroll Example"],
  ['flat_list', "FlatListVsScrollView Example"],
  ['toggling', "TogglingComponent Example"],
  ['sticky_headers', "StickyHeaders Example"],
]

@Entry
@Component
struct Index {
  @StorageLink('RNAbility') rnAbility: RNAbility | undefined = undefined

  build() {
    Column() {
      List({ space: 12, initialIndex: 0 }) {
        ListItem() {
          Navigator({target: "pages/ReactApplicationPage", type: NavigationType.Push}) {
            Text("Go to standalone app")
              .fontColor(Color.Blue)
              .width('100%')
              .textAlign(TextAlign.Center)
          }
          .margin(12)
        }
        ForEach(PAGES, ([appKey, name]: string, index: number) => {
          ListItem() {
            Navigator({target: "pages/ReactPage", type: NavigationType.Push}) {
              Text("Go to " + name)
                .fontColor(Color.Blue)
                .width('100%')
                .textAlign(TextAlign.Center)
            }
            .params({appKey})
            .margin(12)
          }
        }, item => item)
      }
      .height('100%')
      .width('100%')
      .divider({strokeWidth: 4})
    }.height('100%')
  }
}
