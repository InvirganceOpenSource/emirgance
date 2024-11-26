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

class CodeViewer extends HTMLElement
{
    static observedAttributes = ["baseurl"];
    
    #treePanels = [];
    #preloaded = false;
    
    constructor()
    {
        super();
    }
    
    #findTree()
    {
        for(var element of this.children)
        {
            if(element instanceof TreePanel) return element;
        }
        
        return null;
    }
    
    #findCode()
    {
        for(var element of this.children)
        {
            if(element instanceof CodePanel) return element;
        }
        
        return null;
    }
    
    #automanage()
    {
        var panel;
        var left;
        var right;
        
        var tree = this.#findTree();
        var code = this.#findCode();
        
        if(this.children.length !== 2) return;
        if(!tree || !code) return;
        
        panel = document.createElement("div");
        left = document.createElement("div");
        right = document.createElement("div");
        
        panel.classList.add("default-panel");
        left.classList.add("default-left");
        right.classList.add("default-right");
        
        left.appendChild(this.children[0] === tree ? tree : code);
        right.appendChild(this.children[0] === tree ? tree : code);
        
        panel.appendChild(left);
        panel.appendChild(right);
        
        this.appendChild(panel);
    }
    
    #translatePath(path)
    {
        return path.join("/");
    }
    
    async load(path)
    {
        var response;
        var data;
        var type;
        
        if(Array.isArray(path)) path = this.#translatePath(path);
        if(this.getAttribute("baseurl")) path = this.getAttribute("baseurl") + "/" + path;
        
        type = path.lastIndexOf(".") < 0 ? "text" : path.substring(path.lastIndexOf(".")+1);
        
        response = await fetch(path);
        data = await response.text();
        
        for(var panel of this.querySelectorAll("code-panel"))
        {
            panel.code = "";
            panel.type = type;
            panel.code = data;
        }
    }
    
    connectedCallback()
    {
        var that = this;
        var preload = this.getAttribute("preload");
        
        var observer = new MutationObserver(function() {
            that.querySelectorAll("tree-panel").forEach(function(element) {
                that.register(element);
                that.#automanage();
            });
            
            if(preload && !that.#preloaded && that.querySelectorAll("code-panel").length)
            {
                that.load(preload);
                
                that.#preloaded = true;
            }
         });

        observer.observe(this, {childList: true, subtree: false});
    }
    
    register(element)
    {
        var that = this;
        
        if(element instanceof TreePanel)
        {
            if(this.#treePanels.includes(element)) return;
            
            this.#treePanels.push(element);
            
            element.addEventListener("NodeSelected", function(event) {
                that.load(event.detail.path);
            });
        }
        else
        {
            console.error("Unknown element requesting registration ", element, ". Expected type of TreePanel.");
        }
    }
}

customElements.define("code-viewer", CodeViewer);

