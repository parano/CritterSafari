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
 * Base class for ccui.Layout
 * @class
 * @extends ccui.Widget
 *
 * @property {Boolean}                  clippingEnabled - Indicate whether clipping is enabled
 * @property {ccui.Layout.CLIPPING_STENCIL|ccui.Layout.CLIPPING_SCISSOR}   clippingType
 * @property {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE}  layoutType
 *
 */
ccui.Layout = ccui.Widget.extend(/** @lends ccui.Layout# */{
    _clippingEnabled: false,
    _backGroundScale9Enabled: null,
    _backGroundImage: null,
    _backGroundImageFileName: null,
    _backGroundImageCapInsets: null,
    _colorType: null,
    _bgImageTexType: ccui.Widget.LOCAL_TEXTURE,
    _colorRender: null,
    _gradientRender: null,
    _color: null,
    _startColor: null,
    _endColor: null,
    _alongVector: null,
    _opacity: 255,
    _backGroundImageTextureSize: null,
    _layoutType: null,
    _doLayoutDirty: true,
    _clippingRectDirty: true,
    _clippingType: null,
    _clippingStencil: null,
    _handleScissor: false,
    _scissorRectDirty: false,
    _clippingRect: null,
    _clippingParent: null,
    _className: "Layout",
    _backGroundImageColor: null,
    _finalPositionX: 0,
    _finalPositionY: 0,

    //clipping
    _currentStencilEnabled: 0,
    _currentStencilWriteMask: 0,
    _currentStencilFunc: 0,
    _currentStencilRef:0,
    _currentStencilValueMask:0,
    _currentStencilFail:0,
    _currentStencilPassDepthFail:0,
    _currentStencilPassDepthPass:0,
    _currentDepthWriteMask:0,

    _currentAlphaTestEnabled:0,
    _currentAlphaTestFunc:0,
    _currentAlphaTestRef:0,

    _backGroundImageOpacity:0,

    _mask_layer_le: 0,

    _loopFocus: false,
    _passFocusToChild: false,
    _isFocusPassing:false,

    /**
     * allocates and initializes a UILayout.
     * Constructor of ccui.Layout
     * @example
     * // example
     * var uiLayout = new ccui.Layout();
     */
    ctor: function () {
        this._layoutType = ccui.Layout.ABSOLUTE;
        this._widgetType = ccui.Widget.TYPE_CONTAINER;
        this._clippingType = ccui.Layout.CLIPPING_STENCIL;
        this._colorType = ccui.Layout.BG_COLOR_NONE;

        ccui.Widget.prototype.ctor.call(this);
        this._backGroundImageCapInsets = cc.rect(0, 0, 0, 0);

        this._color = cc.color(255, 255, 255, 255);
        this._startColor = cc.color(255, 255, 255, 255);
        this._endColor = cc.color(255, 255, 255, 255);
        this._alongVector = cc.p(0, -1);
        this._backGroundImageTextureSize = cc.size(0, 0);

        this._clippingRect = cc.rect(0, 0, 0, 0);
        this._backGroundImageColor = cc.color(255, 255, 255, 255);
    },
    onEnter: function(){
        ccui.Widget.prototype.onEnter.call(this);
        if (this._clippingStencil)
            this._clippingStencil.onEnter();
        this._doLayoutDirty = true;
        this._clippingRectDirty = true;
    },
    onExit: function(){
        ccui.Widget.prototype.onExit.call(this);
        if (this._clippingStencil)
            this._clippingStencil.onExit();
    },

    /**
     * If a layout is loop focused which means that the focus movement will be inside the layout
     * @param {Boolean} loop pass true to let the focus movement loop inside the layout
     */
    setLoopFocus: function(loop){
        this._loopFocus = loop;
    },

    /**
     * Gets whether enable focus loop
     * @returns {boolean}  If focus loop is enabled, then it will return true, otherwise it returns false. The default value is false.
     */
    isLoopFocus: function(){
        return this._loopFocus;
    },

    /**
     * @param pass To specify whether the layout pass its focus to its child
     */
    setPassFocusToChild: function(pass){
        this._passFocusToChild = pass;
    },

    /**
     * @returns {boolean} To query whether the layout will pass the focus to its children or not. The default value is true
     */
    isPassFocusToChild: function(){
        return this._passFocusToChild;
    },

    /**
     * When a widget is in a layout, you could call this method to get the next focused widget within a specified direction.
     * If the widget is not in a layout, it will return itself
     * @param direction the direction to look for the next focused widget in a layout
     * @param current the current focused widget
     * @returns {ccui.Widget} return the index of widget in the layout
     */
    findNextFocusedWidget: function(direction, current){
        if (this._isFocusPassing || this.isFocused()) {
            var parent = this.getParent();
            this._isFocusPassing = false;

            if (this._passFocusToChild) {
                var w = this._passFocusToChild(direction, current);
                if (w instanceof ccui.Layout && parent) {
                    parent._isFocusPassing = true;
                    return parent.findNextFocusedWidget(direction, this);
                }
                return w;
            }

            if (null == parent)
                return this;
            parent._isFocusPassing = true;
            return parent.findNextFocusedWidget(direction, this);
        } else if(current.isFocused() || current instanceof ccui.Layout) {
            if (this._layoutType == ccui.Layout.LINEAR_HORIZONTAL) {
                switch (direction){
                    case ccui.Widget.LEFT:
                        return this._getPreviousFocusedWidget(direction, current);
                    break;
                    case ccui.Widget.RIGHT:
                        return this._getNextFocusedWidget(direction, current);
                    break;
                    case ccui.Widget.DOWN:
                    case ccui.Widget.UP:
                        if (this._isLastWidgetInContainer(this, direction)){
                            if (this._isWidgetAncestorSupportLoopFocus(current, direction))
                                return this.findNextFocusedWidget(direction, this);
                            return current;
                        } else {
                            return this.findNextFocusedWidget(direction, this);
                        }
                    break;
                    default:
                        cc.assert(0, "Invalid Focus Direction");
                        return current;
                }
            } else if (this._layoutType == ccui.Layout.LINEAR_VERTICAL) {
                switch (direction){
                    case ccui.Widget.LEFT:
                    case ccui.Widget.RIGHT:
                        if (this._isLastWidgetInContainer(this, direction)) {
                            if (this._isWidgetAncestorSupportLoopFocus(current, direction))
                                return this.findNextFocusedWidget(direction, this);
                            return current;
                        }
                        else
                            return this.findNextFocusedWidget(direction, this);
                     break;
                    case ccui.Widget.DOWN:
                        return this._getNextFocusedWidget(direction, current);
                        break;
                    case ccui.Widget.UP:
                        return this._getPreviousFocusedWidget(direction, current);
                        break;
                    default:
                        cc.assert(0, "Invalid Focus Direction");
                        return current;
                }
            } else {
                cc.assert(0, "Un Supported Layout type, please use VBox and HBox instead!!!");
                return current;
            }
        } else
            return current;
    },

    onPassFocusToChild: null,

    init: function () {
        if (ccui.Widget.prototype.init.call(this)) {
            this.ignoreContentAdaptWithSize(false);
            this.setSize(cc.size(0, 0));
            this.setAnchorPoint(0, 0);
            this.onPassFocusToChild  = this._findNearestChildWidgetIndex.bind(this);
            return true;
        }
        return false;
    },

    __stencilDraw: function(ctx){
        var locContext = ctx || cc._renderContext;
        var stencil = this._clippingStencil;
        var locEGL_ScaleX = cc.view.getScaleX(), locEGL_ScaleY = cc.view.getScaleY();
        for (var i = 0; i < stencil._buffer.length; i++) {
            var element = stencil._buffer[i];
            var vertices = element.verts;
            var firstPoint = vertices[0];
            locContext.beginPath();
            locContext.moveTo(firstPoint.x * locEGL_ScaleX, -firstPoint.y * locEGL_ScaleY);
            for (var j = 1, len = vertices.length; j < len; j++)
                locContext.lineTo(vertices[j].x * locEGL_ScaleX, -vertices[j].y * locEGL_ScaleY);
        }
    },

    /**
     * Adds a widget to the container.
     * @param {ccui.Widget} widget
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: function (widget, zOrder, tag) {
        if ((widget instanceof ccui.Widget)) {
            this.supplyTheLayoutParameterLackToChild(widget);
        }
        ccui.Widget.prototype.addChild.call(this, widget, zOrder, tag);
        this._doLayoutDirty = true;
    },

    /**
     * Remove child widget from ccui.Layout
     * @param {ccui.Widget} widget
     * @param {Boolean} cleanup
     */
    removeChild: function (widget, cleanup) {
        ccui.Widget.prototype.removeChild.call(this, widget, cleanup);
        this._doLayoutDirty = true;
    },

    /**
     * Removes all children from the container with a cleanup.
     * @param {Boolean} cleanup
     */
    removeAllChildren: function (cleanup) {
        ccui.Widget.prototype.removeAllChildren.call(this, cleanup);
        this._doLayoutDirty = true;
    },

    /**
     * Removes all children from the container, and do a cleanup to all running actions depending on the cleanup parameter.
     * @param {Boolean} cleanup true if all running actions on all children nodes should be cleanup, false otherwise.
     */
    removeAllChildrenWithCleanup: function(cleanup){
        ccui.Widget.prototype.removeAllChildrenWithCleanup(cleanup);
        this._doLayoutDirty = true;
    },

    /**
     * Gets if layout is clipping enabled.
     * @returns {Boolean}
     */
    isClippingEnabled: function () {
        return this._clippingEnabled;
    },

    visit: function (ctx) {
        if (!this._visible)
            return;
        this.adaptRenderers();
        this._doLayout();

        if (this._clippingEnabled) {
            switch (this._clippingType) {
                case ccui.Layout.CLIPPING_STENCIL:
                    this.stencilClippingVisit(ctx);
                    break;
                case ccui.Layout.CLIPPING_SCISSOR:
                    this.scissorClippingVisit(ctx);
                    break;
                default:
                    break;
            }
        } else {
            ccui.Widget.prototype.visit.call(this, ctx);
        }
    },

    sortAllChildren: function () {
        ccui.Widget.prototype.sortAllChildren.call(this);
        this._doLayout();
    },

    stencilClippingVisit: null,

    _stencilClippingVisitForWebGL: function (ctx) {
        var gl = ctx || cc._renderContext;

        // if stencil buffer disabled
        /*if (cc.stencilBits < 1) {
         // draw everything, as if there where no stencil
         cc.Node.prototype.visit.call(this, ctx);
         return;
         }*/

        if (!this._clippingStencil || !this._clippingStencil.isVisible())
            return;

        // store the current stencil layer (position in the stencil buffer),
        // this will allow nesting up to n CCClippingNode,
        // where n is the number of bits of the stencil buffer.
        ccui.Layout._layer = -1;

        // all the _stencilBits are in use?
        if (ccui.Layout._layer + 1 == cc.stencilBits) {
            // warn once
            ccui.Layout._visit_once = true;
            if (ccui.Layout._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs.");
                ccui.Layout._visit_once = false;
            }
            // draw everything, as if there where no stencil
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        // increment the current layer
        ccui.Layout._layer++;

        // mask of the current layer (ie: for layer 3: 00000100)
        var mask_layer = 0x1 << ccui.Layout._layer;
        // mask of all layers less than the current (ie: for layer 3: 00000011)
        var mask_layer_l = mask_layer - 1;
        // mask of all layers less than or equal to the current (ie: for layer 3: 00000111)
        var mask_layer_le = mask_layer | mask_layer_l;

        // manually save the stencil state
        var currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);
        var currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        var currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        var currentStencilRef = gl.getParameter(gl.STENCIL_REF);
        var currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        var currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
        var currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        var currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);

        // enable stencil use
        gl.enable(gl.STENCIL_TEST);
        // check for OpenGL error while enabling stencil test
        //cc.checkGLErrorDebug();

        // all bits on the stencil buffer are readonly, except the current layer bit,
        // this means that operation like glClear or glStencilOp will be masked with this value
        gl.stencilMask(mask_layer);

        // manually save the depth test state
        //GLboolean currentDepthTestEnabled = GL_TRUE;
        //currentDepthTestEnabled = glIsEnabled(GL_DEPTH_TEST);
        var currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);

        // disable depth test while drawing the stencil
        //glDisable(GL_DEPTH_TEST);
        // disable update to the depth buffer while drawing the stencil,
        // as the stencil is not meant to be rendered in the real scene,
        // it should never prevent something else to be drawn,
        // only disabling depth buffer update should do
        gl.depthMask(false);

        // manually clear the stencil buffer by drawing a fullscreen rectangle on it
        // setup the stencil test func like this:
        // for each pixel in the fullscreen rectangle
        //     never draw it into the frame buffer
        //     if not in inverted mode: set the current layer value to 0 in the stencil buffer
        //     if in inverted mode: set the current layer value to 1 in the stencil buffer
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(gl.ZERO, gl.KEEP, gl.KEEP);

        // draw a fullscreen solid rectangle to clear the stencil buffer
        //ccDrawSolidRect(CCPointZero, ccpFromSize([[CCDirector sharedDirector] winSize]), ccc4f(1, 1, 1, 1));
        cc._drawingUtil.drawSolidRect(cc.p(0, 0), cc.pFromSize(cc.director.getWinSize()), cc.color(255, 255, 255, 255));

        // setup the stencil test func like this:
        // for each pixel in the stencil node
        //     never draw it into the frame buffer
        //     if not in inverted mode: set the current layer value to 1 in the stencil buffer
        //     if in inverted mode: set the current layer value to 0 in the stencil buffer
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(gl.REPLACE, gl.KEEP, gl.KEEP);

        cc.kmGLPushMatrix();
        this.transform();

        this._clippingStencil.visit();

        // restore the depth test state
        gl.depthMask(currentDepthWriteMask);

        gl.stencilFunc(gl.EQUAL, mask_layer_le, mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        // draw (according to the stencil test func) this node and its childs
        var i = 0;      // used by _children
        var j = 0;      // used by _protectedChildren

        this.sortAllChildren();
        this.sortAllProtectedChildren();
        var locChildren = this._children, locProtectChildren = this._protectedChildren;
        var iLen = locChildren.length, jLen = locProtectChildren.length, child;
        for( ; i < iLen; i++ ){
            child = locChildren[i];
            if ( child && child.getLocalZOrder() < 0 )
                child.visit();
            else
                break;
        }
        for( ; j < jLen; j++ ) {
            child = locProtectChildren[j];
            if ( child && child.getLocalZOrder() < 0 )
                child.visit();
            else
                break;
        }
        this.draw();
        for (; i < iLen; i++)
            locChildren[i].visit();
        for (; j < jLen; j++)
            locProtectChildren[j].visit();

        // manually restore the stencil state
        gl.stencilFunc(currentStencilFunc, currentStencilRef, currentStencilValueMask);
        gl.stencilOp(currentStencilFail, currentStencilPassDepthFail, currentStencilPassDepthPass);
        gl.stencilMask(currentStencilWriteMask);
        if (!currentStencilEnabled)
            gl.disable(gl.STENCIL_TEST);

        // we are done using this layer, decrement
        ccui.Layout._layer--;

        cc.kmGLPopMatrix();
    },

    _stencilClippingVisitForCanvas: function (ctx) {
        // return fast (draw nothing, or draw everything if in inverted mode) if:
        // - nil stencil node
        // - or stencil node invisible:
        if (!this._clippingStencil || !this._clippingStencil.isVisible()) {
            return;
        }
        var context = ctx || cc._renderContext;
        // Composition mode, costy but support texture stencil
        if (this._cangodhelpme() || this._clippingStencil instanceof cc.Sprite) {
            // Cache the current canvas, for later use (This is a little bit heavy, replace this solution with other walkthrough)
            var canvas = context.canvas;
            var locCache = ccui.Layout._getSharedCache();
            locCache.width = canvas.width;
            locCache.height = canvas.height;
            var locCacheCtx = locCache.getContext("2d");
            locCacheCtx.drawImage(canvas, 0, 0);

            context.save();
            // Draw everything first using node visit function
            cc.Node.prototype.visit.call(this, context);

            context.globalCompositeOperation = "destination-in";

            this.transform(context);
            this._clippingStencil.visit();

            context.restore();

            // Redraw the cached canvas, so that the cliped area shows the background etc.
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalCompositeOperation = "destination-over";
            context.drawImage(locCache, 0, 0);
            context.restore();
        } else {    // Clip mode, fast, but only support cc.DrawNode
            var i, children = this._children, locChild;

            context.save();
            this.transform(context);
            this._clippingStencil.visit(context);
            context.clip();

            // Clip mode doesn't support recusive stencil, so once we used a clip stencil,
            // so if it has ClippingNode as a child, the child must uses composition stencil.
            this._cangodhelpme(true);

            this.sortAllChildren();
            this.sortAllProtectedChildren();

            var j, locProtectChildren = this._protectedChildren;
            var iLen = children.length, jLen = locProtectChildren.length;

            // draw children zOrder < 0
            for (i = 0; i < iLen; i++) {
                locChild = children[i];
                if (locChild && locChild._localZOrder < 0)
                    locChild.visit(context);
                else
                    break;
            }
            for (j = 0; j < jLen; j++) {
                locChild = locProtectChildren[j];
                if (locChild && locChild._localZOrder < 0)
                    locChild.visit(context);
                else
                    break;
            }
            //this.draw(context);
            for (; i < iLen; i++)
                children[i].visit(context);
            for (; j < jLen; j++)
                locProtectChildren[j].visit(context);

            this._cangodhelpme(false);
            context.restore();
        }
    },

    _godhelpme: false,
    _cangodhelpme: function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.prototype._godhelpme;
    },

    scissorClippingVisit: null,
    _scissorClippingVisitForWebGL: function (ctx) {
        var clippingRect = this.getClippingRect();
        var gl = ctx || cc._renderContext;
        if (this._handleScissor) {
            gl.enable(gl.SCISSOR_TEST);
        }
        cc.view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);
        cc.Node.prototype.visit.call(this);
        if (this._handleScissor) {
            gl.disable(gl.SCISSOR_TEST);
        }
    },

    /**
     * Changes if layout can clip it's content and locChild.
     * @param {Boolean} able
     */
    setClippingEnabled: function (able) {
        if (able == this._clippingEnabled)
            return;
        this._clippingEnabled = able;
        switch (this._clippingType) {
            case ccui.Layout.CLIPPING_STENCIL:
                if (able){
                    this._clippingStencil = cc.DrawNode.create();
                    if(cc._renderType === cc._RENDER_TYPE_CANVAS)
                        this._clippingStencil.draw = this.__stencilDraw.bind(this);
                    if (this._running)
                        this._clippingStencil.onEnter();
                    this.setStencilClippingSize(this._contentSize);
                } else {
                    if (this._running)
                        this._clippingStencil.onExit();
                    this._clippingStencil = null;
                }
                break;
            default:
                break;
        }
    },

    /**
     * Set clipping type
     * @param {ccui.Layout.CLIPPING_STENCIL|ccui.Layout.CLIPPING_SCISSOR} type
     */
    setClippingType: function (type) {
        if (type == this._clippingType) {
            return;
        }
        var clippingEnabled = this.isClippingEnabled();
        this.setClippingEnabled(false);
        this._clippingType = type;
        this.setClippingEnabled(clippingEnabled);
    },

    /**
     * Get clipping type
     * @returns {ccui.Layout.CLIPPING_STENCIL|ccui.Layout.CLIPPING_SCISSOR}
     */
    getClippingType: function () {
        return this._clippingType;
    },

    setStencilClippingSize: function (size) {
        if (this._clippingEnabled && this._clippingType == ccui.Layout.CLIPPING_STENCIL) {
            var rect = [];
            rect[0] = cc.p(0, 0);
            rect[1] = cc.p(size.width, 0);
            rect[2] = cc.p(size.width, size.height);
            rect[3] = cc.p(0, size.height);
            var green = cc.color.GREEN;
            this._clippingStencil.clear();
            this._clippingStencil.drawPoly(rect, 4, green, 0, green);
        }
    },

    rendererVisitCallBack: function () {
        this._doLayout();
    },

    getClippingRect: function () {
        if (this._clippingRectDirty) {
            var worldPos = this.convertToWorldSpace(cc.p(0, 0));
            var t = this.nodeToWorldTransform();
            var scissorWidth = this._contentSize.width * t.a;
            var scissorHeight = this._contentSize.height * t.d;
            var parentClippingRect;
            var parent = this;
            var firstClippingParentFounded = false;
            while (parent) {
                parent = parent.getParent();
                if (parent && parent instanceof ccui.Layout) {
                    if (parent.isClippingEnabled()) {
                        if (!firstClippingParentFounded) {
                            this._clippingParent = parent;
                            firstClippingParentFounded = true;
                        }
                        if (parent._clippingType == ccui.Layout.CLIPPING_SCISSOR) {
                            this._handleScissor = false;
                            break;
                        }
                    }
                }
            }

            if (this._clippingParent) {
                parentClippingRect = this._clippingParent.getClippingRect();
                var finalX = worldPos.x - (scissorWidth * this._anchorPoint.x);
                var finalY = worldPos.y - (scissorHeight * this._anchorPoint.y);
                var finalWidth = scissorWidth;
                var finalHeight = scissorHeight;

                var leftOffset = worldPos.x - parentClippingRect.x;
                if (leftOffset < 0) {
                    finalX = parentClippingRect.x;
                    finalWidth += leftOffset;
                }
                var rightOffset = (worldPos.x + scissorWidth) - (parentClippingRect.x + parentClippingRect.width);
                if (rightOffset > 0) {
                    finalWidth -= rightOffset;
                }
                var topOffset = (worldPos.y + scissorHeight) - (parentClippingRect.y + parentClippingRect.height);
                if (topOffset > 0) {
                    finalHeight -= topOffset;
                }
                var bottomOffset = worldPos.y - parentClippingRect.y;
                if (bottomOffset < 0) {
                    finalY = parentClippingRect.x;
                    finalHeight += bottomOffset;
                }
                if (finalWidth < 0) {
                    finalWidth = 0;
                }
                if (finalHeight < 0) {
                    finalHeight = 0;
                }
                this._clippingRect.x = finalX;
                this._clippingRect.y = finalY;
                this._clippingRect.width = finalWidth;
                this._clippingRect.height = finalHeight;
            }
            else {
                this._clippingRect.x = worldPos.x - (scissorWidth * this._anchorPoint.x);
                this._clippingRect.y = worldPos.y - (scissorHeight * this._anchorPoint.y);
                this._clippingRect.width = scissorWidth;
                this._clippingRect.height = scissorHeight;
            }
            this._clippingRectDirty = false;
        }
        return this._clippingRect;
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.setStencilClippingSize(this._contentSize);
        this._doLayoutDirty = true;
        this._clippingRectDirty = true;
        if (this._backGroundImage) {
            this._backGroundImage.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5);
            if (this._backGroundScale9Enabled) {
                if (this._backGroundImage instanceof cc.Scale9Sprite) {
                    this._backGroundImage.setPreferredSize(this._contentSize);
                }
            }
        }
        if (this._colorRender) {
            this._colorRender.setContentSize(this._contentSize);
        }
        if (this._gradientRender) {
            this._gradientRender.setContentSize(this._contentSize);
        }
    },

    /**
     * Sets background image use scale9 renderer.
     * @param {Boolean} able
     */
    setBackGroundImageScale9Enabled: function (able) {
        if (this._backGroundScale9Enabled == able) {
            return;
        }
        this.removeProtectedChild(this._backGroundImage);
        //cc.Node.prototype.removeChild.call(this, this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundScale9Enabled = able;
       /* if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
        }
        else {
            this._backGroundImage = cc.Sprite.create();
        }
        cc.Node.prototype.addChild.call(this, this._backGroundImage, ccui.Layout.BACKGROUND_IMAGE_ZORDER, -1);*/
        this.addBackGroundImage();
        this.setBackGroundImage(this._backGroundImageFileName, this._bgImageTexType);
        this.setBackGroundImageCapInsets(this._backGroundImageCapInsets);
    },

    /**
     * Get background image is use scale9 renderer.
     * @returns {Boolean}
     */
    isBackGroundImageScale9Enabled: function () {
        return this._backGroundScale9Enabled;
    },

    /**
     * Sets a background image for layout
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    setBackGroundImage: function (fileName, texType) {
        if (!fileName)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        if (this._backGroundImage == null)
            this.addBackGroundImage();
        this._backGroundImageFileName = fileName;
        this._bgImageTexType = texType;
        if (this._backGroundScale9Enabled) {
            var bgiScale9 = this._backGroundImage;
            switch (this._bgImageTexType) {
                case ccui.Widget.LOCAL_TEXTURE:
                    bgiScale9.initWithFile(fileName);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    bgiScale9.initWithSpriteFrameName(fileName);
                    break;
                default:
                    break;
            }
            bgiScale9.setPreferredSize(this._contentSize);
        } else {
            var sprite = this._backGroundImage;
            switch (this._bgImageTexType){
                case ccui.Widget.LOCAL_TEXTURE:
                    sprite.setTexture(fileName);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    sprite.setSpriteFrame(fileName);
                    break;
                default:
                    break;
            }
        }
        this._backGroundImageTextureSize = this._backGroundImage.getContentSize();
        this._backGroundImage.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
        this._updateBackGroundImageColor();
    },

    /**
     * Sets a background image CapInsets for layout, if the background image is a scale9 render.
     * @param {cc.Rect} capInsets
     */
    setBackGroundImageCapInsets: function (capInsets) {
        this._backGroundImageCapInsets = capInsets;
        if (this._backGroundScale9Enabled)
            this._backGroundImage.setCapInsets(capInsets);
    },

    /**
     * Gets background image cap insets.
     * @returns {cc.Rect}
     */
    getBackGroundImageCapInsets: function () {
        return this._backGroundImageCapInsets;
    },

    supplyTheLayoutParameterLackToChild: function (locChild) {
        if (!locChild) {
            return;
        }
        switch (this._layoutType) {
            case ccui.Layout.ABSOLUTE:
                break;
            case ccui.Layout.LINEAR_HORIZONTAL:
            case ccui.Layout.LINEAR_VERTICAL:
                var layoutParameter = locChild.getLayoutParameter(ccui.LayoutParameter.LINEAR);
                if (!layoutParameter)
                    locChild.setLayoutParameter(ccui.LinearLayoutParameter.create());
                break;
            case ccui.Layout.RELATIVE:
                var layoutParameter = locChild.getLayoutParameter(ccui.LayoutParameter.RELATIVE);
                if (!layoutParameter)
                    locChild.setLayoutParameter(ccui.RelativeLayoutParameter.create());
                break;
            default:
                break;
        }
    },

    /**
     * init background image renderer.
     */
    addBackGroundImage: function () {
        if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
            this._backGroundImage.setPreferredSize(this._contentSize);
        } else {
            this._backGroundImage = cc.Sprite.create();
        }
        this.addProtectedChild(this._backGroundImage, ccui.Layout.BACKGROUND_IMAGE_ZORDER, -1);
        this._backGroundImage.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    /**
     * Remove the background image of layout.
     */
    removeBackGroundImage: function () {
        if (!this._backGroundImage)
            return;
        this.removeProtectedChild(this._backGroundImage);
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageTextureSize = cc.size(0, 0);
    },

    /**
     * Sets Color Type for layout.
     * @param {ccui.Layout.BG_COLOR_NONE|ccui.Layout.BG_COLOR_SOLID|ccui.Layout.BG_COLOR_GRADIENT} type
     */
    setBackGroundColorType: function (type) {
        if (this._colorType == type)
            return;
        switch (this._colorType) {
            case ccui.Layout.BG_COLOR_NONE:
                if (this._colorRender) {
                    this.removeProtectedChild(this._colorRender);
                    this._colorRender = null;
                }
                if (this._gradientRender) {
                    this.removeProtectedChild(this._gradientRender);
                    this._gradientRender = null;
                }
                break;
            case ccui.Layout.BG_COLOR_SOLID:
                if (this._colorRender) {
                    this.removeProtectedChild(this._colorRender);
                    this._colorRender = null;
                }
                break;
            case ccui.Layout.BG_COLOR_GRADIENT:
                if (this._gradientRender) {
                    this.removeProtectedChild(this._gradientRender);
                    this._gradientRender = null;
                }
                break;
            default:
                break;
        }
        this._colorType = type;
        switch (this._colorType) {
            case ccui.Layout.BG_COLOR_NONE:
                break;
            case ccui.Layout.BG_COLOR_SOLID:
                this._colorRender = cc.LayerColor.create();
                this._colorRender.setContentSize(this._contentSize);
                this._colorRender.setOpacity(this._opacity);
                this._colorRender.setColor(this._color);
                this.addProtectedChild(this._colorRender, ccui.Layout.BACKGROUND_RENDERER_ZORDER, -1);
                break;
            case ccui.Layout.BG_COLOR_GRADIENT:
                this._gradientRender = cc.LayerGradient.create(cc.color(255, 0, 0, 255), cc.color(0, 255, 0, 255));
                this._gradientRender.setContentSize(this._contentSize);
                this._gradientRender.setOpacity(this._opacity);
                this._gradientRender.setStartColor(this._startColor);
                this._gradientRender.setEndColor(this._endColor);
                this._gradientRender.setVector(this._alongVector);
                this.addProtectedChild(this._gradientRender, ccui.Layout.BACKGROUND_RENDERER_ZORDER, -1);
                break;
            default:
                break;
        }
    },

    /**
     * Get color type.
     * @returns {ccui.Layout.BG_COLOR_NONE|ccui.Layout.BG_COLOR_SOLID|ccui.Layout.BG_COLOR_GRADIENT}
     */
    getBackGroundColorType: function () {
        return this._colorType;
    },

    /**
     * Sets background color for layout, if color type is Layout.COLOR_SOLID
     * @param {cc.Color} color
     * @param {cc.Color} endColor
     */
    setBackGroundColor: function (color, endColor) {
        if (!endColor) {
            this._color.r = color.r;
            this._color.g = color.g;
            this._color.b = color.b;
            if (this._colorRender) {
                this._colorRender.setColor(color);
            }
        } else {
            this._startColor.r = color.r;
            this._startColor.g = color.g;
            this._startColor.b = color.b;

            if (this._gradientRender) {
                this._gradientRender.setStartColor(color);
            }
            this._endColor = endColor;
            if (this._gradientRender) {
                this._gradientRender.setEndColor(endColor);
            }
        }
    },

    /**
     * Get back ground color
     * @returns {cc.Color}
     */
    getBackGroundColor: function () {
        var tmpColor = this._color;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * Get back ground start color
     * @returns {cc.Color}
     */
    getBackGroundStartColor: function () {
        var tmpColor = this._startColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * Get back ground end color
     * @returns {cc.Color}
     */
    getBackGroundEndColor: function () {
        var tmpColor = this._endColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * Sets background opacity layout.
     * @param {number} opacity
     */
    setBackGroundColorOpacity: function (opacity) {
        this._opacity = opacity;
        switch (this._colorType) {
            case ccui.Layout.BG_COLOR_NONE:
                break;
            case ccui.Layout.BG_COLOR_SOLID:
                this._colorRender.setOpacity(opacity);
                break;
            case ccui.Layout.BG_COLOR_GRADIENT:
                this._gradientRender.setOpacity(opacity);
                break;
            default:
                break;
        }
    },

    /**
     * Get background opacity value.
     * @returns {Number}
     */
    getBackGroundColorOpacity: function () {
        return this._opacity;
    },

    /**
     * Sets background color vector for layout, if color type is Layout.COLOR_GRADIENT
     * @param {cc.Point} vector
     */
    setBackGroundColorVector: function (vector) {
        this._alongVector.x = vector.x;
        this._alongVector.y = vector.y;
        if (this._gradientRender) {
            this._gradientRender.setVector(vector);
        }
    },

    /**
     *  Get background color value.
     * @returns {cc.Point}
     */
    getBackGroundColorVector: function () {
        return this._alongVector;
    },

    /**
     * Set backGround image color
     * @param {cc.Color} color
     */
    setBackGroundImageColor: function (color) {
        this._backGroundImageColor.r = color.r;
        this._backGroundImageColor.g = color.g;
        this._backGroundImageColor.b = color.b;

        this._updateBackGroundImageColor();
    },

    /**
     * Get backGround image color
     * @param {Number} opacity
     */
    setBackGroundImageOpacity: function (opacity) {
        this._backGroundImageColor.a = opacity;
        this.getBackGroundImageColor();
    },

    /**
     * Get backGround image color
     * @returns {cc.Color}
     */
    getBackGroundImageColor: function () {
        var color = this._backGroundImageColor;
        return cc.color(color.r, color.g, color.b, color.a);
    },

    /**
     * Get backGround image opacity
     * @returns {Number}
     */
    getBackGroundImageOpacity: function () {
        return this._backGroundImageColor.a;
    },

    _updateBackGroundImageColor: function () {
        if(this._backGroundImage)
            this._backGroundImage.setColor(this._backGroundImageColor);
    },

    /**
     * Gets background image texture size.
     * @returns {cc.Size}
     */
    getBackGroundImageTextureSize: function () {
        return this._backGroundImageTextureSize;
    },

    /**
     * Sets LayoutType.
     * @param {ccui.Layout.ABSOLUTE|ccui.Layout.LINEAR_VERTICAL|ccui.Layout.LINEAR_HORIZONTAL|ccui.Layout.RELATIVE} type
     */
    setLayoutType: function (type) {
        this._layoutType = type;
        var layoutChildrenArray = this._children;
        var locChild = null;
        for (var i = 0; i < layoutChildrenArray.length; i++) {
            locChild = layoutChildrenArray[i];
            if(locChild instanceof ccui.Widget)
                this.supplyTheLayoutParameterLackToChild(locChild);
        }
        this._doLayoutDirty = true;
    },

    /**
     * Gets LayoutType.
     * @returns {null}
     */
    getLayoutType: function () {
        return this._layoutType;
    },

    /**
     * request do layout
     */
    requestDoLayout: function () {
        this._doLayoutDirty = true;
    },

    _doLayout: function () {
        if (!this._doLayoutDirty)
            return;

        var executant = this._createLayoutManager();     //TODO create a layout manager every calling _doLayout?
        if (executant)
            executant._doLayout(this);
        this._doLayoutDirty = false;
    },

    _createLayoutManager: function(){
        var layoutMgr = null;
        switch (this._layoutType) {
            case ccui.Layout.LINEAR_VERTICAL:
                layoutMgr = ccui.LinearVerticalLayoutManager.create();
                break;
            case ccui.Layout.LINEAR_HORIZONTAL:
                layoutMgr = ccui.LinearHorizontalLayoutManager.create();
                break;
            case ccui.Layout.RELATIVE:
                layoutMgr = ccui.RelativeLayoutManager.create();
                break;
        }
        return layoutMgr;
    },

    _getLayoutContentSize: function(){
        return this.getContentSize();
    },

    _getLayoutElements: function(){
        return this.getChildren();
    },

    //clipping
    _onBeforeVisitStencil: function(){
        //TODO NEW RENDERER
    },

    _drawFullScreenQuadClearStencil:function(){
        //TODO NEW RENDERER
    },

    _onAfterDrawStencil: function(){
        //TODO NEW RENDERER
    },

    _onAfterVisitStencil: function(){
        //TODO NEW RENDERER
    },

    _onAfterVisitScissor: function(){
        //TODO NEW RENDERER
    },

    _onAfterVisitScissor: function(){
        //TODO NEW RENDERER
    },

    _updateBackGroundImageOpacity: function(){
        if (this._backGroundImage)
            this._backGroundImage.setOpacity(this._backGroundImageOpacity);
    },

    _updateBackGroundImageRGBA: function(){
        if (this._backGroundImage) {
            this._backGroundImage.setColor(this._backGroundImageColor);
            this._backGroundImage.setOpacity(this._backGroundImageOpacity);
        }
    },

    _getLayoutAccumulatedSize: function(){
        var children = this.getChildren();
        var  layoutSize = cc.size(0, 0);
        var widgetCount = 0, locSize;
        for(var i = 0, len = children.length; i < len; i++) {
            var layout = children[i];
            if (null != layout && layout instanceof ccui.Layout){
                locSize = layout._getLayoutAccumulatedSize();
                layoutSize.width += locSize.width;
                layoutSize.height += locSize.height;
                // C++ layoutSize = layoutSize + layout.getLayoutAccumulatedSize();
            } else {
                if (layout instanceof ccui.Widget) {
                    widgetCount++;
                    var m = w.getLayoutParameter().getMargin();
                    locSize = w.getContentSize();
                    // c++ layoutSize = layoutSize + w.getContentSize() + cc.size(m.right + m.left,  m.top + m.bottom) * 0.5;
                    layoutSize.width += locSize.width +  (m.right + m.left) * 0.5;
                    layoutSize.height += locSize.height +  (m.top + m.bottom) * 0.5;
                }
            }
        }

        //substract extra size
        var type = this.getLayoutType();
        if (type == ccui.Layout.LINEAR_HORIZONTAL)
            layoutSize.height = layoutSize.height - layoutSize.height/widgetCount * (widgetCount-1);

        if (type == ccui.Layout.LINEAR_VERTICAL)
            layoutSize.width = layoutSize.width - layoutSize.width/widgetCount * (widgetCount-1);
        return layoutSize;
    },

    _findNearestChildWidgetIndex: function(direction, baseWidget){
        if (baseWidget == null || baseWidget == this)
            return this._findFirstFocusEnabledWidgetIndex();

        var index = 0, locChildren = this.getChildren();
        var count = locChildren.length;
        var widgetPosition;

        var distance = cc.FLT_MAX, found = 0;
        if (direction == ccui.Widget.LEFT || direction == ccui.Widget.RIGHT || direction == ccui.Widget.DOWN || direction == ccui.Widget.UP) {
            widgetPosition = this._getWorldCenterPoint(baseWidget);
            while (index < count) {
                var w = locChildren[index];
                if (w && w instanceof ccui.Widget && w.isFocusEnabled()) {
                    var length = (w instanceof ccui.Layout)? w._calculateNearestDistance(baseWidget)
                        : cc.pLength(cc.pSub(this._getWorldCenterPoint(w), widgetPosition));

                    if (length < distance){
                        found = index;
                        distance = length;
                    }
                }
                index++;
            }
            return found;
        }
        cc.assert(0, "invalid focus direction!");
        return 0;
    },

    _findFarestChildWidgetIndex: function(direction, baseWidget){
        if (baseWidget == null || baseWidget == this)
            return this._findFirstFocusEnabledWidgetIndex();

        var index = 0;
        var count = this.getChildren().size();

        var distance = -cc.FLT_MAX;
        var found = 0;
        if (direction == ccui.Widget.LEFT || direction == ccui.Widget.RIGHT || direction == ccui.Widget.DOWN || direction == ccui.Widget.UP) {
            var widgetPosition =  this._getWorldCenterPoint(baseWidget);
            while (index <  count) {
                if (w && w instanceof ccui.Widget && w.isFocusEnabled()) {
                    var length = (w instanceof ccui.Layout)?w._calculateFarestDistance(baseWidget)
                        : cc.pLength(cc.pSub(this._getWorldCenterPoint(w), widgetPosition));

                    if (length > distance){
                        found = index;
                        distance = length;
                    }
                }
                index++;
            }
            return  found;
        }
        cc.assert(0, "invalid focus direction!!!");
        return 0;
    },

    _calculateNearestDistance: function(baseWidget){
        var distance = cc.FLT_MAX;
        var widgetPosition =  this._getWorldCenterPoint(baseWidget);
        var locChildren = this._children;

        for (var i = 0, len = locChildren.length; i < len; i++) {
            var widget = locChildren[i];
            var length;
            if (widget instanceof ccui.Layout)
                length = widget._calculateNearestDistance(baseWidget);
            else {
                if (widget instanceof ccui.Widget && widget.isFocusEnabled())
                    length = cc.pLength(cc.pSub(this._getWorldCenterPoint(widget), widgetPosition));
                else
                    continue;
            }

            if (length < distance)
                distance = length;
        }
        return distance;
    },

    _calculateFarestDistance:function(baseWidget){
        var distance = -cc.FLT_MAX;
        var widgetPosition =  this._getWorldCenterPoint(baseWidget);
        var locChildren = this._children;

        for (var i = 0, len = locChildren.length; i < len; i++) {
            var layout = locChildren[i];
            var length;
            if (layout instanceof ccui.Layout)
                length = layout._calculateFarestDistance(baseWidget);
            else {
                if (layout instanceof ccui.Widget && layout.isFocusEnabled()) {
                    var wPosition = this._getWorldCenterPoint(w);
                    length = cc.pLength(cc.pSub(wPosition, widgetPosition));
                } else
                    continue;
            }

            if (length > distance)
                distance = length;
        }
        return distance;
    },

    _findProperSearchingFunctor: function(direction, baseWidget){
        if (baseWidget == null)
            return;

        var previousWidgetPosition = this._getWorldCenterPoint(baseWidget);
        var widgetPosition = this._getWorldCenterPoint(this._findFirstNonLayoutWidget());
        if (direction == ccui.Widget.LEFT) {
            if (previousWidgetPosition.x > widgetPosition.x)
                this.onPassFocusToChild = this._findNearestChildWidgetIndex.bind(this);
            else
                this.onPassFocusToChild = this._findFarestChildWidgetIndex.bind(this);
        }else if(direction == ccui.Widget.RIGHT){
            if (previousWidgetPosition.x > widgetPosition.x)
                this.onPassFocusToChild = this._findFarestChildWidgetIndex.bind(this);
            else
                this.onPassFocusToChild = this._findNearestChildWidgetIndex.bind(this);
        }else if(direction == ccui.Widget.DOWN){
            if (previousWidgetPosition.y > widgetPosition.y)
                this.onPassFocusToChild = this._findNearestChildWidgetIndex.bind(this);
            else
                this.onPassFocusToChild = this._findFarestChildWidgetIndex.bind(this);
        }else if(direction == ccui.Widget.UP){
            if (previousWidgetPosition.y < widgetPosition.y)
                this.onPassFocusToChild = this._findNearestChildWidgetIndex.bind(this);
            else
                this.onPassFocusToChild = this._findFarestChildWidgetIndex.bind(this);
        }else
            cc.assert(0, "invalid direction!");
    },

    _findFirstNonLayoutWidget:function(){
        var locChildren = this._children;
        for(var i = 0, len = locChildren.length; i < len; i++) {
            var child = locChildren[i];
            if (child instanceof ccui.Layout){
                var widget = child._findFirstNonLayoutWidget();
                if(widget)
                    return widget;
            } else{
                if (child instanceof cc.Widget)
                    return child;
            }
        }
        return null;
    },

    _findFirstFocusEnabledWidgetIndex: function(){
        var index = 0, locChildren = this.getChildren();
        var count = locChildren.length;
        while (index < count) {
            var w = locChildren[index];
            if (w && w instanceof ccui.Widget && w.isFocusEnabled())
                return index;
            index++;
        }
        //cc.assert(0, "invalid operation");
        return 0;
    },

    _findFocusEnabledChildWidgetByIndex: function(index){
        var widget = this._getChildWidgetByIndex(index);

        if (widget){
            if (widget.isFocusEnabled())
                return widget;
            index = index + 1;
            return this._findFocusEnabledChildWidgetByIndex(index);
        }
        return null;
    },

    _getWorldCenterPoint: function(widget){
        //FIXEDME: we don't need to calculate the content size of layout anymore
        var widgetSize = widget instanceof ccui.Layout ? widget._getLayoutAccumulatedSize() :  widget.getContentSize();
        return widget.convertToWorldSpace(cc.p(widgetSize.width /2, widgetSize.height /2));
    },

    _getNextFocusedWidget: function(direction, current){
        var nextWidget = null, locChildren = this._children;
        var  previousWidgetPos = locChildren.indexOf(current);
        previousWidgetPos = previousWidgetPos + 1;
        if (previousWidgetPos < locChildren.length) {
            nextWidget = this._getChildWidgetByIndex(previousWidgetPos);
            //handle widget
            if (nextWidget) {
                if (nextWidget.isFocusEnabled()) {
                    if (nextWidget instanceof ccui.Layout) {
                        nextWidget._isFocusPassing = true;
                        return nextWidget.findNextFocusedWidget(direction, nextWidget);
                    } else {
                        this.dispatchFocusEvent(current, nextWidget);
                        return nextWidget;
                    }
                } else
                    return this._getNextFocusedWidget(direction, nextWidget);
            } else
                return current;
        } else {
            if (this._loopFocus) {
                if (this._checkFocusEnabledChild()) {
                    previousWidgetPos = 0;
                    nextWidget = this._getChildWidgetByIndex(previousWidgetPos);
                    if (nextWidget.isFocusEnabled()) {
                        if (nextWidget instanceof ccui.Layout) {
                            nextWidget._isFocusPassing = true;
                            return nextWidget.findNextFocusedWidget(direction, nextWidget);
                        } else {
                            this.dispatchFocusEvent(current, nextWidget);
                            return nextWidget;
                        }
                    } else
                        return this._getNextFocusedWidget(direction, nextWidget);
                } else {
                    if (current instanceof ccui.Layout)
                        return current;
                    else
                        return this._focusedWidget;
                }
            } else{
                if (this._isLastWidgetInContainer(current, direction)){
                    if (this._isWidgetAncestorSupportLoopFocus(this, direction))
                        return this.findNextFocusedWidget(direction, this);
                    if (current instanceof ccui.Layout)
                        return current;
                    else
                        return this._focusedWidget;
                } else
                    return this.findNextFocusedWidget(direction, this);
            }
        }
    },

    _getPreviousFocusedWidget: function(direction, current){
        var nextWidget = null, locChildren = this._children;
        var previousWidgetPos = locChildren.indexOf(current);
        previousWidgetPos = previousWidgetPos - 1;
        if (previousWidgetPos >= 0){
            nextWidget = this._getChildWidgetByIndex(previousWidgetPos);
            if (nextWidget.isFocusEnabled()) {
                if (nextWidget instanceof ccui.Layout){
                    nextWidget._isFocusPassing = true;
                    return nextWidget.findNextFocusedWidget(direction, nextWidget);
                }
                this.dispatchFocusEvent(current, nextWidget);
                return nextWidget;
            } else
                //handling the disabled widget, there is no actual focus lose or get, so we don't need any envet
                return this._getPreviousFocusedWidget(direction, nextWidget);
        }else {
            if (this._loopFocus){
                if (this._checkFocusEnabledChild()) {
                    previousWidgetPos = locChildren.length -1;
                    nextWidget = this._getChildWidgetByIndex(previousWidgetPos);
                    if (nextWidget.isFocusEnabled()){
                        if (nextWidget instanceof ccui.Layout){
                            nextWidget._isFocusPassing = true;
                            return nextWidget.findNextFocusedWidget(direction, nextWidget);
                        } else {
                            this.dispatchFocusEvent(current, nextWidget);
                            return nextWidget;
                        }
                    } else
                        return this._getPreviousFocusedWidget(direction, nextWidget);
                } else {
                    if (current instanceof ccui.Layout)
                        return current;
                    else
                        return this._focusedWidget;
                }
            } else {
                if (this._isLastWidgetInContainer(current, direction)) {
                    if (this._isWidgetAncestorSupportLoopFocus(this, direction))
                        return this.findNextFocusedWidget(direction, this);

                    if (current instanceof ccui.Layout)
                        return current;
                    else
                        return this._focusedWidget;
                } else
                    return this.findNextFocusedWidget(direction, this);
            }
        }
    },

    _getChildWidgetByIndex: function (index) {
        var locChildren = this._children;
        var size = locChildren.length;
        var count = 0, oldIndex = index;
        while (index < size) {
            var firstChild = locChildren[index];
            if (firstChild && firstChild instanceof ccui.Widget)
                return firstChild;
            count++;
            index++;
        }

        var begin = 0;
        while (begin < oldIndex) {
            var child = locChildren[begin];
            if (child && child instanceof ccui.Widget)
                return child;
            count++;
            begin++;
        }
        return null;
    },

    _isLastWidgetInContainer:function(widget, direction){
        var parent = widget.getParent();
        if (parent instanceof ccui.Layout)
            return true;

        var container = parent.getChildren();
        var index = container.indexOf(widget);
        if (parent.getLayoutType() == ccui.Layout.LINEAR_HORIZONTAL) {
            if (direction == ccui.Widget.LEFT) {
                if (index == 0)
                    return true * this._isLastWidgetInContainer(parent, direction);
                else
                    return false;
            }
            if (direction == ccui.Widget.RIGHT) {
                if (index == container.length - 1)
                    return true * this._isLastWidgetInContainer(parent, direction);
                else
                    return false;
            }
            if (direction == ccui.Widget.DOWN)
                return this._isLastWidgetInContainer(parent, direction);

            if (direction == ccui.Widget.UP)
                return this._isLastWidgetInContainer(parent, direction);
        } else if(parent.getLayoutType() == ccui.Layout.LINEAR_VERTICAL){
            if (direction == ccui.Widget.UP){
                if (index == 0)
                    return true * this._isLastWidgetInContainer(parent, direction);
                else
                    return false;
            }
            if (direction == ccui.Widget.DOWN) {
                if (index == container.length - 1)
                    return true * this._isLastWidgetInContainer(parent, direction);
                else
                    return false;
            }
            if (direction == ccui.Widget.LEFT)
                return this._isLastWidgetInContainer(parent, direction);

            if (direction == ccui.Widget.RIGHT)
                return this._isLastWidgetInContainer(parent, direction);
        }else {
            cc.assert(0, "invalid layout Type");
            return false;
        }
        return false;
    },

    _isWidgetAncestorSupportLoopFocus: function(widget, direction){
        var parent = widget.getParent();
        if (parent == null)
            return false;
        if (parent.isLoopFocus()) {
            var layoutType = parent.getLayoutType();
            if (layoutType == ccui.Layout.LINEAR_HORIZONTAL) {
                if (direction == ccui.Widget.LEFT || direction == ccui.Widget.RIGHT)
                    return true;
                else
                    return this._isWidgetAncestorSupportLoopFocus(parent, direction);
            }
            if (layoutType == ccui.Layout.LINEAR_VERTICAL){
                if (direction == ccui.Widget.DOWN || direction == ccui.Widget.UP)
                    return true;
                else
                    return this._isWidgetAncestorSupportLoopFocus(parent, direction);
            } else
                cc.assert(0, "invalid layout type");
        } else
            return this._isWidgetAncestorSupportLoopFocus(parent, direction);
    },

    _passFocusToChild: function(direction, current){
        if (this._checkFocusEnabledChild()) {
            var previousWidget = this.getCurrentFocusedWidget();
            this._findProperSearchingFunctor(direction, previousWidget);

            var index = this.onPassFocusToChild(direction, previousWidget);       //TODO need check

            var widget = this._getChildWidgetByIndex(index);
            if (widget instanceof ccui.Layout) {
                widget._isFocusPassing = true;
                return widget.findNextFocusedWidget(direction, widget);
            } else {
                this.dispatchFocusEvent(current, widget);
                return widget;
            }
        }else
            return this;
    },

    _checkFocusEnabledChild: function(){
        var locChildren = this._children;
        for(var i = 0, len = locChildren.length; i < len; i++){
            var widget = locChildren[i];
            if (widget && widget instanceof ccui.Widget && widget.isFocusEnabled())
                return true;
        }
        return false;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Layout";
    },

    createCloneInstance: function () {
        return ccui.Layout.create();
    },

    copyClonedWidgetChildren: function (model) {
        ccui.Widget.prototype.copyClonedWidgetChildren.call(this, model);
    },

    copySpecialProperties: function (layout) {
        this.setBackGroundImageScale9Enabled(layout._backGroundScale9Enabled);
        this.setBackGroundImage(layout._backGroundImageFileName, layout._bgImageTexType);
        this.setBackGroundImageCapInsets(layout._backGroundImageCapInsets);
        this.setBackGroundColorType(layout._colorType);
        this.setBackGroundColor(layout._color);
        this.setBackGroundColor(layout._startColor, layout._endColor);
        this.setBackGroundColorOpacity(layout._opacity);
        this.setBackGroundColorVector(layout._alongVector);
        this.setLayoutType(layout._layoutType);
        this.setClippingEnabled(layout._clippingEnabled);
        this.setClippingType(layout._clippingType);
        this._loopFocus = layout._loopFocus;
        this._passFocusToChild = layout._passFocusToChild;
    }
});
ccui.Layout._init_once = null;
ccui.Layout._visit_once = null;
ccui.Layout._layer = null;
ccui.Layout._sharedCache = null;

if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
    //WebGL
    ccui.Layout.prototype.stencilClippingVisit = ccui.Layout.prototype._stencilClippingVisitForWebGL;
    ccui.Layout.prototype.scissorClippingVisit = ccui.Layout.prototype._scissorClippingVisitForWebGL;
} else {
    ccui.Layout.prototype.stencilClippingVisit = ccui.Layout.prototype._stencilClippingVisitForCanvas;
    ccui.Layout.prototype.scissorClippingVisit = ccui.Layout.prototype._stencilClippingVisitForCanvas;
}
ccui.Layout._getSharedCache = function () {
    return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = cc.newElement("canvas"));
};

