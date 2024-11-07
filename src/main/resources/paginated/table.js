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

class PaginatedTable extends EmirganceBaseElement 
{
    static observedAttributes = ["page-size", "page"];
    
    static defaultRenderers = {
        "string": function(element, column, value, record) {

            var a;
            var link;
            
            if(column.href)
            {
                a = document.createElement("a");
                link = column.href;
                
                Object.keys(record).forEach(function(key) {
                    link = link.replaceAll("{" + key + "}", record[key]);
                });
                
                a.setAttribute("href", link);
                a.innerText = (value || value === false || value === 0) ? value : "";
                
                element.appendChild(a);
                
                return;
            }
            
            element.innerText = (value || value === false || value === 0) ? value : "";
        },
        "number": function(element, column, value, record) {
            
            value = new Intl.NumberFormat().format(value);

            PaginatedTable.defaultRenderers.string(element, column, value, record);
        },
        "money": function(element, column, value, record) {
            
            value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            
            PaginatedTable.defaultRenderers.string(element, column, value, record);
        },
        "centered": function(element, column, value, record) {
            
            PaginatedTable.defaultRenderers.string(element, column, value, record);
        }
    };
    
    #table;
    #thead;
    #tbody;
    
    #columns = [];
    #records = [];
    #sorted = [];
    #filtered = [];
    
    #filters = {};
    #pagers = [];
    #pageSize = 10;
    #page = 0;
    
    #sortBy;
    #sortReversed = false;
    
    #disableCallback = false;
    
