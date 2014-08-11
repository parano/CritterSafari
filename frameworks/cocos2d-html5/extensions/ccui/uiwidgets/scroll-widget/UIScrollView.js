/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * Base class for ccui.ScrollView
 * @class
 * @extends ccui.Layout
 *
 * @property {Number}               innerWidth              - Inner container width of the scroll view
 * @property {Number}               innerHeight             - Inner container height of the scroll view
 * @property {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH}    direction               - Scroll direction of the scroll view
 * @property {Boolean}              bounceEnabled           - Indicate whether bounce is enabled
 * @property {Boolean}              inertiaScrollEnabled    - Indicate whether inertiaScroll is enabled
 */
ccui.ScrollView = ccui.Layout.extend(/** @lends ccui.ScrollView# */{
    _innerContainer: null,
    direction: null,
    _autoScrollDir: null,

    _topBoundary: 0,//test
    _bottomBoundary: 0,//test
    _leftBoundary: 0,
    _rightBoundary: 0,

    _bounceTopBoundary: 0,
    _bounceBottomBoundary: 0,
    _bounceLeftBoundary: 0,
    _bounceRightBoundary: 0,

    _autoScroll: false,
    _autoScrollAddUpTime: 0,

    _autoScrollOriginalSpeed: 0,
    _autoScrollAcceleration: 0,
    _isAutoScrollSpeedAttenuated: false,
    _needCheckAutoScrollDestination: false,
    _autoScrollDestination: null,

    _bePressed: false,
    _slidTime: 0,
    _moveChildPoint: null,
    _childFocusCancelOffset: 0,

    _leftBounceNeeded: false,
    _topBounceNeeded: false,
    _rightBounceNeeded: false,
    _bottomBounceNeeded: false,

    bounceEnabled: false,
    _bouncing: false,
    _bounceDir: null,
    _bounceOriginalSpeed: 0,
    inertiaScrollEnabled: false,

    _scrollViewEventListener: null,
    _scrollViewEventSelector: null,
    _className: "ScrollView",
    _eventCallback: null,
    /**
     * allocates and initializes a UIScrollView.
     * Constructor of ccui.ScrollView
     * @example
     * // example
     * var uiScrollView = new ccui.ScrollView();
     */
    ctor: function () {
        ccui.Layout.prototype.ctor.call(this);
        this.direction = ccui.ScrollView.DIR_NONE;
        this._autoScrollDir = cc.p(0, 0);
        this._topBoundary = 0;//test
        this._bottomBoundary = 0;//test
        this._leftBoundary = 0;
        this._rightBoundary = 0;
        this._bounceTopBoundary = 0;
        this._bounceBottomBoundary = 0;
        this._bounceLeftBoundary = 0;
        this._bounceRightBoundary = 0;
        this._autoScroll = false;
        this._autoScrollAddUpTime = 0;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAcceleration = -1000;
        this._isAutoScrollSpeedAttenuated = false;
        this._needCheckAutoScrollDestination = false;
        this._autoScrollDestination = cc.p(0, 0);
        this._bePressed = false;
        this._slidTime = 0;
        this._moveChildPoint = cc.p(0, 0);
        this._childFocusCancelOffset = 5;
        this._leftBounceNeeded = false;
        this._topBounceNeeded = false;
        this._rightBounceNeeded = false;
        this._bottomBounceNeeded = false;
        this.bounceEnabled = false;
        this._bouncing = false;
        this._bounceDir = cc.p(0, 0);
        this._bounceOriginalSpeed = 0;
        this.inertiaScrollEnabled = true;
        this._scrollViewEventListener = null;
        this._scrollViewEventSelector = null;
    },

    init: function () {
        if (ccui.Layout.prototype.init.call(this)) {
            this.setClippingEnabled(true);
            this._innerContainer.setTouchEnabled(false);
            return true;
        }
        return false;
    },

    onEnter: function () {
        ccui.Layout.prototype.onEnter.call(this);
        this.scheduleUpdate(true);
    },

    findNextFocusedWidget: function(direction, current){
        if (this.getLayoutType() == ccui.Layout.LINEAR_VERTICAL
            || this.getLayoutType() == ccui.Layout.LINEAR_HORIZONTAL) {
            return this._innerContainer.findNextFocusedWidget(direction, current);
        } else
            return ccui.Widget.prototype.findNextFocusedWidget.call(this, direction, current);
    },

    initRenderer: function () {
        ccui.Layout.prototype.initRenderer.call(this);
        this._innerContainer = ccui.Layout.create();
        this.addProtectedChild(this._innerContainer, 1, 1);
    },

    onSizeChanged: function () {
        ccui.Layout.prototype.onSizeChanged.call(this);
        var locSize = this._contentSize;
        this._topBoundary = locSize.height;
        this._rightBoundary = locSize.width;
        var bounceBoundaryParameterX = locSize.width / 3;
        var bounceBoundaryParameterY = locSize.height / 3;
        this._bounceTopBoundary = locSize.height - bounceBoundaryParameterY;
        this._bounceBottomBoundary = bounceBoundaryParameterY;
        this._bounceLeftBoundary = bounceBoundaryParameterX;
        this._bounceRightBoundary = this._contentSize.width - bounceBoundaryParameterX;
        var innerSize = this._innerContainer.getContentSize();
        var orginInnerSizeWidth = innerSize.width;
        var orginInnerSizeHeight = innerSize.height;
        var innerSizeWidth = Math.max(orginInnerSizeWidth, locSize.width);
        var innerSizeHeight = Math.max(orginInnerSizeHeight, locSize.height);
        this._innerContainer.setContentSize(cc.size(innerSizeWidth, innerSizeHeight));
        this._innerContainer.setPosition(0, locSize.height - this._innerContainer.getContentSize().height);
    },

    /**
     * Changes inner container size of ScrollView.     <br/>
     * Inner container size must be larger than or equal scrollview's size.
     * @param {cc.Size} size inner container size.
     */
    setInnerContainerSize: function (size) {
        var locSize = this._contentSize;
        var innerSizeWidth = locSize.width;
        var innerSizeHeight = locSize.height;
        var originalInnerSize = this._innerContainer.getContentSize();
        if (size.width < locSize.width)
            cc.log("Inner width <= scrollview width, it will be force sized!");
        else
            innerSizeWidth = size.width;

        if (size.height < locSize.height)
            cc.log("Inner height <= scrollview height, it will be force sized!");
        else
            innerSizeHeight = size.height;

        this._innerContainer.setSize(cc.size(innerSizeWidth, innerSizeHeight));
        var newInnerSize, offset;
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                newInnerSize = this._innerContainer.getContentSize();
                offset = originalInnerSize.height - newInnerSize.height;
                this.scrollChildren(0, offset);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                if (this._innerContainer.getRightBoundary() <= locSize.width) {
                    newInnerSize = this._innerContainer.getContentSize();
                    offset = originalInnerSize.width - newInnerSize.width;
                    this.scrollChildren(offset, 0);
                }
                break;
            case ccui.ScrollView.DIR_BOTH:
                newInnerSize = this._innerContainer.getContentSize();
                var offsetY = originalInnerSize.height - newInnerSize.height;
                var offsetX = 0;
                if (this._innerContainer.getRightBoundary() <= locSize.width)
                    offsetX = originalInnerSize.width - newInnerSize.width;
                this.scrollChildren(offsetX, offsetY);
                break;
            default:
                break;
        }
        var innerContainer = this._innerContainer;
        var innerSize = innerContainer.getContentSize();
        var innerPos = innerContainer.getPosition();
        var innerAP = innerContainer.getAnchorPoint();
        if (innerContainer.getLeftBoundary() > 0.0)
            innerContainer.setPosition(innerAP.x * innerSize.width, innerPos.y);
        if (innerContainer.getRightBoundary() < locSize.width)
            innerContainer.setPosition(locSize.width - ((1.0 - innerAP.x) * innerSize.width), innerPos.y);
        if (innerPos.y > 0.0)
            innerContainer.setPosition(innerPos.x, innerAP.y * innerSize.height);
        if (innerContainer.getTopBoundary() < locSize.height)
            innerContainer.setPosition(innerPos.x, locSize.height - (1.0 - innerAP.y) * innerSize.height);
    },
    _setInnerWidth: function (width) {
        var locW = this._contentSize.width,
            innerWidth = locW,
            container = this._innerContainer,
            oldInnerWidth = container.width;
        if (width < locW)
            cc.log("Inner width <= scrollview width, it will be force sized!");
        else
            innerWidth = width;
        container.width = innerWidth;

        switch (this.direction) {
            case ccui.ScrollView.DIR_HORIZONTAL:
            case ccui.ScrollView.DIR_BOTH:
                if (container.getRightBoundary() <= locW) {
                    var newInnerWidth = container.width;
                    var offset = oldInnerWidth - newInnerWidth;
                    this.scrollChildren(offset, 0);
                }
                break;
        }
        var innerAX = container.anchorX;
        if (container.getLeftBoundary() > 0.0) {
            container.x = innerAX * innerWidth;
        }
        if (container.getRightBoundary() < locW) {
            container.x = locW - ((1.0 - innerAX) * innerWidth);
        }
    },
    _setInnerHeight: function (height) {
        var locH = this._contentSize.height,
            innerHeight = locH,
            container = this._innerContainer,
            oldInnerHeight = container.height;
        if (height < locH)
            cc.log("Inner height <= scrollview height, it will be force sized!");
        else
            innerHeight = height;
        container.height = innerHeight;

        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
            case ccui.ScrollView.DIR_BOTH:
                var newInnerHeight = innerHeight;
                var offset = oldInnerHeight - newInnerHeight;
                this.scrollChildren(0, offset);
                break;
        }
        var innerAY = container.anchorY;
        if (container.getLeftBoundary() > 0.0) {
            container.y = innerAY * innerHeight;
        }
        if (container.getRightBoundary() < locH) {
            container.y = locH - ((1.0 - innerAY) * innerHeight);
        }
    },

    /**
     * Gets inner container size of ScrollView.     <br/>
     * Inner container size must be larger than or equal scrollview's size.
     *
     * @return inner container size.
     */
    getInnerContainerSize: function () {
        return this._innerContainer.getContentSize();
    },
    _getInnerWidth: function () {
        return this._innerContainer.width;
    },
    _getInnerHeight: function () {
        return this._innerContainer.height;
    },

    /**
     * Add widget
     * @param {cc.Node} widget
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     * @returns {boolean}
     */
    addChild: function (widget, zOrder, tag) {
        if(!widget)
            return false;
        zOrder = zOrder || widget.getLocalZOrder();
        tag = tag || widget.getTag();
        return this._innerContainer.addChild(widget, zOrder, tag);
    },

    removeAllChildren: function () {
        this.removeAllChildrenWithCleanup(true);
    },

    removeAllChildrenWithCleanup: function(cleanup){
        this._innerContainer.removeAllChildrenWithCleanup(cleanup);
    },

    /**
     *  remove widget child override
     * @param {ccui.Widget} child
     * @param {Boolean} cleanup
     * @returns {boolean}
     */
    removeChild: function (child, cleanup) {
        return this._innerContainer.removeChild(child, cleanup);
    },

    /**
     * get inner children
     * @returns {Array}
     */
    getChildren: function () {
        return this._innerContainer.getChildren();
    },

    /**
     * get the count of inner children
     * @returns {Number}
     */
    getChildrenCount: function () {
        return this._innerContainer.getChildrenCount();
    },

    /**
     * Gets a child from the container given its tag
     * @param {Number} tag
     * @returns {ccui.Widget}
     */
    getChildByTag: function (tag) {
        return this._innerContainer.getChildByTag(tag);
    },

    /**
     * Gets a child from the container given its name
     * @param {String} name
     * @returns {ccui.Widget}
     */
    getChildByName: function (name) {
        return this._innerContainer.getChildByName(name);
    },

    /**
     * Add node for scrollView
     * @param {cc.Node}node
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addNode: function (node, zOrder, tag) {
        this._innerContainer.addNode(node, zOrder, tag);
    },

    /**
     * Get node by tag
     * @param {Number} tag
     * @returns {cc.Node}
     */
    getNodeByTag: function (tag) {
        return this._innerContainer.getNodeByTag(tag);
    },

    /**
     * Get all node
     * @returns {Array}
     */
    getNodes: function () {
        return this._innerContainer.getNodes();
    },

    /**
     * Remove a node
     * @param {cc.Node} node
     */
    removeNode: function (node) {
        this._innerContainer.removeNode(node);
    },

    /**
     * Remove a node by tag
     * @param {Number} tag
     */
    removeNodeByTag: function (tag) {
        this._innerContainer.removeNodeByTag(tag);
    },

    /**
     * Remove all node
     */
    removeAllNodes: function () {
        this._innerContainer.removeAllNodes();
    },

    moveChildren: function (offsetX, offsetY) {
        var pos = this._innerContainer.getPosition();
        this._moveChildPoint.x = pos.x + offsetX;
        this._moveChildPoint.y = pos.y + offsetY;
        this._innerContainer.setPosition(this._moveChildPoint);
    },

    autoScrollChildren: function (dt) {
        var lastTime = this._autoScrollAddUpTime;
        this._autoScrollAddUpTime += dt;
        if (this._isAutoScrollSpeedAttenuated) {
            var nowSpeed = this._autoScrollOriginalSpeed + this._autoScrollAcceleration * this._autoScrollAddUpTime;
            if (nowSpeed <= 0) {
                this.stopAutoScrollChildren();
                this.checkNeedBounce();
            } else {
                var timeParam = lastTime * 2 + dt;
                var offset = (this._autoScrollOriginalSpeed + this._autoScrollAcceleration * timeParam * 0.5) * dt;
                var offsetX = offset * this._autoScrollDir.x;
                var offsetY = offset * this._autoScrollDir.y;
                if (!this.scrollChildren(offsetX, offsetY)) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            }
        } else {
            if (this._needCheckAutoScrollDestination) {
                var xOffset = this._autoScrollDir.x * dt * this._autoScrollOriginalSpeed;
                var yOffset = this._autoScrollDir.y * dt * this._autoScrollOriginalSpeed;
                var notDone = this.checkCustomScrollDestination(xOffset, yOffset);
                var scrollCheck = this.scrollChildren(xOffset, yOffset);
                if (!notDone || !scrollCheck) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            } else {
                if (!this.scrollChildren(this._autoScrollDir.x * dt * this._autoScrollOriginalSpeed,
                        this._autoScrollDir.y * dt * this._autoScrollOriginalSpeed)) {
                    this.stopAutoScrollChildren();
                    this.checkNeedBounce();
                }
            }
        }
    },

    bounceChildren: function (dt) {
        var locSpeed = this._bounceOriginalSpeed;
        var locBounceDir = this._bounceDir;
        if (locSpeed <= 0.0) {
            this.stopBounceChildren();
        }
        if (!this.bounceScrollChildren(locBounceDir.x * dt * locSpeed, locBounceDir.y * dt * locSpeed)) {
            this.stopBounceChildren();
        }
    },

    checkNeedBounce: function () {
        if (!this.bounceEnabled)
            return false;
        this.checkBounceBoundary();
        if (this._topBounceNeeded || this._bottomBounceNeeded || this._leftBounceNeeded || this._rightBounceNeeded) {
            var scrollVector, orSpeed;
            if (this._topBounceNeeded && this._leftBounceNeeded) {
                scrollVector = cc.pSub(cc.p(0.0, this._contentSize.height), cc.p(this._innerContainer.getLeftBoundary(), this._innerContainer.getTopBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._topBounceNeeded && this._rightBounceNeeded) {
                scrollVector = cc.pSub(cc.p(this._contentSize.width, this._contentSize.height), cc.p(this._innerContainer.getRightBoundary(), this._innerContainer.getTopBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._bottomBounceNeeded && this._leftBounceNeeded) {
                scrollVector = cc.pSub(cc.p(0, 0), cc.p(this._innerContainer.getLeftBoundary(), this._innerContainer.getBottomBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._bottomBounceNeeded && this._rightBounceNeeded) {
                scrollVector = cc.pSub(cc.p(this._contentSize.width, 0.0), cc.p(this._innerContainer.getRightBoundary(), this._innerContainer.getBottomBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._topBounceNeeded) {
                scrollVector = cc.pSub(cc.p(0, this._contentSize.height), cc.p(0.0, this._innerContainer.getTopBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._bottomBounceNeeded) {
                scrollVector = cc.pSub(cc.p(0, 0), cc.p(0.0, this._innerContainer.getBottomBoundary()));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._leftBounceNeeded) {
                scrollVector = cc.pSub(cc.p(0, 0), cc.p(this._innerContainer.getLeftBoundary(), 0.0));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            } else if (this._rightBounceNeeded) {
                scrollVector = cc.pSub(cc.p(this._contentSize.width, 0), cc.p(this._innerContainer.getRightBoundary(), 0.0));
                orSpeed = cc.pLength(scrollVector) / 0.2;
                this._bounceDir = cc.pNormalize(scrollVector);
                this.startBounceChildren(orSpeed);
            }
            return true;
        }
        return false;
    },

    checkBounceBoundary: function () {
        var icBottomPos = this._innerContainer.getBottomBoundary();
        if (icBottomPos > this._bottomBoundary) {
            this.scrollToBottomEvent();
            this._bottomBounceNeeded = true;
        } else {
            this._bottomBounceNeeded = false;
        }
        var icTopPos = this._innerContainer.getTopBoundary();
        if (icTopPos < this._topBoundary) {
            this.scrollToTopEvent();
            this._topBounceNeeded = true;
        } else {
            this._topBounceNeeded = false;
        }
        var icRightPos = this._innerContainer.getRightBoundary();
        if (icRightPos < this._rightBoundary) {
            this.scrollToRightEvent();
            this._rightBounceNeeded = true;
        } else {
            this._rightBounceNeeded = false;
        }
        var icLeftPos = this._innerContainer.getLeftBoundary();
        if (icLeftPos > this._leftBoundary) {
            this.scrollToLeftEvent();
            this._leftBounceNeeded = true;
        } else {
            this._leftBounceNeeded = false;
        }
    },

    startBounceChildren: function (v) {
        this._bounceOriginalSpeed = v;
        this._bouncing = true;
    },

    stopBounceChildren: function () {
        this._bouncing = false;
        this._bounceOriginalSpeed = 0.0;
        this._leftBounceNeeded = false;
        this._rightBounceNeeded = false;
        this._topBounceNeeded = false;
        this._bottomBounceNeeded = false;
    },

    startAutoScrollChildrenWithOriginalSpeed: function (dir, v, attenuated, acceleration) {
        this.stopAutoScrollChildren();
        this._autoScrollDir = dir;
        this._isAutoScrollSpeedAttenuated = attenuated;
        this._autoScrollOriginalSpeed = v;
        this._autoScroll = true;
        this._autoScrollAcceleration = acceleration;
    },

    startAutoScrollChildrenWithDestination: function (des, time, attenuated) {
        this._needCheckAutoScrollDestination = false;
        this._autoScrollDestination = des;
        var dis = cc.pSub(des, this._innerContainer.getPosition());
        var dir = cc.pNormalize(dis);
        var orSpeed = 0.0;
        var acceleration = -1000.0;
        var disLength = cc.pLength(dis);
        if (attenuated) {
            acceleration = -(2 * disLength) / (time * time);
            orSpeed = 2 * disLength / time;
        } else {
            this._needCheckAutoScrollDestination = true;
            orSpeed = disLength / time;
        }
        this.startAutoScrollChildrenWithOriginalSpeed(dir, orSpeed, attenuated, acceleration);
    },

    jumpToDestination: function (dstX, dstY) {
        if (dstX.x !== undefined) {
            dstY = dstX.y;
            dstX = dstX.x;
        }
        var finalOffsetX = dstX;
        var finalOffsetY = dstY;
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL:
                if (dstY <= 0)
                    finalOffsetY = Math.max(dstY, this._contentSize.height - this._innerContainer.getContentSize().height);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL:
                if (dstX <= 0)
                    finalOffsetX = Math.max(dstX, this._contentSize.width - this._innerContainer.getContentSize().width);
                break;
            case ccui.ScrollView.DIR_BOTH:
                if (dstY <= 0)
                    finalOffsetY = Math.max(dstY, this._contentSize.height - this._innerContainer.getContentSize().height);
                if (dstX <= 0)
                    finalOffsetX = Math.max(dstX, this._contentSize.width - this._innerContainer.getContentSize().width);
                break;
            default:
                break;
        }
        this._innerContainer.setPosition(finalOffsetX, finalOffsetY);
    },

    stopAutoScrollChildren: function () {
        this._autoScroll = false;
        this._autoScrollOriginalSpeed = 0;
        this._autoScrollAddUpTime = 0;
    },

    bounceScrollChildren: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        var realOffsetX, realOffsetY, icRightPos, icTopPos, icBottomPos;
        if (touchOffsetX > 0.0 && touchOffsetY > 0.0){              //first quadrant //bounce to top-right
            realOffsetX = touchOffsetX;
            realOffsetY = touchOffsetY;
            icRightPos = this._innerContainer.getRightBoundary();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            icTopPos = this._innerContainer.getTopBoundary();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        } else if (touchOffsetX < 0.0 && touchOffsetY > 0.0){       //second quadrant //bounce to top-left
            realOffsetX = touchOffsetX;
            realOffsetY = touchOffsetY;
            icLefrPos = this._innerContainer.getLeftBoundary();
            if (icLefrPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLefrPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            icTopPos = this._innerContainer.getTopBoundary();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        }else if (touchOffsetX < 0.0 && touchOffsetY < 0.0){ //third quadrant //bounce to bottom-left
            realOffsetX = touchOffsetX;
            realOffsetY = touchOffsetY;
            var icLefrPos = this._innerContainer.getLeftBoundary();
            if (icLefrPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLefrPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            icBottomPos = this._innerContainer.getBottomBoundary();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        } else if (touchOffsetX > 0.0 && touchOffsetY < 0.0){ //forth quadrant //bounce to bottom-right
            realOffsetX = touchOffsetX;
            realOffsetY = touchOffsetY;
            icRightPos = this._innerContainer.getRightBoundary();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            icBottomPos = this._innerContainer.getBottomBoundary();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, realOffsetY);
        } else if (touchOffsetX == 0.0 && touchOffsetY > 0.0){ // bounce to top
            realOffsetY = touchOffsetY;
            icTopPos = this._innerContainer.getTopBoundary();
            if (icTopPos + touchOffsetY >= this._topBoundary) {
                realOffsetY = this._topBoundary - icTopPos;
                this.bounceTopEvent();
                scrollEnabled = false;
            }
            this.moveChildren(0.0, realOffsetY);
        } else if (touchOffsetX == 0.0 && touchOffsetY < 0.0) {//bounce to bottom

            realOffsetY = touchOffsetY;
            icBottomPos = this._innerContainer.getBottomBoundary();
            if (icBottomPos + touchOffsetY <= this._bottomBoundary) {
                realOffsetY = this._bottomBoundary - icBottomPos;
                this.bounceBottomEvent();
                scrollEnabled = false;
            }
            this.moveChildren(0.0, realOffsetY);
        }
        else if (touchOffsetX > 0.0 && touchOffsetY == 0.0) //bounce to right
        {
            realOffsetX = touchOffsetX;
            icRightPos = this._innerContainer.getRightBoundary();
            if (icRightPos + realOffsetX >= this._rightBoundary) {
                realOffsetX = this._rightBoundary - icRightPos;
                this.bounceRightEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, 0.0);
        }else if (touchOffsetX < 0.0 && touchOffsetY == 0.0){ //bounce to left

            realOffsetX = touchOffsetX;
            var icLeftPos = this._innerContainer.getLeftBoundary();
            if (icLeftPos + realOffsetX <= this._leftBoundary) {
                realOffsetX = this._leftBoundary - icLeftPos;
                this.bounceLeftEvent();
                scrollEnabled = false;
            }
            this.moveChildren(realOffsetX, 0.0);
        }
        return scrollEnabled;
    },

    checkCustomScrollDestination: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        var icBottomPos, icLeftPos, icRightPos, icTopPos;
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL: // vertical
                if (this._autoScrollDir.y > 0) {
                    icBottomPos = this._innerContainer.getBottomBoundary();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                } else {
                    icBottomPos = this._innerContainer.getBottomBoundary();
                    if (icBottomPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                }
                break;
            case ccui.ScrollView.DIR_HORIZONTAL: // horizontal
                if (this._autoScrollDir.x > 0) {
                    icLeftPos = this._innerContainer.getLeftBoundary();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                } else {
                    icLeftPos = this._innerContainer.getLeftBoundary();
                    if (icLeftPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                }
                break;
            case ccui.ScrollView.DIR_BOTH:
                if (touchOffsetX > 0.0 && touchOffsetY > 0.0){ // up right
                    icLeftPos = this._innerContainer.getLeftBoundary();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                    icBottomPos = this._innerContainer.getBottomBoundary();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX < 0.0 && touchOffsetY > 0.0){ // up left
                    icRightPos = this._innerContainer.getRightBoundary();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                    icBottomPos = this._innerContainer.getBottomBoundary();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX < 0.0 && touchOffsetY < 0.0){ // down left
                    icRightPos = this._innerContainer.getRightBoundary();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                    icTopPos = this._innerContainer.getTopBoundary();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX > 0.0 && touchOffsetY < 0.0){ // down right
                    icLeftPos = this._innerContainer.getLeftBoundary();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                    icTopPos = this._innerContainer.getTopBoundary();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX == 0.0 && touchOffsetY > 0.0){ // up
                    icBottomPos = this._innerContainer.getBottomBoundary();
                    if (icBottomPos + touchOffsetY >= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icBottomPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX < 0.0 && touchOffsetY == 0.0){ // left
                    icRightPos = this._innerContainer.getRightBoundary();
                    if (icRightPos + touchOffsetX <= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icRightPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX == 0.0 && touchOffsetY < 0.0){ // down
                    icTopPos = this._innerContainer.getTopBoundary();
                    if (icTopPos + touchOffsetY <= this._autoScrollDestination.y) {
                        touchOffsetY = this._autoScrollDestination.y - icTopPos;
                        scrollEnabled = false;
                    }
                } else if (touchOffsetX > 0.0 && touchOffsetY == 0.0){ // right
                    icLeftPos = this._innerContainer.getLeftBoundary();
                    if (icLeftPos + touchOffsetX >= this._autoScrollDestination.x) {
                        touchOffsetX = this._autoScrollDestination.x - icLeftPos;
                        scrollEnabled = false;
                    }
                }
                break;
            default:
                break;
        }
        return scrollEnabled;
    },

    getCurAutoScrollDistance: function (dt) {
        this._autoScrollOriginalSpeed -= this._autoScrollAcceleration * dt;
        return this._autoScrollOriginalSpeed * dt;
    },

    scrollChildren: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        this.scrollingEvent();
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL: // vertical
                scrollEnabled = this.scrollChildrenVertical(touchOffsetX, touchOffsetY);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL: // horizontal
                scrollEnabled = this.scrollChildrenHorizontal(touchOffsetX, touchOffsetY);
                break;
            case ccui.ScrollView.DIR_BOTH:
                scrollEnabled = this.scrollChildrenBoth(touchOffsetX, touchOffsetY);
                break;
            default:
                break;
        }
        return scrollEnabled;
    },

    scrollChildrenVertical: function(touchOffsetX, touchOffsetY){
        var realOffset = touchOffsetY;
        var scrollEnabled = true;
        var icBottomPos, icTopPos;
        if (this.bounceEnabled) {
            icBottomPos = this._innerContainer.getBottomBoundary();
            if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                realOffset = this._bounceBottomBoundary - icBottomPos;
                this.scrollToBottomEvent();
                scrollEnabled = false;
            }
            icTopPos = this._innerContainer.getTopBoundary();
            if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                realOffset = this._bounceTopBoundary - icTopPos;
                this.scrollToTopEvent();
                scrollEnabled = false;

            }
        } else {
            icBottomPos = this._innerContainer.getBottomBoundary();
            if (icBottomPos + touchOffsetY >= this._bottomBoundary){
                realOffset = this._bottomBoundary - icBottomPos;
                this.scrollToBottomEvent();
                scrollEnabled = false;
            }
            icTopPos = this._innerContainer.getTopBoundary();
            if (icTopPos + touchOffsetY <= this._topBoundary) {
                realOffset = this._topBoundary - icTopPos;
                this.scrollToTopEvent();
                scrollEnabled = false;
            }
        }
        this.moveChildren(0.0, realOffset);
        return scrollEnabled;
    },

    scrollChildrenHorizontal: function(touchOffsetX, touchOffestY){
        var scrollEnabled = true;
        var realOffset = touchOffsetX;
        var icRightPos, icLeftPos;
        if (this.bounceEnabled){
            icRightPos = this._innerContainer.getRightBoundary();
            if (icRightPos + touchOffsetX <= this._bounceRightBoundary)
            {
                realOffset = this._bounceRightBoundary - icRightPos;
                this.scrollToRightEvent();
                scrollEnabled = false;
            }
            icLeftPos = this._innerContainer.getLeftBoundary();
            if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary)
            {
                realOffset = this._bounceLeftBoundary - icLeftPos;
                this.scrollToLeftEvent();
                scrollEnabled = false;
            }
        } else {
            icRightPos = this._innerContainer.getRightBoundary();
            if (icRightPos + touchOffsetX <= this._rightBoundary) {
                realOffset = this._rightBoundary - icRightPos;
                this.scrollToRightEvent();
                scrollEnabled = false;
            }
            icLeftPos = this._innerContainer.getLeftBoundary();
            if (icLeftPos + touchOffsetX >= this._leftBoundary)
            {
                realOffset = this._leftBoundary - icLeftPos;
                this.scrollToLeftEvent();
                scrollEnabled = false;
            }
        }
        this.moveChildren(realOffset, 0.0);
        return scrollEnabled;
    },

    scrollChildrenBoth: function (touchOffsetX, touchOffsetY) {
        var scrollEnabled = true;
        var realOffsetX = touchOffsetX;
        var realOffsetY = touchOffsetY;
        var icLeftPos, icBottomPos, icRightPos, icTopPos;
        if (this.bounceEnabled) {
            if (touchOffsetX > 0.0 && touchOffsetY > 0.0) { // up right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                    realOffsetX = this._bounceLeftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }

                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                    realOffsetY = this._bounceBottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY > 0.0) { // up left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                    realOffsetX = this._bounceRightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }

                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                    realOffsetY = this._bounceBottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY < 0.0) { // down left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                    realOffsetX = this._bounceRightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }

                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                    realOffsetY = this._bounceTopBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX > 0.0 && touchOffsetY < 0.0){ // down right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                    realOffsetX = this._bounceLeftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }

                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                    realOffsetY = this._bounceTopBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX == 0.0 && touchOffsetY > 0.0){ // up
                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bounceBottomBoundary) {
                    realOffsetY = this._bounceBottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY == 0.0){ // left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._bounceRightBoundary) {
                    realOffsetX = this._bounceRightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX == 0.0 && touchOffsetY < 0.0){ // down
                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._bounceTopBoundary) {
                    realOffsetY = this._bounceTopBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX > 0.0 && touchOffsetY == 0.0){ // right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._bounceLeftBoundary) {
                    realOffsetX = this._bounceLeftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }
            }
        } else {
            if (touchOffsetX > 0.0 && touchOffsetY > 0.0){ // up right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                    realOffsetX = this._leftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }

                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                    realOffsetY = this._bottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY > 0.0){ // up left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._rightBoundary) {
                    realOffsetX = this._rightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }

                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                    realOffsetY = this._bottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY < 0.0){ // down left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._rightBoundary) {
                    realOffsetX = this._rightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }

                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._topBoundary) {
                    realOffsetY = this._topBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX > 0.0 && touchOffsetY < 0.0){ // down right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                    realOffsetX = this._leftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }
                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._topBoundary) {
                    realOffsetY = this._topBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX == 0.0 && touchOffsetY > 0.0) { // up
                icBottomPos = this._innerContainer.getBottomBoundary();
                if (icBottomPos + touchOffsetY >= this._bottomBoundary) {
                    realOffsetY = this._bottomBoundary - icBottomPos;
                    this.scrollToBottomEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX < 0.0 && touchOffsetY == 0.0){ // left
                icRightPos = this._innerContainer.getRightBoundary();
                if (icRightPos + touchOffsetX <= this._rightBoundary) {
                    realOffsetX = this._rightBoundary - icRightPos;
                    this.scrollToRightEvent();
                    scrollEnabled = false;
                }
            } else if (touchOffsetX == 0.0 && touchOffsetY < 0.0){  // down
                icTopPos = this._innerContainer.getTopBoundary();
                if (icTopPos + touchOffsetY <= this._topBoundary) {
                    realOffsetY = this._topBoundary - icTopPos;
                    this.scrollToTopEvent();
                    scrollEnabled = false;
                }
            }  else if (touchOffsetX > 0.0 && touchOffsetY == 0.0){ // right
                icLeftPos = this._innerContainer.getLeftBoundary();
                if (icLeftPos + touchOffsetX >= this._leftBoundary) {
                    realOffsetX = this._leftBoundary - icLeftPos;
                    this.scrollToLeftEvent();
                    scrollEnabled = false;
                }
            }
        }
        this.moveChildren(realOffsetX, realOffsetY);
        return scrollEnabled;
    },

    /**
     * Scroll inner container to bottom boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottom: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(this._innerContainer.getPositionX(), 0), time, attenuated);
    },

    /**
     * Scroll inner container to top boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTop: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(
            cc.p(this._innerContainer.getPositionX(), this._contentSize.height - this._innerContainer.getContentSize().height), time, attenuated);
    },

    /**
     * Scroll inner container to left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToLeft: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(cc.p(0, this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToRight: function (time, attenuated) {
        this.startAutoScrollChildrenWithDestination(
            cc.p(this._contentSize.width - this._innerContainer.getContentSize().width, this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to top and left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTopLeft: function (time, attenuated) {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(0, this._contentSize.height - this._innerContainer.getContentSize().height), time, attenuated);
    },

    /**
     * Scroll inner container to top and right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToTopRight: function (time, attenuated) {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        var inSize = this._innerContainer.getContentSize();
        this.startAutoScrollChildrenWithDestination(cc.p(this._contentSize.width - inSize.width,
                this._contentSize.height - inSize.height), time, attenuated);
    },

    /**
     * Scroll inner container to bottom and left boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottomLeft: function (time, attenuated) {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(0, 0), time, attenuated);
    },

    /**
     * Scroll inner container to bottom and right boundary of ScrollView.
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToBottomRight: function (time, attenuated) {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.startAutoScrollChildrenWithDestination(cc.p(this._contentSize.width - this._innerContainer.getContentSize().width, 0), time, attenuated);
    },

    /**
     * Scroll inner container to vertical percent position of ScrollView.
     * @param {Number} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentVertical: function (percent, time, attenuated) {
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        this.startAutoScrollChildrenWithDestination(cc.p(this._innerContainer.getPositionX(), minY + percent * h / 100), time, attenuated);
    },

    /**
     * Scroll inner container to horizontal percent position of ScrollView.
     * @param {Number} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentHorizontal: function (percent, time, attenuated) {
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this.startAutoScrollChildrenWithDestination(cc.p(-(percent * w / 100), this._innerContainer.getPositionY()), time, attenuated);
    },

    /**
     * Scroll inner container to both direction percent position of ScrollView.
     * @param {cc.Point} percent
     * @param {Number} time
     * @param {Boolean} attenuated
     */
    scrollToPercentBothDirection: function (percent, time, attenuated) {
        if (this.direction != ccui.ScrollView.DIR_BOTH)
            return;
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this.startAutoScrollChildrenWithDestination(cc.p(-(percent.x * w / 100), minY + percent.y * h / 100), time, attenuated);
    },

    /**
     * Move inner container to bottom boundary of ScrollView.
     */
    jumpToBottom: function () {
        this.jumpToDestination(this._innerContainer.getPositionX(), 0);
    },

    /**
     * Move inner container to top boundary of ScrollView.
     */
    jumpToTop: function () {
        this.jumpToDestination(this._innerContainer.getPositionX(), this._contentSize.height - this._innerContainer.getContentSize().height);
    },

    /**
     * Move inner container to left boundary of ScrollView.
     */
    jumpToLeft: function () {
        this.jumpToDestination(0, this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to right boundary of ScrollView.
     */
    jumpToRight: function () {
        this.jumpToDestination(this._contentSize.width - this._innerContainer.getContentSize().width, this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to top and left boundary of ScrollView.
     */
    jumpToTopLeft: function () {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.jumpToDestination(0, this._contentSize.height - this._innerContainer.getContentSize().height);
    },

    /**
     * Move inner container to top and right boundary of ScrollView.
     */
    jumpToTopRight: function () {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        var inSize = this._innerContainer.getContentSize();
        this.jumpToDestination(this._contentSize.width - inSize.width, this._contentSize.height - inSize.height);
    },

    /**
     * Move inner container to bottom and left boundary of ScrollView.
     */
    jumpToBottomLeft: function () {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.jumpToDestination(0, 0);
    },

    /**
     * Move inner container to bottom and right boundary of ScrollView.
     */
    jumpToBottomRight: function () {
        if (this.direction != ccui.ScrollView.DIR_BOTH) {
            cc.log("Scroll direction is not both!");
            return;
        }
        this.jumpToDestination(this._contentSize.width - this._innerContainer.getContentSize().width, 0);
    },

    /**
     * Move inner container to vertical percent position of ScrollView.
     */
    jumpToPercentVertical: function (percent) {
        var minY = this._contentSize.height - this._innerContainer.getContentSize().height;
        var h = -minY;
        this.jumpToDestination(this._innerContainer.getPositionX(), minY + percent * h / 100);
    },

    /**
     * Move inner container to horizontal percent position of ScrollView.
     */
    jumpToPercentHorizontal: function (percent) {
        var w = this._innerContainer.getContentSize().width - this._contentSize.width;
        this.jumpToDestination(-(percent * w / 100), this._innerContainer.getPositionY());
    },

    /**
     * Move inner container to both direction percent position of ScrollView.
     */
    jumpToPercentBothDirection: function (percent) {
        if (this.direction != ccui.ScrollView.DIR_BOTH)
            return;
        var inSize = this._innerContainer.getContentSize();
        var minY = this._contentSize.height - inSize.height;
        var h = -minY;
        var w = inSize.width - this._contentSize.width;
        this.jumpToDestination(-(percent.x * w / 100), minY + percent.y * h / 100);
    },

    startRecordSlidAction: function () {
        if (this._autoScroll)
            this.stopAutoScrollChildren();
        if (this._bouncing)
            this.stopBounceChildren();
        this._slidTime = 0.0;
    },

    endRecordSlidAction: function () {
        if (!this.checkNeedBounce() && this.inertiaScrollEnabled) {
            if (this._slidTime <= 0.016)
                return;
            var totalDis = 0;
            var dir;
            switch (this.direction) {
                case ccui.ScrollView.DIR_VERTICAL :
                    totalDis = this._touchEndPosition.y - this._touchBeganPosition.y;
                    dir = (totalDis < 0) ? ccui.ScrollView.SCROLLDIR_DOWN : ccui.ScrollView.SCROLLDIR_UP;
                    break;
                case ccui.ScrollView.DIR_HORIZONTAL:
                    totalDis = this._touchEndPosition.x - this._touchBeganPosition.x;
                    dir = totalDis < 0 ? ccui.ScrollView.SCROLLDIR_LEFT : ccui.ScrollView.SCROLLDIR_RIGHT;
                    break;
                case ccui.ScrollView.DIR_BOTH :
                    var subVector = cc.pSub(this._touchEndPosition, this._touchBeganPosition);
                    totalDis = cc.pLength(subVector);
                    dir = cc.pNormalize(subVector);
                    break;
                default:
                    break;
            }
            var orSpeed = Math.min(Math.abs(totalDis) / (this._slidTime), ccui.ScrollView.AUTO_SCROLL_MAX_SPEED);
            this.startAutoScrollChildrenWithOriginalSpeed(dir, orSpeed, true, -1000);
            this._slidTime = 0;
        }
    },

    handlePressLogic: function (touch) {
        this.startRecordSlidAction();
        this._bePressed = true;
    },

    handleMoveLogic: function (touch) {
        var delta = cc.pSub(touch.getLocation(), touch.getPreviousLocation());
        switch (this.direction) {
            case ccui.ScrollView.DIR_VERTICAL: // vertical
                this.scrollChildren(0.0, delta.y);
                break;
            case ccui.ScrollView.DIR_HORIZONTAL: // horizontal
                this.scrollChildren(delta.x, 0);
                break;
            case ccui.ScrollView.DIR_BOTH: // both
                this.scrollChildren(delta.x, delta.y);
                break;
            default:
                break;
        }
    },

    handleReleaseLogic: function (touch) {
        this.endRecordSlidAction();
        this._bePressed = false;
    },

    onTouchBegan: function (touch, event) {
        var pass = ccui.Layout.prototype.onTouchBegan.call(this, touch, event);
        if (this._hitted)
            this.handlePressLogic(touch);
        return pass;
    },

    onTouchMoved: function (touch, event) {
        ccui.Layout.prototype.onTouchMoved.call(this, touch, event);
        this.handleMoveLogic(touch);
    },

    onTouchEnded: function (touch, event) {
        ccui.Layout.prototype.onTouchEnded.call(this, touch, event);
        this.handleReleaseLogic(touch);
    },

    onTouchCancelled: function (touch, event) {
        ccui.Layout.prototype.onTouchCancelled.call(this, touch, event);
    },

    update: function (dt) {
        if (this._autoScroll)
            this.autoScrollChildren(dt);
        if (this._bouncing)
            this.bounceChildren(dt);
        this.recordSlidTime(dt);
    },

    recordSlidTime: function (dt) {
        if (this._bePressed)
            this._slidTime += dt;
    },

    /**
     * Intercept touch event
     * @param {number} event
     * @param {ccui.Widget} sender
     * @param {cc.Touch} touch
     */
    interceptTouchEvent: function (event, sender, touch) {
        var touchPoint = touch.getLocation();
        switch (event) {
            case ccui.Widget.TOUCH_BAGAN:
                this._touchBeganPosition.x = touchPoint.x;
                this._touchBeganPosition.y = touchPoint.y;
                this.handlePressLogic(touch);
                break;
            case ccui.Widget.TOUCH_MOVED:
                var offset = cc.pLength(cc.pSub(sender.getTouchBeganPosition(), touchPoint));
                if (offset > this._childFocusCancelOffset) {
                    sender.setHighlighted(false);
                    this._touchMovePosition.x = touchPoint.x;
                    this._touchMovePosition.y = touchPoint.y;
                    this.handleMoveLogic(touch);
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
            case ccui.Widget.TOUCH_ENDED:
                this._touchEndPosition.x = touchPoint.x;
                this._touchEndPosition.y = touchPoint.y;
                this.handleReleaseLogic(touch);
                break;
        }
    },

    scrollToTopEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector)
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_SCROLL_TO_TOP);
        if (this._eventCallback)
            this._eventCallback(this,ccui.ScrollView.EVENT_SCROLL_TO_TOP);
    },

    scrollToBottomEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector)
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM);
        if (this._eventCallback)
            this._eventCallback(this,ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM);
    },

    scrollToLeftEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_SCROLL_TO_LEFT);
        }
        if (this._eventCallback) {
            this._eventCallback(this,ccui.ScrollView.EVENT_SCROLL_TO_LEFT);
        }
    },

    scrollToRightEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_SCROLL_TO_RIGHT);
        }
        if (this._eventCallback) {
            this._eventCallback(this, ccui.ScrollView.EVENT_SCROLL_TO_RIGHT);
        }
    },

    scrollingEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_SCROLLING);
        }
        if (this._eventCallback) {
            this._eventCallback(this,ccui.ScrollView.EVENT_SCROLLING);
        }
    },

    bounceTopEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_BOUNCE_TOP);
        }
        if (this._eventCallback) {
            this._eventCallback(this,ccui.ScrollView.EVENT_BOUNCE_TOP);
        }
    },

    bounceBottomEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_BOUNCE_BOTTOM);
        }
        if (this._eventCallback) {
            this._eventCallback(this,ccui.ScrollView.EVENT_BOUNCE_BOTTOM);
        }
    },

    bounceLeftEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_BOUNCE_LEFT);
        }
        if (this._eventCallback) {
            this._eventCallback(this, ccui.ScrollView.EVENT_BOUNCE_LEFT);
        }
    },

    bounceRightEvent: function () {
        if (this._scrollViewEventListener && this._scrollViewEventSelector) {
            this._scrollViewEventSelector.call(this._scrollViewEventListener, this, ccui.ScrollView.EVENT_BOUNCE_RIGHT);
        }
        if (this._eventCallback) {
            this._eventCallback(this, ccui.ScrollView.EVENT_BOUNCE_RIGHT);
        }
    },

    /**
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerScrollView: function (selector, target) {
        this._scrollViewEventSelector = selector;
        this._scrollViewEventListener = target;
    },

    addEventListener: function(callback){
        this._eventCallback = callback;
    },

    /**
     * Changes scroll direction of ScrollView.
     * @param {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH} dir
     */
    setDirection: function (dir) {
        this.direction = dir;
    },

    /**
     * Gets scroll direction of ScrollView.
     * @returns {ccui.ScrollView.DIR_NONE | ccui.ScrollView.DIR_VERTICAL | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_BOTH}
     */
    getDirection: function () {
        return this.direction;
    },

    /**
     * set bounce enabled
     * @param {Boolean} enabled
     */
    setBounceEnabled: function (enabled) {
        this.bounceEnabled = enabled;
    },

    /**
     * get whether bounce is enabled
     * @returns {boolean}
     */
    isBounceEnabled: function () {
        return this.bounceEnabled;
    },

    /**
     * set inertiaScroll enabled
     * @param {boolean} enabled
     */
    setInertiaScrollEnabled: function (enabled) {
        this.inertiaScrollEnabled = enabled;
    },

    /**
     * get whether inertiaScroll is enabled
     * @returns {boolean}
     */
    isInertiaScrollEnabled: function () {
        return this.inertiaScrollEnabled;
    },

    /**
     * Gets inner container of ScrollView.  Inner container is the container .of ScrollView's children.
     * @returns {ccui.Layout}
     */
    getInnerContainer: function () {
        return this._innerContainer;
    },

    /**
     * Sets LayoutType.
     * @param {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE} type
     */
    setLayoutType: function (type) {
        this._innerContainer.setLayoutType(type);
    },

    /**
     * Gets LayoutType.
     * @returns {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE}
     */
    getLayoutType: function () {
        return this._innerContainer.getLayoutType();
    },

    _doLayout: function () {
        if (!this._doLayoutDirty)
            return;
        this._doLayoutDirty = false;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "ScrollView";
    },

    createCloneInstance: function(){
        return ccui.ScrollView.create();
    },

    copyClonedWidgetChildren: function (model) {
        ccui.Layout.prototype.copyClonedWidgetChildren.call(this, model);
    },

    copySpecialProperties: function (scrollView) {
        if(scrollView instanceof ccui.ScrollView) {
            ccui.Layout.prototype.copySpecialProperties.call(this, scrollView);
            this.setInnerContainerSize(scrollView.getInnerContainerSize());
            this.setDirection(scrollView.direction);
            this.setBounceEnabled(scrollView.bounceEnabled);
            this.setInertiaScrollEnabled(scrollView.inertiaScrollEnabled);
            this._scrollViewEventListener = scrollView._scrollViewEventListener;
            this._scrollViewEventSelector = scrollView._scrollViewEventSelector;
            this._eventCallback = scrollView._eventCallback;
        }
    }
});

