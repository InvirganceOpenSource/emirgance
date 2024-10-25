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
                a.innerText = value;
                
                element.appendChild(a);
                
                return;
            }
            
            element.innerText = value;
        },
        "number": function(element, column, value, record) {
            
            value = new Intl.NumberFormat().format(value);

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
    #pagers = [];
    #pageSize = 10;
    #page = 0;
    
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
                    
                    columns[index++] = {
                        "key": key,
                        "name": element.innerText,
                        "type": type,
                        "element": element,
                        "renderer": PaginatedTable.defaultRenderers[type],
                        "href": element.attributes["href"] && element.attributes["href"].nodeValue || null
                    };
                });
            }
        });
        
        this.#columns = columns;
        tr = document.createElement("tr");
        
        columns.forEach(function(column, index) {
            var th = document.createElement("th");
            
            th.innerText = column.name;
            th.classList.add(column.type);
            tr.appendChild(th);
        });
        
        this.#thead.appendChild(tr);
        this.#table.appendChild(this.#thead);
        this.#table.appendChild(this.#tbody);
        this.shadowRoot.appendChild(this.#table);
        
        this.render();
    }
    
    #renderHeader()
    {
        var tr = document.createElement("tr");
        
        this.#columns.forEach(function(column, index) {
            var th = document.createElement("th");
            
            th.innerText = column.name;
            th.classList.add(column.type);
            tr.appendChild(th);
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
        return Math.max(1, Math.floor(this.#records.length / this.#pageSize) + (this.#records.length % this.#pageSize === 0 ? 0 : 1));
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
    
    render()
    {
        var page = Math.min(Math.max(0, this.#page), this.pages()-1);

        var start = page * this.#pageSize;
        var lines = Math.min(this.#pageSize, this.#records.length);
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
                record = this.#records[start+i];
                
                if(start+i<this.#records.length)
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