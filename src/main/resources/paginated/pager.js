/* 
 * Copyright 2024 INVIRGANCE LLC
 
 Permission is hereby granted, free of charge, to any person obtaining a copy 
 of this software and associated documentation files (the “Software”), to deal 
 in the Software without restriction, including without limitation the rights to 
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
 of the Software, and to permit persons to whom the Software is furnished to do 
 so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all 
 copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 SOFTWARE.
 */

class PaginatedTablePager extends EmirganceBaseElement 
{
    static observedAttributes = ["table"];
    
    #top;
    #table;
    #pages = 10;
    
    #focusPage = null;
    #focusElement = null;
    
    constructor() 
    {
        super();
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(name === "table") this.table(newValue);
    }
    
    emirganceInit()
    {
        this.#top = document.createElement("div");
        
        this.#top.classList.add("pager");
        
        this.shadowRoot.appendChild(this.#top);
    }
    
    table(table)
    {
        if(table) 
        {
            // FIX ME: Will this work in more complex layouts with custom
            //         elements in custom elements?
            if(!(table instanceof HTMLElement))
            {
                table = document.querySelector(table);
            }
            
            if(this.#table) this.#table.unregister(this);
            
            this.#table = table;
            
            this.#table.register(this);
            
            return this;
        }
        
        return this.#table;
    }
    
    render()
    {
        var that = this;
        var pages = Math.min(this.#pages, this.#table.pages());
        var selected = this.#table.page();
        var total = this.#table.pages();
        var start = Math.min(Math.max(0, total-this.#pages), Math.max(0, selected - Math.floor(this.#pages / 2) + 1));
        
        var format = new Intl.NumberFormat();
        var number;
        
        var first = document.createElement("div");
        var previous = document.createElement("div");
        var numbers = document.createElement("div");
        var next = document.createElement("div");
        var last = document.createElement("div");
        
        
        first.classList.add("control", "first");
        previous.classList.add("control", "previous");
        numbers.classList.add("numbers");
        next.classList.add("control", "next");
        last.classList.add("control", "last");
        
        // We're not yet attached
        if(!this.#top) return;
        
        numbers.setAttribute("role", "navigation");
        
        first.innerHTML = "&laquo;";
        previous.innerHTML = "&lsaquo;";
        
        for(var i=0; i<pages && start+i<total; i++)
        {
            number = document.createElement("div");
            
            number.setAttribute("tabindex", "0");
            number.setAttribute("aria-label", "Page " + (i+1));
            number.classList.add("number");
            number.innerText = format.format(start+i+1);
            
            if(i === this.#focusPage) this.#focusElement = number;
            if(i === selected) number.setAttribute("aria-current", "true");
            
            number.onclick = function(page) { 
                return function() { that.table().page(page); };
            }(start+i);
            
            number.onkeydown = function(event) {
                if(event.keyCode === 13) this.click();
                
                if(event.keyCode === 35)
                {
                    that.#focusPage = (that.#focusPage !== null) ? that.table().pages()-1 : null;
                    that.#focusElement = null;
                    
                    last.click();
                }
                
                if(event.keyCode === 36)
                {
                    that.#focusPage = (that.#focusPage !== null) ? 0 : null;
                    that.#focusElement = null;
                    
                    first.click();
                }
                
                if(event.keyCode === 37) 
                {
                    that.#focusPage = (that.#focusPage !== null) ? Math.max(that.#focusPage-1, 0) : null;
                    that.#focusElement = null;
                    
                    previous.click();
                }
                
                if(event.keyCode === 39) 
                {
                    that.#focusPage = (that.#focusPage !== null) ? Math.min(that.#focusPage+1, that.table().pages()-1) : null;
                    that.#focusElement = null;
                    
                    next.click();
                }
            };
            
            number.onfocusin = function(number) {
                return function() {
                    that.#focusPage = number;
                };
            }(i);
            
            number.onfocusout = function() {
                that.#focusPage = null;
                that.#focusElement = null;
            };
            
            numbers.appendChild(number);
        }

        next.innerHTML = "&rsaquo;";
        last.innerHTML = "&raquo;";
        
        first.onclick = function() { that.table().first(); };
        previous.onclick = function() { that.table().previous(); };
        next.onclick = function() { that.table().next(); };
        last.onclick = function() { that.table().last(); };
        
        this.#top.replaceChildren();
        this.#top.appendChild(first);
        this.#top.appendChild(previous);
        this.#top.appendChild(numbers);
        this.#top.appendChild(next);
        this.#top.appendChild(last);
        
        if(this.#focusElement) this.#focusElement.focus();
    }
}

customElements.define("paginated-pager", PaginatedTablePager);