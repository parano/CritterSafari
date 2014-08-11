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
 * Base class for ccui.LoadingBar
 * @class
 * @extends ccui.Widget
 *
 * @property {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT}   direction   - The progress direction of loadingbar
 * @property {Number}               percent     - The current progress of loadingbar
 */
ccui.LoadingBar = ccui.Widget.extend(/** @lends ccui.LoadingBar# */{
    _direction: null,
    _percent: 100,
    _totalLength: 0,
    _barRenderer: null,
    _renderBarTexType: ccui.Widget.LOCAL_TEXTURE,
    _barRendererTextureSize: null,
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _capInsets: null,
    _textureFile: "",
    _isTextureLoaded: false,
    _className: "LoadingBar",
    _barRendererAdaptDirty: true,

    /**
     * allocates and initializes a UILoadingBar.
     * Constructor of ccui.LoadingBar
     * @example
     * // example
     * var uiLoadingBar = new ccui.LoadingBar;
     */
    ctor: function () {
        this._direction = ccui.LoadingBar.TYPE_LEFT;
        this._barRendererTextureSize = cc.size(0, 0);
        this._capInsets = cc.rect(0, 0, 0, 0);
        ccui.Widget.prototype.ctor.call(this);
    },

    initRenderer: function () {
        this._barRenderer = cc.Sprite.create();
        cc.Node.prototype.addChild.call(this, this._barRenderer, ccui.LoadingBar.RENDERER_ZORDER, -1);
        this._barRenderer.setAnchorPoint(0.0, 0.5);
    },

    /**
     * Changes the progress direction of LoadingBar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @param {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT} dir
     */
    setDirection: function (dir) {
        if (this._direction == dir)
            return;
        this._direction = dir;
        switch (this._direction) {
            case ccui.LoadingBar.TYPE_LEFT:
                this._barRenderer.setAnchorPoint(0.0, 0.5);
                this._barRenderer.setPosition(-this._totalLength * 0.5, 0.0);
                if (!this._scale9Enabled)
                    this._barRenderer.setFlippedX(false);
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
                this._barRenderer.setAnchorPoint(1.0, 0.5);
                this._barRenderer.setPosition(this._totalLength * 0.5, 0.0);
                if (!this._scale9Enabled)
                    this._barRenderer.setFlippedX(true);
                break;
        }
    },

    /**
     * Gets the progress direction of LoadingBar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @returns {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT}
     */
    getDirection: function () {
        return this._direction;
    },

    /**
     * Load texture for LoadingBar.
     * @param {String} texture
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTexture: function (texture, texType) {
        if (!texture)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._renderBarTexType = texType;
        this._textureFile = texture;
        var barRenderer = this._barRenderer;
        switch (this._renderBarTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                if (this._scale9Enabled){
                    barRenderer.initWithFile(texture);
                    barRenderer.setCapInsets(this._capInsets);
                } else
                    barRenderer.setTexture(texture);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                if (this._scale9Enabled) {
                    barRenderer.initWithSpriteFrameName(texture);
                    barRenderer.setCapInsets(this._capInsets);
                } else
                    barRenderer.setSpriteFrame(texture);
                break;
            default:
                break;
        }
        barRenderer.setColor(this.getColor());
        barRenderer.setOpacity(this.getOpacity());
        var bz = barRenderer.getContentSize();
        this._barRendererTextureSize.width = bz.width;
        this._barRendererTextureSize.height = bz.height;

        switch (this._direction) {
            case ccui.LoadingBar.TYPE_LEFT:
                barRenderer.setAnchorPoint(0.0,0.5);
                if (!this._scale9Enabled)
                    barRenderer.setFlippedX(false);
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
                barRenderer.setAnchorPoint(1.0,0.5);
                if (!this._scale9Enabled)
                    barRenderer.setFlippedX(true);
                break;
        }
        this.barRendererScaleChangedWithSize();
        this._updateContentSizeWithTextureSize(this._barRendererTextureSize);
        this._barRendererAdaptDirty = true;
    },

    /**
     * Sets if LoadingBar is using scale9 renderer.
     * @param {Boolean} enabled
     */
    setScale9Enabled: function (enabled) {
        if (this._scale9Enabled == enabled)
            return;
        this._scale9Enabled = enabled;
        this.removeProtectedChild(this._barRenderer);
        this._barRenderer = this._scale9Enabled? cc.Scale9Sprite.create():cc.Sprite.create();
        this.loadTexture(this._textureFile, this._renderBarTexType);
        this.addProtectedChild(this._barRenderer, ccui.LoadingBar.RENDERER_ZORDER, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        } else
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        this.setCapInsets(this._capInsets);
        this.setPercent(this._percent);
    },

    /**
     * Get LoadingBar is using scale9 renderer or not..
     * @returns {Boolean}
     */
    isScale9Enabled: function () {
        return this._scale9Enabled;
    },

    /**
     * Sets capinsets for LoadingBar, if LoadingBar is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this._capInsets = capInsets;
        if (this._scale9Enabled)
            this._barRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets for loadingBar.
     * @returns {cc.Rect}
     */
    getCapInsets: function () {
        return this._capInsets;
    },

    /**
     * The current progress of loadingbar
     * @param {number} percent   percent value from 1 to 100.
     */
    setPercent: function (percent) {
        if (percent < 0 || percent > 100)
            return;
        if (this._totalLength <= 0)
            return;
        this._percent = percent;

        var res = this._percent / 100.0;

        if (this._scale9Enabled)
            this.setScale9Scale();
        else {
            var spriteRenderer = this._barRenderer;
            var rect = spriteRenderer.getTextureRect();
            this._barRenderer.setTextureRect(
                cc.rect(
                    rect.x,
                    rect.y,
                    this._barRendererTextureSize.width * res,
                    this._barRendererTextureSize.height
                )
            );
        }
    },

    /**
     * Gets the progress direction of LoadingBar.
     * @returns {number} percent value from 1 to 100.
     */
    getPercent: function () {
        return this._percent;
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this._barRendererAdaptDirty = true;
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean}ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    getVirtualRendererSize:function(){
        return this._barRendererTextureSize;
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._barRendererTextureSize;
    },
    _getWidth: function () {
        return this._barRendererTextureSize.width;
    },
    _getHeight: function () {
        return this._barRendererTextureSize.height;
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._barRenderer;
    },

    barRendererScaleChangedWithSize: function () {
        var locBarRender = this._barRenderer;
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._totalLength = this._barRendererTextureSize.width;
                locBarRender.setScale(1.0);
            }
        } else {
            this._totalLength = this._size.width;
            if (this._scale9Enabled)
                this.setScale9Scale();
            else {
                var textureSize = this._barRendererTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    locBarRender.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                locBarRender.setScaleX(scaleX);
                locBarRender.setScaleY(scaleY);
            }
        }
        switch (this._direction) {
            case ccui.LoadingBar.TYPE_LEFT:
                locBarRender.setPosition(0, this._contentSize.height * 0.5);
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
                locBarRender.setPosition(this._totalLength, this._contentSize.height * 0.5);
                break;
            default:
                break;
        }
    },

    adaptRenderers: function(){
        if (this._barRendererAdaptDirty){
            this.barRendererScaleChangedWithSize();
            this._barRendererAdaptDirty = false;
        }
    },

    setScale9Scale: function () {
        var width = (this._percent) / 100 * this._totalLength;
        this._barRenderer.setPreferredSize(cc.size(width, this._size.height));
    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._barRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._barRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LoadingBar";
    },

    createCloneInstance: function () {
        return ccui.LoadingBar.create();
    },

    copySpecialProperties: function (loadingBar) {
        if(loadingBar instanceof ccui.LoadingBar){
            this._prevIgnoreSize = loadingBar._prevIgnoreSize;
            this.setScale9Enabled(loadingBar._scale9Enabled);
            this.loadTexture(loadingBar._textureFile, loadingBar._renderBarTexType);
            this.setCapInsets(loadingBar._capInsets);
            this.setPercent(loadingBar._percent);
            this.setDirection(loadingBar._direction);
        }
    }
});

var _p = ccui.LoadingBar.prototype;

// Extended properties
/** @expose */
_p.direction;
cc.defineGetterSetter(_p, "direction", _p.getDirection, _p.setDirection);
/** @expose */
_p.percent;
cc.defineGetterSetter(_p, "percent", _p.getPercent, _p.setPercent);

_p = null;

/**
 * allocates and initializes a UILoadingBar.
 * @param {string} textureName
 * @param {Number} percentage
 * @return {ccui.LoadingBar}
 * @example
 * // example
 * var uiLoadingBar = ccui.LoadingBar.create();
 */
ccui.LoadingBar.create = function (textureName, percentage) {
    var loadingBar = new ccui.LoadingBar();
    if(textureName !== undefined)
        loadingBar.loadTexture(textureName);
    if(percentage !== undefined)
        loadingBar.setPercent(percentage);
    return loadingBar;
};

// Constants
//loadingBar Type
ccui.LoadingBar.TYPE_LEFT = 0;
ccui.LoadingBar.TYPE_RIGHT = 1;

ccui.LoadingBar.RENDERER_ZORDER = -1;