var _p = ccui.ScrollView.prototype;

// Extended properties
/** @expose */
_p.innerWidth;
cc.defineGetterSetter(_p, "innerWidth", _p._getInnerWidth, _p._setInnerWidth);
/** @expose */
_p.innerHeight;
cc.defineGetterSetter(_p, "innerHeight", _p._getInnerHeight, _p._setInnerHeight);

_p = null;

/**
 * allocates and initializes a UIScrollView.
 * @constructs
 * @return {ccui.ScrollView}
 * @example
 * // example
 * var uiScrollView = ccui.ScrollView.create();
 */
ccui.ScrollView.create = function () {
    return new ccui.ScrollView();
};

// Constants
//ScrollView direction
ccui.ScrollView.DIR_NONE = 0;
ccui.ScrollView.DIR_VERTICAL = 1;
ccui.ScrollView.DIR_HORIZONTAL = 2;
ccui.ScrollView.DIR_BOTH = 3;

//ScrollView event
ccui.ScrollView.EVENT_SCROLL_TO_TOP = 0;
ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM = 1;
ccui.ScrollView.EVENT_SCROLL_TO_LEFT = 2;
ccui.ScrollView.EVENT_SCROLL_TO_RIGHT = 3;
ccui.ScrollView.EVENT_SCROLLING = 4;
ccui.ScrollView.EVENT_BOUNCE_TOP = 5;
ccui.ScrollView.EVENT_BOUNCE_BOTTOM = 6;
ccui.ScrollView.EVENT_BOUNCE_LEFT = 7;
ccui.ScrollView.EVENT_BOUNCE_RIGHT = 8;


ccui.ScrollView.AUTO_SCROLL_MAX_SPEED = 1000;
ccui.ScrollView.SCROLLDIR_UP = cc.p(0, 1);
ccui.ScrollView.SCROLLDIR_DOWN = cc.p(0, -1);
ccui.ScrollView.SCROLLDIR_LEFT = cc.p(-1, 0);
ccui.ScrollView.SCROLLDIR_RIGHT = cc.p(1, 0);