var _p = ccui.Layout.prototype;

// Extended properties
/** @expose */
_p.clippingEnabled;
cc.defineGetterSetter(_p, "clippingEnabled", _p.isClippingEnabled, _p.setClippingEnabled);
/** @expose */
_p.clippingType;
cc.defineGetterSetter(_p, "clippingType", null, _p.setClippingType);
/** @expose */
_p.layoutType;
cc.defineGetterSetter(_p, "layoutType", _p.getLayoutType, _p.setLayoutType);

_p = null;

/**
 * allocates and initializes a UILayout.
 * @constructs
 * @return {ccui.Layout}
 * @example
 * // example
 * var uiLayout = ccui.Layout.create();
 */
ccui.Layout.create = function () {
    return new ccui.Layout();
};

// Constants

//layoutBackGround color type
ccui.Layout.BG_COLOR_NONE = 0;
ccui.Layout.BG_COLOR_SOLID = 1;
ccui.Layout.BG_COLOR_GRADIENT = 2;

//Layout type
ccui.Layout.ABSOLUTE = 0;
ccui.Layout.LINEAR_VERTICAL = 1;
ccui.Layout.LINEAR_HORIZONTAL = 2;
ccui.Layout.RELATIVE = 3;

//Layout clipping type
ccui.Layout.CLIPPING_STENCIL = 0;
ccui.Layout.CLIPPING_SCISSOR = 1;

ccui.Layout.BACKGROUND_IMAGE_ZORDER = -2;
ccui.Layout.BACKGROUND_RENDERER_ZORDER = -2;