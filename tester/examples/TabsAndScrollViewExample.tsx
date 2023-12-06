import React, {Component} from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  View,
  Text,
  ImageBackground,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
const sortFiledList = [
  {
    sortCode: '0',
    sortName: '综合',
  },
  {
    sortCode: '2',
    sortName: '最新',
  },
  {
    sortCode: '3',
    sortName: '评论数',
  },
  {
    sortCode: '1',
    sortName: '价格',
  },
];
export class TabsAndScrollViewExample extends Component<any, any> {
  appScrollView: any;
  itemList: Array<any> = [];
  scrollViewStartOffsetY: number = 0;
  slideDirection = 'slideDown';
  scrollY = new Animated.Value(0);
  slideUpViewObj: any;
  slideDownViewObj: any;
  constructor(props: any) {
    super(props);
    this.state = {
      sortFiledList: [],
      resultList: [1],
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      slideDirection: 'slideDown',
      oldSlideDirection: 'slideDown',
      slideUpViewStyle: {zIndex: 2, opacity: 1},
      slideDownViewStyle: {zIndex: -1, opacity: 2},
    };
    this.appScrollView = React.createRef();
    this.slideUpViewObj = React.createRef();
    this.slideDownViewObj = React.createRef();
  }
  _scrollyiChange = (e: any) => {
    const scrollY = Math.ceil(e.nativeEvent.contentOffset.y);
    if (Math.ceil(this.scrollViewStartOffsetY) < scrollY) {
      //slideUp
      if (this.slideDirection !== 'slideUp') {
        this.slideDirection = 'slideUp';
        this.setState({
          slideUpViewStyle: {zIndex: 2, opacity: 1},
          slideDownViewStyle: {zIndex: -1, opacity: 0},
        });
      }
    } else if (Math.ceil(this.scrollViewStartOffsetY) > scrollY) {
      //slideDown
      if (this.slideDirection !== 'slideDown') {
        this.slideDirection = 'slideDown';
        this.setState({
          slideUpViewStyle: {zIndex: -1, opacity: 0},
          slideDownViewStyle: {zIndex: 2, opacity: 1},
        });
      }
    }
    if (scrollY === 0) {
      this.setState({
        slideUpViewStyle: {zIndex: 2, opacity: 1},
        slideDownViewStyle: {zIndex: -1, opacity: 0},
      });
    }
    this.scrollViewStartOffsetY = scrollY;
  };
  _onMomentumScrollEnd = (e: any) => {
    DeviceEventEmitter.emit('onScrollEvent', e, 'categoryList');
  };
  _onScrollBeginDrag = (e: any) => {
    DeviceEventEmitter.emit('onScrollBeginDragEvent', e);
  };
  changeSort = () => {
    this.setState({
      resultList: [],
    });
    setTimeout(() => {
      this.setState({
        resultList: [1],
      });
    }, 1000);
  };
  renderProductList = () => {
    const images = new Array(18).fill(
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4',
    );
    return this.state.resultList.length > 0
      ? images.map((image, imageIndex) => {
          return (
            <View
              style={{
                width: 300,
                height: 140,
                borderRadius: 40,
                borderWidth: 5,
                backgroundColor: 'pink',
              }}
              key={imageIndex}>
              <ImageBackground
                source={{
                  uri: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4',
                }}
                style={{
                  flex: 1,
                  marginVertical: 4,
                  marginHorizontal: 16,
                  borderRadius: 5,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'rgba(0,0,0, 0.7)',
                    paddingHorizontal: 24,
                    paddingVertical: 8,
                    borderRadius: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    {'Image - ' + imageIndex}
                  </Text>
                </View>
              </ImageBackground>
            </View>
          );
        })
      : null;
  };
  renderFlatList = () => {
    return (
      <Animated.ScrollView
        ref={this.appScrollView}
        scrollEnabled={true}
        scrollEventThrottle={5}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode={'never'}
        onScrollBeginDrag={this._onScrollBeginDrag}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
        removeClippedSubviews={false}
        bounces={false}
        automaticallyAdjustContentInsets={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {y: this.scrollY},
              },
            },
          ],
          {
            useNativeDriver: false,
            listener: (e: any) => {
              this._scrollyiChange(e);
              DeviceEventEmitter.emit(
                'onOutScrollViewScroll',
                e.nativeEvent.contentOffset.y,
                'categoryList',
              );
            },
          },
        )}
        style={{
          minHeight: 800,
          paddingTop: 190,
        }}>
        {this.renderProductList()}
      </Animated.ScrollView>
    );
  };
  getTranslateYByApp = () => {
    let translateY: any;
    let y = 150;
    translateY = this.scrollY.interpolate({
      inputRange: [-1, 0, y, y + 1],
      outputRange: [0, 0, -y + 0, -y + 0],
    });
    return translateY;
  };
  renderSort = () => {
    return (
      <View
        style={{
          width: '100%',
          height: 40,
          display: 'flex',
          flexDirection: 'row',
        }}>
        {sortFiledList.map((item, index) => (
          <View
            style={{backgroundColor: 'yellow', width: '25%'}}
            key={item.sortCode + '_' + index}>
            {item.sortCode !== '-1' ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  this.changeSort();
                }}>
                <View
                  style={{
                    width: '100%',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  {index === sortFiledList.length - 1 ? (
                    <View
                      style={{
                        position: 'absolute',
                        width: 1,
                        justifyContent: 'center',
                        height: 40,
                        left: 0,
                        top: 0,
                      }}>
                      <View
                        style={{
                          width: 1,
                          height: 16,
                          backgroundColor: 'red',
                        }}
                      />
                    </View>
                  ) : null}
                  <Text
                    ellipsizeMode={'tail'}
                    numberOfLines={1}
                    style={{fontSize: 12}}>
                    {item.sortName}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ) : null}
          </View>
        ))}
      </View>
    );
  };
  renderHeader = () => {
    return (
      <>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 2,
              opacity: 1,
              width: '100%',
            },
            this.state.slideUpViewStyle,
            {
              transform: [
                {
                  translateY: this.getTranslateYByApp(),
                },
              ],
            },
          ]}>
          <View style={{height: 56, backgroundColor: 'green'}} />
          <View style={{height: 94, backgroundColor: 'green'}} />
          {this.renderSort()}
        </Animated.View>
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: -1,
              opacity: 0,
              width: '100%',
              backgroundColor: 'red',
            },
            this.state.slideDownViewStyle,
          ]}>
          <View style={{height: 56, backgroundColor: 'green'}} />
          <View style={{height: 94, backgroundColor: 'green'}} />
          {this.renderSort()}
        </View>
      </>
    );
  };
  render() {
    return (
      <SafeAreaView>
        <View style={{width: '100%', height: 40, backgroundColor: 'grey'}}>
          <View>
            {this.renderFlatList()}
            {this.renderHeader()}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
