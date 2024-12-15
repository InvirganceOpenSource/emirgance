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
class EmirganceElement extends HTMLElement
{
    #initialized = false;
    
    constructor() 
    {
        super();
    }
    
    get initialized() { return this.#initialized; };
    set initialized(initialized) { this.#initialized = initialized; };
    
    emirganceInit()
    {
    }
    
    emirganceUpdated(changes)
    {
    }
    
    static autoProperty(name)
    {
        var field = "#" + name;
        
        if(Array.isArray(name))
        {
            for(var item of name) this.autoProperty(item);
            
            return;
        }

        if(this.prototype.hasOwnProperty(name)) return; // Already defined
        
        Object.defineProperty(this.prototype, name, {
            get: function() {
                return this[field];
            },
            set: function(value) {
                if(this[field] === value) return; // No updates
                
                this[field] = value;
                
                if(this.hasAttribute(name) && this.getAttribute(name) !== value) this.setAttribute(name, value);
                if(this.render) this.render();
            }
        });
    }
}

class EmirganceBaseElement extends EmirganceElement 
{
    #observer;
    
    constructor() 
    {
        super();
        
        this.attachShadow({ mode: "open" });
        
        var that = this;
        var prototype = Object.getPrototypeOf(this);
        
        this.#observer = new MutationObserver(function(mutations) {
            
            var nodeChanges = mutations.filter(value => value.type === "childList");
            var attributeChanges = mutations.filter(value => value.type === "attributes");

            if(that.initialized)
            {
                attributeChanges.forEach(function(change) {
                    var value = change.target.getAttribute(change.attributeName);
                    
                    if(prototype.hasOwnProperty(change.attributeName) && value !== change.target[change.attributeName])
                    {
                        change.target[change.attributeName] = value;
                    }
                });
            }
            else if(that.hasAttributes())
            {
                for(var attribute of that.attributes) 
                {
                    if(prototype.hasOwnProperty(attribute.name) && attribute.value !== this[attribute.name])
                    {
                        that[attribute.name] = attribute.value;
                    }
                }
            }
            
            if(!nodeChanges.length) return; // Just dealing with attributes
            
            that.#attachElements();
            
            if(!that.initialized) 
            {
                that.initialized = true;
                that.emirganceInit();
            }
            else 
            {
                that.emirganceUpdated(nodeChanges);
            }
         });

        this.#observer.observe(this, {attributes: true, childList: true});
    }

    #attachElements()
    {
        var that = this;

        if(!this.childNodes.length) return;
        
        // Pull in STYLE and LINK tags
        this.childNodes.forEach(function(element) {
            var nodeName = element.nodeName.toUpperCase();
            var symbols;
            
            if(nodeName === "STYLE" || nodeName === "LINK")
            {
                that.shadowRoot.appendChild(element);
            }
            
            if(nodeName === "SYMBOLS") // TODO: This isn't a great way of handling this
            {
                symbols = document.createElement("svg-symbols");
                
                that.replaceChild(symbols, element);
                symbols.setAttribute("ref", element.getAttribute("ref"));
            }
        });
    }
    
    connectedCallback()
    {
        var prototype = Object.getPrototypeOf(this);
        
        // Load was deferred
        if(!this.initialized)
        {
            this.#attachElements();
        }
        
        if(!this.initialized)
        {
            this.initialized = true;
            
            if(this.hasAttributes())
            {
                for(var attribute of this.attributes)
                {
                    if(prototype.hasOwnProperty(attribute.name) && attribute.value !== this[attribute.name])
                    {
                        this[attribute.name] = attribute.value;
                    }
                }
            }
            
            this.emirganceInit();
        }
    }
    
    disconnectedCallback()
    {
    }
}

class EmirganceStructuralElement extends EmirganceElement 
{
    #observer;
    
    constructor() 
    {
        super();
        
        var that = this;
        var prototype = Object.getPrototypeOf(this);
        
        this.#observer = new MutationObserver(function(mutations) {
            
            var nodeChanges = mutations.filter(value => value.type === "childList");
            var attributeChanges = mutations.filter(value => value.type === "attributes");

            if(that.initialized)
            {
                attributeChanges.forEach(function(change) {
                    var value = change.target.getAttribute(change.attributeName);
                    
                    if(prototype.hasOwnProperty(change.attributeName) && value !== change.target[change.attributeName])
                    {
                        change.target[change.attributeName] = value;
                    }
                });
            }
            else if(that.hasAttributes())
            {
                for(var attribute of that.attributes) 
                {
                    if(prototype.hasOwnProperty(attribute.name) && attribute.value !== this[attribute.name])
                    {
                        that[attribute.name] = attribute.value;
                    }
                }
            }
            
            if(!nodeChanges.length) return; // Just dealing with attributes
            
            if(!that.initialized) 
            {
                that.initialized = true;
                that.emirganceInit();
            }
            else 
            {
                that.emirganceUpdated(nodeChanges);
            }
         });

        this.#observer.observe(this, {attributes: true, childList: true});
    }
    
    connectedCallback()
    {
        // Load was deferred
        if(!this.initialized)
        {
            this.initialized = true;
            
            this.emirganceInit();
        }
    }
}