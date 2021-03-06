'use strict';

import React from 'react';
import EventHandlersMixin from './mixins/event-handlers';
import HelpersMixin from './mixins/helpers';
import initialState from './initial-state';
import defaultProps from './default-props';
import classnames from 'classnames';

import {Track} from './track';
import {Dots} from './dots';
import {PrevArrow, NextArrow} from './arrows';

export var InnerSlider = React.createClass({
  mixins: [HelpersMixin, EventHandlersMixin],
  getInitialState: function () {
    return initialState;
  },
  getDefaultProps: function () {
    return defaultProps;
  },
  componentWillMount: function () {
    if (this.props.init) {
      this.props.init();
    }
    this.setState({
      mounted: true
    });
    var lazyLoadedList = [];
    for (var i = 0; i < React.Children.count(this.props.children); i++) {
      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
        lazyLoadedList.push(i);
      }
    }

    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
      this.setState({
        lazyLoadedList: lazyLoadedList
      });
    }
  },
  _init: function () {
    this.initialize(this.props);
    this.adaptHeight();
  },
  componentDidMount: function () {
    // Hack for autoplay -- Inspect Later
    this.onImageLoad(() => {
      this._init();
      window.setTimeout(() => {
        this.update(this.props);
      }, 1500);
    });
    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
    }
  },
  componentWillUnmount: function () {
    if (window.addEventListener) {
      window.removeEventListener('resize', this.onWindowResized);
    } else {
      window.detachEvent('onresize', this.onWindowResized);
    }
    if (this.state.autoPlayTimer) {
      window.clearInterval(this.state.autoPlayTimer);
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.props.slickGoTo != nextProps.slickGoTo) {
      this.changeSlide({
          message: 'index',
          index: nextProps.slickGoTo,
          currentSlide: this.state.currentSlide
      });
    } else {
      this.update(nextProps);
    }
  },
  componentDidUpdate: function () {
    this.adaptHeight();
  },
  onWindowResized: function () {
    if (this.state.isImagesLoaded) {
      this.update(this.props);
      // animating state should be cleared while resizing, otherwise autoplay stops working
      this.setState({
        animating: false
      })
    }
  },
  render: function () {
    var className = classnames('slick-initialized', 'slick-slider', this.props.className);

    var trackProps = {
      fade: this.props.fade,
      cssEase: this.props.cssEase,
      speed: this.props.speed,
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      lazyLoad: this.props.lazyLoad,
      lazyLoadedList: this.state.lazyLoadedList,
      rtl: this.props.rtl,
      slideWidth: this.state.slideWidth,
      slidesToShow: this.props.slidesToShow,
      slideCount: this.state.slideCount,
      trackStyle: this.state.trackStyle,
      variableWidth: this.props.variableWidth,
      slidesToScroll: this.props.slidesToScroll,
      focusOnSelect: this.props.focusOnSelect ? this.selectHandler : () => {},
      activeSlideClickHandler: this.props.activeSlideClickHandler ? this.props.activeSlideClickHandler : () => {}
    };

    var dots;

    if (this.props.dots === true && this.state.slideCount >= this.props.slidesToShow) {
      var dotProps = {
        dotsClass: this.props.dotsClass,
        slideCount: this.state.slideCount,
        slidesToShow: this.props.slidesToShow,
        currentSlide: this.state.currentSlide,
        slidesToScroll: this.props.slidesToScroll,
        clickHandler: this.changeSlide,
        imgHeight: this.state.activeSlideImageHeight,
        dotsTopOffset: this.props.dotsTopOffset || 0,
        dotsBtnClass: this.props.dotsBtnClass,
        customClickHandler: this.props.dotsClickHandler ? this.props.dotsClickHandler : () => {}
      };

      dots = (<Dots {...dotProps} />);
    }

    var prevArrow, nextArrow;

    var arrowProps = {
      infinite: this.props.infinite,
      centerMode: this.props.centerMode,
      currentSlide: this.state.currentSlide,
      slideCount: this.state.slideCount,
      slidesToShow: this.props.slidesToShow,
      prevArrow: this.props.prevArrow,
      nextArrow: this.props.nextArrow,
      clickHandler: this.changeSlide,
      height: this.state.activeSlideImageHeight
    };

    if (this.props.arrows) {
      prevArrow = (<PrevArrow {...arrowProps} />);
      nextArrow = (<NextArrow {...arrowProps} />);
    }

    var centerPaddingStyle = null;

    if (this.props.vertical === false) {
      if (this.props.centerMode === true && this.props.centerSingleImg === true) {
        centerPaddingStyle = {
          padding: (`0 calc((100vw - ${this.state.activeSlideImageWidth}px) / 2)`)
        };
      } else if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: ('0px ' + this.props.centerPadding)
        };
      } else if (typeof this.props.slideListPadding !== 'undefined') {
        centerPaddingStyle = {
          padding: `0 ${this.props.slideListPadding}px`
        }
      }
    } else {
      if (this.props.centerMode === true) {
        centerPaddingStyle = {
          padding: (this.props.centerPadding + ' 0px')
        };
      }
    }

    return (
      <div className={className} onMouseEnter={this.onInnerSliderEnter} onMouseLeave={this.onInnerSliderLeave}>
        <div
          ref='list'
          className={`slick-list ${this.state._isMounted ? '' : 'unmounted'}`}
          style={centerPaddingStyle}
          onMouseDown={this.swipeStart}
          onMouseMove={this.state.dragging ? this.swipeMove: null}
          onMouseUp={this.swipeEnd}
          onMouseLeave={this.state.dragging ? this.swipeEnd: null}
          onTouchStart={this.swipeStart}
          onTouchMove={this.state.dragging ? this.swipeMove: null}
          onTouchEnd={this.swipeEnd}
          onTouchCancel={this.state.dragging ? this.swipeEnd: null}>
          <Track ref='track' {...trackProps}>
            {this.props.children}
          </Track>
        </div>
        {prevArrow}
        {nextArrow}
        {dots}
      </div>
    );
  }
});
