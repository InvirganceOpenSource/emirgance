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

class PaginatedTableDisplay extends EmirganceBaseElement 
{
    static observedAttributes = ["table"];
    
    #top;
    #table;
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(name === "table") this.table(newValue);
    }
    
    emirganceInit()
    {
        this.#top = document.createElement("div");
        
        this.#top.classList.add("display");
        
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
        var pages = this.#table.pages();
        var current = this.#table.page() + 1;
        var format = Intl.NumberFormat();
        
        if(!this.#top) return;
        
        this.#top.textContent = "Page " + format.format(current) + " of " + format.format(pages);
    }
}

customElements.define("paginated-display", PaginatedTableDisplay);