    constructor() 
    {
        super();
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if(this.#disableCallback) return;
        if(name === "page") this.page(parseInt(newValue)-1);
        if(name === "page-size") this.pageSize(parseInt(newValue));
    }
    
    emirganceInit()
    {
        var columns = [];
        var tr;
        
        this.#table = document.createElement("table");
        this.#thead = document.createElement("thead");
        this.#tbody = document.createElement("tbody");
        
        this.#table.style.width = "100%";
        
        this.childNodes.forEach(function(element) {
            var index = 0;
            
            if(element.nodeName === "LINK")
            {
                this.shadowRoot.appendChild(element);
            }
            
            if(element.nodeName === "COLUMNS")
            {
                columns = [];
                
                element.childNodes.forEach(function(element) {
                    
                    if(element.nodeName !== "COLUMN") return;
                    
                    var key = element.attributes["key"] && element.attributes["key"].nodeValue.trim() || element.innerText.trim();
                    var type = element.attributes["type"] && element.attributes["type"].nodeValue.trim().toLowerCase() || "string";
                    var sortable = (!element.attributes["sortable"] || true) || (element.attributes["sortable"] && (element.attributes["sortable"].nodeValue.trim().toLowerCase() === "true"));
                    
                    columns[index++] = {
                        "key": key,
                        "name": element.innerText,
                        "type": type,
                        "element": element,
                        "sortable": sortable,
                        "renderer": PaginatedTable.defaultRenderers[type],
                        "href": element.attributes["href"] && element.attributes["href"].nodeValue || null
                    };
                });
            }
        });
        
        this.#columns = columns;
        
        this.#table.appendChild(this.#thead);
        this.#table.appendChild(this.#tbody);
        this.shadowRoot.appendChild(this.#table);
        
        this.#filter();
        this.#renderHeader();
        this.render();
    }
    
    #renderHeader()
    {
        var tr = document.createElement("tr");
        var that = this;
        
        this.#columns.forEach(function(column, index) {
            var th = document.createElement("th");
            var span;
            
            th.innerText = column.name;
            th.classList.add(column.type);
            tr.appendChild(th);
            
            if(column.sortable)
            {
                th.classList.add("sortable");
                th.onclick = function() {
                    that.sort(column.key, (column.key === that.#sortBy) ? !that.#sortReversed : that.#sortReversed);
                };
            }
            
            if(that.#sortBy && column.key === that.#sortBy)
            {
                span = document.createElement("span");
                
                span.classList.add("arrow");
                span.innerHTML = that.#sortReversed ? "&#x25BC;" : "&#x25B2;";
                
                th.appendChild(span);
            }
        });
        
        this.#thead.replaceChildren(tr);
    }
    
    #attribute(name, value)
    {
        if(!this.attributes[name]) return;
        
        this.#disableCallback = true;
        
        if(this.attributes[name].nodeValue != value) 
        {
            this.attributes[name].nodeValue = value;
        }
        
        this.#disableCallback = false;
    }
    
    #filter() 
    {
        var filtered = [];
        var that = this;
        
        this.#sorted.forEach(function(record) {
            
            for(const [key, filter] of Object.entries(that.#filters))
            {
                if(!filter(record)) return;
            }

            filtered.push(record);
        });

        this.#filtered = filtered;
    }
    
    columns()
    {
        var keys = [];

        this.#columns.forEach(function(column) {
            keys.push(column.key);
        });
        
        return keys;
    }
    
    filter(name, filter)
    {
        if(!name) return this;
        
        if(!filter) delete this.#filters[name]; 
        else this.#filters[name] = filter;
        
        this.#filter();
        this.render();
        
        return this;
    }
    
    first() 
    {
        this.page(0);
    }
    
    previous() 
    {
        this.page(this.page()-1);
    }
    
    next() 
    {
        this.page(this.page()+1);
    }
    
    last() 
    {
        this.page(this.pages());
    }
    
    data(records)
    {
        var old = this.#records;
        
        if(records)
        {
            this.#records = records;
            
            if(this.#sortBy) this.sort(this.#sortBy);
            else this.#sorted = this.#records;
            
            this.#filter();
            this.render();
        }
        
        return old;
    }
    
    page(page)
    {
        if(page || page === 0)
        {
            this.#page = page;
            
            this.#attribute("page", this.#page+1);
            this.render();
            
            return this;
        }
        
        return Math.min(Math.max(0, this.#page), this.pages()-1);
    }
    
    pages()
    {
        return Math.max(1, Math.floor(this.#filtered.length / this.#pageSize) + (this.#filtered.length % this.#pageSize === 0 ? 0 : 1));
    }
    
    pageSize(pageSize)
    {
        if(pageSize && pageSize > 0)
        {
            this.#pageSize = pageSize;
            
            this.#attribute("page-size", pageSize);
            this.render();
            
            return this;
        }
        
        return this.#pageSize;
    }
    
    addColumn(key, name, options)
    {
        if(options !== null && typeof key !== "string" )
        {
            options = key;
        }
        
        if(options === null)
        {
            options = {};
        }
        
        options.key = options.key || key;
        options.name = options.name || name;
        options.type = (options.type && options.type.toLowerCase()) || "string";
        options.renderer = options.renderer || PaginatedTable.defaultRenderers[options.type];
        options.sortable = (typeof options.sortable !== 'undefined' && options.sortable) || true;
        
        this.#columns.push(options);
        
        this.#renderHeader();
        this.render();
    }
    
    removeColumn(key)
    {
        for(var i=0; i<this.#columns.length; i++)
        {
            if(this.#columns[i].key === key)
            {
                this.#columns.splice(i, 1);
            }
        }
        
        this.#renderHeader();
        this.render();
    }
    
    register(pager)
    {
        if(pager && !this.#pagers.includes(pager)) 
        {
            this.#pagers.push(pager);
            pager.render();
        }
    }
    
    unregister(pager)
    {
        if(this.#pagers.includes(pager)) 
        {
            this.#pagers.splice(this.#pagers.indexOf(pager), 1);
        }
    }
    
    sort(column, reverse)
    {
        var that = this;
        
        if(column === null)
        {
            this.#sortBy = null;
            this.#sortReversed = false;
            this.#sorted = this.#records;
            
            this.#filter();
            this.#renderHeader();
            this.render();
            
            return this;
        }
        
        if(column)
        {
            this.#columns.forEach(function(item) {

                if(item.key !== column || !item.sortable) return;

                that.#sortBy = column;
                that.#sortReversed = !!reverse;
                that.#sorted = that.#records.toSorted(function(left, right) {
                    
                    left = left[column];
                    right = right[column];
                    
                    if(left === null && right === null) return 0;
                    if(left === null) return 1;
                    if(right === null) return -1;

                    if(typeof left === "number" && typeof right === "number") return left - right;
                    
                    left = String(left).toUpperCase();
                    right = String(right).toUpperCase();
                    
                    if(left < right) return -1;
                    if(left > right) return 1;
                    
                    return 0;
                });
                
                if(that.#sortReversed) that.#sorted.reverse();

                that.#filter();
                that.#renderHeader();
                that.render();
            });
            
            return this;
        }
        
        return this.#sortBy;
    }
    
    reversed()
    {
        return this.#sortReversed;
    }
    
    render()
    {
        var page = Math.min(Math.max(0, this.#page), this.pages()-1);

        var start = page * this.#pageSize;
        var lines = Math.min(this.#pageSize, this.#filtered.length);
        var rows = [];
        var column;
        var record;
        
        var tr;
        var td;
        
        // We're not yet attached
        if(!this.#table) return;
        
        for(var i=0; i<lines; i++)
        {
            tr = document.createElement("tr");
            
            for(var j=0; j<this.#columns.length; j++)
            {
                td = document.createElement("td");
                column = this.#columns[j];
                record = this.#filtered[start+i];
                
                if(start+i<this.#filtered.length)
                {
                    column.renderer(td, column, record[column.key], record);
                    td.classList.add(column.type);
                }
                else
                {
                    // TODO: This approach feels a bit jank
                    td.innerHTML = "&nbsp;";
                    td.classList.add("empty");
                }
                
                tr.appendChild(td);
            }
            
            rows[i] = tr;
        }
        
        this.#tbody.replaceChildren(...rows);
        
        this.#pagers.forEach(function(pager) {
            if(pager.render) pager.render();
        });
    }
}

customElements.define("paginated-table", PaginatedTable);