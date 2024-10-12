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
class EmirganceBaseElement extends HTMLElement 
{
    #observer;
    
    constructor() 
    {
        super();
        
        this.attachShadow({ mode: "open" });
        
        var that = this;
        
        this.#observer = new MutationObserver(function(mutations) {
            that.#observer.disconnect();
            that.#attachElements();
         });

        this.#observer.observe(this, {attributes: false, childList: true, characterData: false, subtree: false});
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
        
        this.emirganceInit();
    }
    
    connectedCallback()
    {
        // Load was deferred
        if(this.childNodes.length)
        {
            this.#observer.disconnect();
            this.#attachElements();
        }
    }
    
    emirganceInit()
    {
    }
}
