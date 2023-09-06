import { ComponentManager } from './ComponentManager';

export class RNScrollViewManager extends ComponentManager{

  constructor(private scroller: any) {
    super();
  }


  public getScroller() {
    return this.scroller;
  }

}