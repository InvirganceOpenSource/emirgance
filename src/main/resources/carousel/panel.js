/* 
 * The MIT License
 *
 * Copyright 2025 jbanes.
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

class CarouselPanel extends EmirganceStructuralElement 
{
    static observedAttributes = ["navigation"];
    
    #top;
    #items;
    #width;
    #height;
    
    #observer;
    #selected;
    
    #left;
    #right;
    #bubbles;
    
    constructor()
    {
        super();
    }
    
    #update()
    {
        for(var i=0; i<this.#items.length; i++)
        {
            this.#items[i].style.transform = "translateX(" + (i - this.#selected) + "00%)";
            this.#items[i].style.height = this.#height + "px";
            this.#items[i].style.width = this.#width + "px";
        }
        
        if(this.#selected < 1) this.#left.setAttribute("disabled", "disabled");
        else this.#left.removeAttribute("disabled");
        
        if(this.#selected >= this.#items.length-1) this.#right.setAttribute("disabled", "disabled");
        else this.#right.removeAttribute("disabled");
        
        this.#bubbles.childNodes[this.#selected].setAttribute("disabled", "disabled");

        if((this.offsetHeight && this.offsetHeight < this.#height) || !this.style.height) 
        {
            this.style.height = this.#height + "px";
        }
    }
    
    get selected() 
    { 
        return this.#selected; 
    }
    
    set selected(selected)
    {
        this.#bubbles.childNodes[this.#selected].removeAttribute("disabled");
        
        this.#selected = Math.max(0, Math.min(this.#items.length-1, selected));
        
        this.#update();
    }
    
    emirganceInit()
    {
        var that = this;
        var left = document.createElement("span");
        var right = document.createElement("span");
        
        this.#items = [];
        this.#height = (this.style.height) ? this.offsetHeight : 84;
        this.#selected = 0;
        this.#observer = new ResizeObserver(function(elements) {
            
            for(var element of elements) 
            {
                if(element.target === that) that.#width = element.contentRect.width;
                if(element.contentRect.height > that.#height) that.#height = element.contentRect.height;
            }
            
            that.#update();
        });
        
        this.#observer.observe(this);
        
        this.addEventListener("keydown", function(event) {
            if(event.keyCode === 37) that.previous();
            if(event.keyCode === 39) that.next();
        });
        
        this.#left = document.createElement("div");
        this.#right = document.createElement("div");
        this.#bubbles = document.createElement("div");
        
        left.innerHTML = "&lsaquo;";
        right.innerHTML = "&rsaquo;";
        this.#left.classList.add("navigation", "left");
        this.#right.classList.add("navigation", "right");
        this.#bubbles.classList.add("bubbles");
        this.#left.setAttribute("disabled", "disabled");
        this.#left.appendChild(left);
        this.#right.appendChild(right);
        
        this.#left.onclick = function() { that.previous(); };
        this.#right.onclick = function() { that.next(); };
        
        this.appendChild(this.#left);
        this.appendChild(this.#right);
        this.appendChild(this.#bubbles);
    }
    
    emirganceUpdated(changes)
    {
        var bubble;
        var that = this;
        
        this.#width = this.offsetWidth;
        
        for(var change of changes)
        {
            if(!change.addedNodes.length) continue;
            
            for(var node of change.addedNodes)
            {
                if(!(node instanceof HTMLElement)) continue;
                if(node === this.#left) continue;
                if(node === this.#right) continue;
                if(node === this.#bubbles) continue;
                
                if(node.offsetHeight > this.#height) this.#height = node.offsetHeight;
                
                node.style.transform = "translateX(" + this.#items.length + "00%)";
                bubble = document.createElement("div");
                
                if(this.getAttribute("navigation")) bubble.classList.add(this.getAttribute("navigation"));
                
                bubble.onclick = function(index) { return function() { that.selected = index; }; }(this.#items.length);
                
                this.#bubbles.appendChild(bubble);
                this.#items.push(node);
                this.#observer.observe(node);
            }

            if((this.offsetHeight && this.offsetHeight < this.#height) || !this.style.height) 
            {
                this.style.height = this.#height + "px";
            }
        }
        
        if(!this.getAttribute("tabindex")) this.setAttribute("tabindex", "-1");
    }
    
    previous()
    {
        this.selected--;
    }
    
    next()
    {
        this.selected++;
    }
}

customElements.define("carousel-panel", CarouselPanel);

