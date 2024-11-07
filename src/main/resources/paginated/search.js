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

class PaginatedTableSearch extends EmirganceBaseElement 
{
    static observedAttributes = ["table", "placeholder", "name", "keys"];
    
    #top;
    #table;
    
    #timer = null;
    #placeholder = "Search...";
    #filterName = "search";
    #keys = [];
    
    constructor() 
    {
        super();
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(name === "table") this.table(newValue);
        if(name === "placeholder") this.placeholder(newValue);
        if(name === "name") this.filterName(newValue);
        if(name === "keys") this.keys(newValue);
    }
    
    emirganceInit()
    {
        this.#top = document.createElement("div");
        
        this.#top.classList.add("search");

        this.shadowRoot.appendChild(this.#top);
        this.render();
    }
    
    placeholder(text)
    {
        if(text)
        {
            this.#placeholder = text;
            this.render();
            
            return this;
        }
        
        return this.#placeholder;
    }
    
    filterName(name)
    {
        if(name)
        {
            // TODO: Should we undo the exsting filter?
            this.#filterName = name;
            this.render();
            
            return this;
        }
        
        return this.#filterName;
    }
    
    keys(keys)
    {
        if(keys)
        {
            if(typeof keys === "string")
            {
                this.#keys = keys.split(',');

                for(var i=0; i<this.#keys.length; i++)
                {
                    this.#keys[i] = this.#keys[i].trim();
                }
            }
            else if(Array.isArray(keys))
            {
                this.#keys = keys;
            }
            
            return this;
        }
        
        return this.#keys;
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
            
            this.#table = table;
            
            return this;
        }
        
        return this.#table;
    }
    
    render()
    {
        var that = this;
        var input = document.createElement("input");
        
        // We're not yet attached
        if(!this.#top) return;
        
        function trigger()
        {
            if(that.#timer !== null) clearTimeout(that.#timer);
            
            that.#timer = setTimeout(function () {
                var value = input.value.trim().toUpperCase();
                
                that.#timer = null;
                
                if(!value)
                {
                    that.#table.filter(that.#filterName); // Remove filter
                    return;
                }
                
                if(that.#keys.length < 1)
                {
                    that.#keys = that.#table.columns();
                }
                
                that.#table.filter(that.#filterName, function(record) {
                    var key;
                    var match = false;
                    
                    for(var i=0; i<that.#keys.length; i++)
                    {
                        key = that.#keys[i];
                        match = record[key] && String(record[key]).toUpperCase().includes(value);

                        if(match) return true;
                    }
                    
                    return false;
                });
            }, 250);
        }
        
        input.setAttribute("placeholder", this.#placeholder);
        input.onkeyup = trigger;
        input.onchange = trigger;
        
        this.#top.replaceChildren(input);
    }
}

customElements.define("paginated-search", PaginatedTableSearch);