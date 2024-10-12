/* 
 * The MIT License
 *
 * Copyright 2024 jbanes.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

class SVGSymbols extends HTMLElement
{
    static observedAttributes = ["href", "ref"];
    static collections = {};
    
    #href;
    #prefix;
    #ref;
    
    #shadow;
    #names = [];
    #callbacks = [];
    
    constructor() 
    {
        super();
    }
    
    #isShadow()
    {
        var check = this.parentNode;
        
        while(check && !(check instanceof ShadowRoot) && !check.shadowRoot) check = check.parentNode;
        
        return (check instanceof ShadowRoot) ? check : check.shadowRoot;
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        var that = this;
        var container;
        var image;
        
        if(name === "href") this.#href = newValue;
        if(name === "ref") this.#ref = newValue.replace('#', '');
        
        if(this.id)
        {
            this.#prefix = this.id;
            SVGSymbols.collections[this.id] = this;
        }
        
        if(this.#prefix && this.#href)
        {
            image = document.createElement("img");
            
            this.style.display = "none";
            image.src = this.#href;
            
            this.appendChild(image);
            
            
            (async function() {
                var response = await fetch(that.#href);
                var svg = await response.text();
                var fragment = document.createElement("div");

                fragment.innerHTML = svg;
                
                fragment.querySelectorAll("symbol").forEach(function (element) {
                    if(element.id) 
                    {
                        that.names.push(element.id);
                        element.id = that.#prefix + "-" + element.id;
                    }
                });

                that.replaceChildren(fragment.children[0]);
                
                that.#callbacks.forEach(function(callback) {
                    callback(that);
                });
                
            })();
        }
        
        if(this.#ref)
        {
            this.#shadow = this.#isShadow();
            
            if(this.#shadow)
            {
                SVGSymbols.collections[this.#ref].registerCallback(function() {
                    
                    container = document.createElement("div");
                    container.innerHTML = SVGSymbols.collections[that.#ref].svg;
                    container.childNodes[0].style.display = "none";
                    
                    if(that.#shadow.childNodes.length) 
                    {
                        that.#shadow.insertBefore(container.children[0], that.#shadow.childNodes[0]);
                    }
                    else 
                    {
                        that.#shadow.appendChild(container.children[0]);
                    }
                });
            }
        }
    }
    
    getIcon(name, width, height)
    {
        if(this.#ref) return SVGSymbols.collections[this.#ref].getIcon(name, width, height);
        
        var svgns = "http://www.w3.org/2000/svg";
        var xlinkns = "http://www.w3.org/1999/xlink";
        
        var svg = document.createElementNS(svgns, "svg");
        var that = this;
        
        if(width) svg.style.width = width;
        if(height || width) svg.style.height = (height || width);
        
        this.registerCallback(function() {
            var use = document.createElementNS(svgns, "use");
            
            use.setAttributeNS(xlinkns, "href", "#" + that.#prefix + "-" + name);
            svg.appendChild(use);
        });
        
        return svg;
    }
    
    get href()
    {
        if(this.#ref) 
        {
            return SVGSymbols.collections[this.#ref].href;
        }
        
        return this.#href;
    }
    
    get prefix()
    {
        if(this.#ref) 
        {
            return SVGSymbols.collections[this.#ref].href;
        }
        
        return this.#prefix;
    }
    
    get names()
    {
        if(this.#ref) 
        {
            return SVGSymbols.collections[this.#ref].names;
        }
        
        return this.#names;
    }
    
    get svg()
    {
        if(this.#ref) 
        {
            return SVGSymbols.collections[this.#ref].innerHTML;
        }
        
        return this.innerHTML;
    }
    
    registerCallback(callback)
    {
        this.#callbacks.push(callback);
        
        if(this.childNodes.length && this.childNodes[0].nodeName.toUpperCase() === "SVG")
        {
            callback();
        }
    }
}

customElements.define("svg-symbols", SVGSymbols);
