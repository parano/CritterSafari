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
 * Base class for ccui.Slider
 * @class
 * @extends ccui.Widget
 *
 * @property {Number}   percent     - The current progress of loadingbar
 */
ccui.Slider = ccui.Widget.extend(/** @lends ccui.Slider# */{
    _barRenderer: null,
    _progressBarRenderer: null,
    _progressBarTextureSize: null,
    _slidBallNormalRenderer: null,
    _slidBallPressedRenderer: null,
    _slidBallDisabledRenderer: null,
    _slidBallRenderer: null,
    _barLength: 0,
    _percent: 0,
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _textureFile: "",
    _progressBarTextureFile: "",
    _slidBallNormalTextureFile: "",
    _slidBallPressedTextureFile: "",
    _slidBallDisabledTextureFile: "",
    _capInsetsBarRenderer: null,
    _capInsetsProgressBarRenderer: null,
    _sliderEventListener: null,
    _sliderEventSelector: null,
    _barTexType: ccui.Widget.LOCAL_TEXTURE,
    _progressBarTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballNTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballPTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballDTexType: ccui.Widget.LOCAL_TEXTURE,
    _isTextureLoaded: false,
    _className: "Slider",
    _barRendererAdaptDirty: true,
    _progressBarRendererDirty: true,
    /**
     * allocates and initializes a UISlider.
     * Constructor of ccui.Slider
     * @example
     * // example
     * var uiSlider = new ccui.Slider();
     */
    ctor: function () {
        this._progressBarTextureSize = cc.size(0, 0);
        this._capInsetsBarRenderer = cc.rect(0, 0, 0, 0);
        this._capInsetsProgressBarRenderer = cc.rect(0, 0, 0, 0);
        ccui.Widget.prototype.ctor.call(this);
    },

    init: function () {
        if (ccui.Widget.prototype.init.call(this)) {
//            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._barRenderer = cc.Sprite.create();
        this._progressBarRenderer = cc.Sprite.create();
        this._progressBarRenderer.setAnchorPoint(0.0, 0.5);
        this.addProtectedChild(this._barRenderer, ccui.Slider.BASEBAR_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._progressBarRenderer, ccui.Slider.PROGRESSBAR_RENDERER_ZORDER, -1);
        this._slidBallNormalRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer = cc.Sprite.create();
        this._slidBallDisabledRenderer.setVisible(false);
        this._slidBallRenderer = cc.Node.create();
        this._slidBallRenderer.addChild(this._slidBallNormalRenderer);
        this._slidBallRenderer.addChild(this._slidBallPressedRenderer);
        this._slidBallRenderer.addChild(this._slidBallDisabledRenderer);
        this.addProtectedChild(this._slidBallRenderer, ccui.Slider.BALL_RENDERER_ZORDER, -1);
    },

    /**
     * Load texture for slider bar.
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._textureFile = fileName;
        this._barTexType = texType;
        var barRenderer = this._barRenderer;
        switch (this._barTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                if (this._scale9Enabled)
                {
                    barRenderer.initWithFile(fileName);
                }
                else
                {
                    barRenderer.setTexture(fileName);
                }
                break;
            case ccui.Widget.PLIST_TEXTURE:
                if (this._scale9Enabled)
                {
                    barRenderer.initWithSpriteFrameName(fileName);
                }
                else
                {
                    barRenderer.setSpriteFrame(fileName);
                }

                break;
            default:
                break;
        }
        barRenderer.setColor(this.getColor());
        barRenderer.setOpacity(this.getOpacity());


        this._barRendererAdaptDirty = true;
        this._progressBarRendererDirty = true;
        this._updateContentSizeWithTextureSize(this._barRenderer.getContentSize());
    },

    /**
     * Load dark state texture for slider progress bar.
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadProgressBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._progressBarTextureFile = fileName;
        this._progressBarTexType = texType;
        var progressBarRenderer = this._progressBarRenderer;
        switch (this._progressBarTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                if (this._scale9Enabled)
                {
                    progressBarRenderer.initWithFile(fileName);
                }
                else
                {
                    progressBarRenderer.setTexture(fileName);
                }
                break;
            case ccui.Widget.PLIST_TEXTURE:
                if (this._scale9Enabled)
                {
                    progressBarRenderer.initWithSpriteFrameName(fileName);
                }
                else
                {
                    progressBarRenderer.setSpriteFrame(fileName);
                }
                break;
            default:
                break;
        }
        this._progressBarRenderer.setColor(this.getColor());
        this._progressBarRenderer.setOpacity(this.getOpacity());

        this._progressBarRenderer.setAnchorPoint(cc.p(0, 0.5));
        var tz = this._progressBarRenderer.getContentSize();
        this._progressBarTextureSize = {width: tz.width, height: tz.height};
        this._progressBarRendererDirty = true;
    },

    /**
     * Sets if slider is using scale9 renderer.
     * @param {Boolean} able
     */
    setScale9Enabled: function (able) {
        if (this._scale9Enabled == able) {
            return;
        }

        this._scale9Enabled = able;
        this.removeProtectedChild(this._barRenderer, true);
        this.removeProtectedChild(this._progressBarRenderer, true);
        this._barRenderer = null;
        this._progressBarRenderer = null;
        if (this._scale9Enabled) {
            this._barRenderer = cc.Scale9Sprite.create();
            this._progressBarRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._barRenderer = cc.Sprite.create();
            this._progressBarRenderer = cc.Sprite.create();
        }
        this.loadBarTexture(this._textureFile, this._barTexType);
        this.loadProgressBarTexture(this._progressBarTextureFile, this._progressBarTexType);
        this.addProtectedChild(this._barRenderer, ccui.Slider.BASEBAR_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._progressBarRenderer, ccui.Slider.PROGRESSBAR_RENDERER_ZORDER, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsetsBarRenderer(this._capInsetsBarRenderer);
        this.setCapInsetProgressBarRenderer(this._capInsetsProgressBarRenderer);
    },

    /**
     * Get  slider is using scale9 renderer or not.
     * @returns {Boolean}
     */
    isScale9Enabled: function () {
        return this._scale9Enabled;
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this.setCapInsetsBarRenderer(capInsets);
        this.setCapInsetProgressBarRenderer(capInsets);
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsBarRenderer: function (capInsets) {
        this._capInsetsBarRenderer = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._barRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets for slider.
     * @returns {cc.Rect}
     */
    getCapInsetsBarRenderer: function () {
        return this._capInsetsBarRenderer;
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetProgressBarRenderer: function (capInsets) {
        this._capInsetsProgressBarRenderer = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._progressBarRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets for slider.
     * @returns {cc.Rect}
     */
    getCapInsetsProgressBarRebderer: function () {
        return this._capInsetsProgressBarRenderer;
    },

    /**
     * Load textures for slider ball.
     * @param {String} normal
     * @param {String} pressed
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextures: function (normal, pressed, disabled, texType) {
        this.loadSlidBallTextureNormal(normal, texType);
        this.loadSlidBallTexturePressed(pressed, texType);
        this.loadSlidBallTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for slider ball.
     * @param {String} normal
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextureNormal: function (normal, texType) {
        if (!normal) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallNormalTextureFile = normal;
        this._ballNTexType = texType;
        switch (this._ballNTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
//                this._slidBallNormalRenderer.initWithFile(normal);
                this._slidBallNormalRenderer.setTexture(normal);
                break;
            case ccui.Widget.PLIST_TEXTURE:
//                this._slidBallNormalRenderer.initWithSpriteFrameName(normal);
                this._slidBallNormalRenderer.setSpriteFrame(normal);
                break;
            default:
                break;
        }
//        this.updateColorToRenderer(this._slidBallNormalRenderer);
        this._slidBallNormalRenderer.setColor(this.getColor());
        this._slidBallNormalRenderer.setOpacity(this.getOpacity());
    },

    /**
     * Load selected state texture for slider ball.
     * @param {String} pressed
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTexturePressed: function (pressed, texType) {
        if (!pressed) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallPressedTextureFile = pressed;
        this._ballPTexType = texType;
        switch (this._ballPTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
//                this._slidBallPressedRenderer.initWithFile(pressed);
                this._slidBallPressedRenderer.setTexture(pressed);
                break;
            case ccui.Widget.PLIST_TEXTURE:
//                this._slidBallPressedRenderer.initWithSpriteFrameName(pressed);
                this._slidBallPressedRenderer.setSpriteFrame(pressed);
                break;
            default:
                break;
        }
//        this.updateColorToRenderer(this._slidBallPressedRenderer);
        this._slidBallPressedRenderer.setColor(this.getColor());
        this._slidBallPressedRenderer.setOpacity(this.getOpacity());
    },

    /**
     * Load dark state texture for slider ball.
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextureDisabled: function (disabled, texType) {
        if (!disabled) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallDisabledTextureFile = disabled;
        this._ballDTexType = texType;
        switch (this._ballDTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
//                this._slidBallDisabledRenderer.initWithFile(disabled);
                this._slidBallDisabledRenderer.setTexture(disabled);
                break;
            case ccui.Widget.PLIST_TEXTURE:
//                this._slidBallDisabledRenderer.initWithSpriteFrameName(disabled);
                this._slidBallDisabledRenderer.setSpriteFrame(disabled);
                break;
            default:
                break;
        }
//        this.updateColorToRenderer(this._slidBallDisabledRenderer);
        this._slidBallDisabledRenderer.setColor(this.getColor());
        this._slidBallDisabledRenderer.setOpacity(this.getOpacity());
    },

    /**
     * Changes the progress direction of slider.
     * @param {number} percent
     */
    setPercent: function (percent) {
        if (percent > 100) {
            percent = 100;
        }
        if (percent < 0) {
            percent = 0;
        }
        this._percent = percent;
        var res = percent / 100.0;
        var dis = this._barLength * res;
//        this._slidBallRenderer.setPosition(-this._barLength / 2.0 + dis, 0.0);
        this._slidBallRenderer.setPosition(cc.p(dis, this._contentSize.height / 2));
        if (this._scale9Enabled) {
            this._progressBarRenderer.setPreferredSize(cc.size(dis, this._progressBarTextureSize.height));
        }
        else {
            var spriteRenderer = this._progressBarRenderer;
            var rect = spriteRenderer.getTextureRect();
            spriteRenderer.setTextureRect(
                cc.rect(rect.x, rect.y, dis, rect.height),
                spriteRenderer.isTextureRectRotated()
            );
        }
    },

    hitTest: function(pt){
        var nsp = this._slidBallNormalRenderer.convertToNodeSpace(pt);
        var ballSize = this._slidBallNormalRenderer.getContentSize();
        var ballRect = cc.rect(0,0, ballSize.width, ballSize.height);
        return cc.rectContainsPoint(ballRect, nsp);
    },

    onTouchBegan: function (touch, event) {
        var pass = ccui.Widget.prototype.onTouchBegan.call(this, touch, event);
        if (this._hitted) {
            var nsp = this.convertToNodeSpace(this._touchBeganPosition);
            this.setPercent(this.getPercentWithBallPos(nsp.x));
            this.percentChangedEvent();
        }
        return pass;
    },

    onTouchMoved: function (touch, event) {
        var touchPoint = touch.getLocation();
//        this._touchMovePosition.x = touchPoint.x;
//        this._touchMovePosition.y = touchPoint.y;
        var nsp = this.convertToNodeSpace(touchPoint);
//        this._slidBallRenderer.setPosition(nsp.x, 0);
        this.setPercent(this.getPercentWithBallPos(nsp.x));
        this.percentChangedEvent();
    },

    onTouchEnded: function (touch, event) {
        ccui.Widget.prototype.onTouchEnded.call(this, touch, event);
    },

    onTouchCancelled: function (touch, event) {
        ccui.Widget.prototype.onTouchCancelled.call(this, touch, event);
    },

    /**
     * get percent with ballPos
     * @param {cc.Point} px
     * @returns {number}
     */
    getPercentWithBallPos: function (px) {
        return ((px/this._barLength)*100);
    },

    /**
     * add event listener
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerSlider: function (selector, target) {
        this._sliderEventSelector = selector;
        this._sliderEventListener = target;
    },

    addEventListener: function(callback){
        this._eventCallback = callback;
    },

    percentChangedEvent: function () {
        if (this._sliderEventListener && this._sliderEventSelector) {
            this._sliderEventSelector.call(this._sliderEventListener, this, ccui.Slider.EVENT_PERCENT_CHANGED);
        }
        if (this._eventCallback) {
            this._eventCallback(ccui.Slider.EVENT_PERCENT_CHANGED);
        }
    },

    /**
     * Gets the progress direction of slider.
     * @returns {number}
     */
    getPercent: function () {
        return this._percent;
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
//        this.barRendererScaleChangedWithSize();
//        this.progressBarRendererScaleChangedWithSize();
        this._barRendererAdaptDirty = true;
        this._progressBarRendererDirty = true;
    },

    adaptRenderers: function(){
        if (this._barRendererAdaptDirty)
        {
            this.barRendererScaleChangedWithSize();
            this._barRendererAdaptDirty = false;
        }
        if (this._progressBarRendererDirty)
        {
            this.progressBarRendererScaleChangedWithSize();
            this._progressBarRendererDirty = false;
        }

    },

    getVirtualRendererSize: function(){
        return this._barRenderer.getContentSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._barRenderer;
    },

    barRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._barRenderer.setScale(1.0);
//            var locSize = this._barRenderer.getContentSize();
//            this._size.width = locSize.width;
//            this._size.height = locSize.height;
            this._barLength = this._contentSize.width;
        }
        else {
//            this._barLength = this._size.width;
            this._barLength = this._contentSize.width;
            if (this._scale9Enabled) {
//                this._barRenderer.setPreferredSize(cc.size(this._size.width, this._size.height));
                this._barRenderer.setPreferredSize(this._contentSize);
            }
            else {
                var btextureSize = this._barRenderer.getContentSize();
                if (btextureSize.width <= 0.0 || btextureSize.height <= 0.0) {
                    this._barRenderer.setScale(1.0);
                    return;
                }
                var bscaleX = this._contentSize.width / btextureSize.width;
                var bscaleY = this._contentSize.height / btextureSize.height;
                this._barRenderer.setScaleX(bscaleX);
                this._barRenderer.setScaleY(bscaleY);
            }
        }
        this._barRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
        this.setPercent(this._percent);
    },

    progressBarRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                var ptextureSize = this._progressBarTextureSize;
                var pscaleX = this._contentSize.width / ptextureSize.width;
                var pscaleY = this._contentSize.height / ptextureSize.height;
                this._progressBarRenderer.setScaleX(pscaleX);
                this._progressBarRenderer.setScaleY(pscaleY);
            }
        }
        else {
            if (this._scale9Enabled) {
//                this._progressBarRenderer.setPreferredSize(cc.size(this._size.width, this._size.height));
                this._progressBarRenderer.setPreferredSize(this._contentSize);
                this._progressBarTextureSize = this._progressBarRenderer.getContentSize();
            }
            else {
                var ptextureSize = this._progressBarTextureSize;
                if (ptextureSize.width <= 0.0 || ptextureSize.height <= 0.0) {
                    this._progressBarRenderer.setScale(1.0);
                    return;
                }
                var pscaleX = this._contentSize.width / ptextureSize.width;
                var pscaleY = this._contentSize.height / ptextureSize.height;
                this._progressBarRenderer.setScaleX(pscaleX);
                this._progressBarRenderer.setScaleY(pscaleY);
            }
        }
        this._progressBarRenderer.setPosition(0.0, this._contentSize.height / 2.0);
        this.setPercent(this._percent);
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        var locContentSize = this._barRenderer.getContentSize();
        return cc.size(locContentSize.width, locContentSize.height);
    },
    _getWidth: function () {
        return this._barRenderer._getWidth();
    },
    _getHeight: function () {
        return this._barRenderer._getHeight();
    },

    onPressStateChangedToNormal: function () {
        this._slidBallNormalRenderer.setVisible(true);
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToPressed: function () {
        this._slidBallNormalRenderer.setVisible(false);
        this._slidBallPressedRenderer.setVisible(true);
        this._slidBallDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToDisabled: function () {
        this._slidBallNormalRenderer.setVisible(false);
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer.setVisible(true);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Slider";
    },

    createCloneInstance: function () {
        return ccui.Slider.create();
    },

    copySpecialProperties: function (slider) {
        this._prevIgnoreSize = slider._prevIgnoreSize;
        this.setScale9Enabled(slider._scale9Enabled);
        this.loadBarTexture(slider._textureFile, slider._barTexType);
        this.loadProgressBarTexture(slider._progressBarTextureFile, slider._progressBarTexType);
        this.loadSlidBallTextureNormal(slider._slidBallNormalTextureFile, slider._ballNTexType);
        this.loadSlidBallTexturePressed(slider._slidBallPressedTextureFile, slider._ballPTexType);
        this.loadSlidBallTextureDisabled(slider._slidBallDisabledTextureFile, slider._ballDTexType);
        this.setPercent(slider.getPercent());
        this._sliderEventListener = slider._sliderEventListener;
        this._sliderEventSelector = slider._sliderEventSelector;
        this._eventCallback = slider._eventCallback;

    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._barRenderer);
        this.updateColorToRenderer(this._progressBarRenderer);
        this.updateColorToRenderer(this._slidBallNormalRenderer);
        this.updateColorToRenderer(this._slidBallPressedRenderer);
        this.updateColorToRenderer(this._slidBallDisabledRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._barRenderer);
        this.updateOpacityToRenderer(this._progressBarRenderer);
        this.updateOpacityToRenderer(this._slidBallNormalRenderer);
        this.updateOpacityToRenderer(this._slidBallPressedRenderer);
        this.updateOpacityToRenderer(this._slidBallDisabledRenderer);
    }
});

var _p = ccui.Slider.prototype;

// Extended properties
/** @expose */
_p.percent;
cc.defineGetterSetter(_p, "percent", _p.getPercent, _p.setPercent);

_p = null;

/**
 * allocates and initializes a UISlider.
 * @constructs
 * @return {ccui.Slider}
 * @example
 * // example
 * var uiSlider = ccui.Slider.create();
 */
ccui.Slider.create = function () {
    var widget = new ccui.Slider();
    if (widget && widget.init())
    {
        return widget;
    }
    return null;
};

// Constant
//Slider event type
ccui.Slider.EVENT_PERCENT_CHANGED = 0;

//Render zorder
ccui.Slider.BASEBAR_RENDERER_ZORDER = -3;
ccui.Slider.PROGRESSBAR_RENDERER_ZORDER = -2;
ccui.Slider.BALL_RENDERER_ZORDER = -1;