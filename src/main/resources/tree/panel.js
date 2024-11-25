/* 
 * The MIT License
 *
 * Copyright 2024 Invirgance, LLC
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

class TreePanel extends HTMLElement
{
    static observedAttributes = [];
    
    #children = [];
    #selectedIndex = null;
    #focusedIndex = null;
    
    constructor()
    {
        super();
    }
    
    get length()
    {
        return this.#children.length;
    }
    
    get focusedIndex()
    {
        return this.#focusedIndex;
    }
    
    set focusedIndex(index)
    {
        if(Number.isInteger(index) && index >= 0 && index < this.#children.length)
        {
            this.#focusedIndex = index;
        }
        else if(index instanceof TreeNode)
        {
            if(this.#children.includes(index)) 
            {
                this.#focusedIndex = this.#children.indexOf(index);
            }
        }
        else if(index === null)
        {
            this.#focusedIndex = null;
        }
        else
        {
            console.error("Unknown value for focusedIndex ", index);
        }
    }
    
    get selectedIndex()
    {
        return this.#selectedIndex;
    }
    
    set selectedIndex(index)
    {
        if(Number.isInteger(index) && index >= 0 && index < this.#children.length)
        {
            this.selectNone();
            
            this.#selectedIndex = index;
        }
        else if(index instanceof TreeNode)
        {
            if(this.#children.includes(index)) 
            {
                this.selectNone();
            
                this.#selectedIndex = this.#children.indexOf(index);
            }
        }
        else
        {
            console.error("Unknown value for selecteIndex ", index);
        }
    }
    
    childIndex(element)
    {
        return this.#children.indexOf(element);
    }
    
    selectNone()
    {
        this.querySelectorAll("tree-label[aria-current]").forEach(function(element) {
            element.parentElement.selected = false; 
        });
    }
    
    focusHome()
    {
        if(!this.#children.length) return;
        
        this.#children[0].focused = true;
    }
    
    focusEnd()
    {
        if(!this.#children.length) return;
        
        if(this.#children[this.#children.length-1].open)
        {
            this.#children[this.#children.length-1].focusEnd();
        }
        else
        {
            this.#children[this.#children.length-1].focused = true;
        }
    }
    
    focusPrevious()
    {
        if(!this.#children.length) return;
        
        if(this.#focusedIndex === null) 
        {
            this.#children[this.#children.length-1].focused = true;
        }
        else if(this.#focusedIndex > 0)
        {
            if(this.#children[this.focusedIndex-1].open)
            {
                this.#children[this.focusedIndex-1].focusPrevious();
            }
            else
            {
                this.#children[this.focusedIndex-1].focused = true;
            }
        }
    }
    
    focusNext()
    {
        if(!this.#children.length) return;
        
        if(this.#focusedIndex === null) 
        {
            this.#children[0].focused = true;
        }
        else if(this.#focusedIndex < this.#children.length-1) 
        {
            this.#children[this.focusedIndex+1].focused = true;
        }
    }
    
    connectedCallback()
    {
        if(!this.getAttribute("role")) this.setAttribute("role", "tree");
        
    }
    
    register(element)
    {
        if(element instanceof TreeNode)
        {
            if(!this.#children.includes(element)) this.#children.push(element);
        }
        else
        {
            console.error("Unknown element requesting registration ", element, ". Expected type of TreeNode");
        }
    }
}

class TreeNode extends HTMLElement
{
    static observedAttributes = ["expanded"];
    
    #icon;
    #open = false;
    #selected = false;
    #focused = false;
    #label;
    #children = [];
    #selectedIndex = null;
    #focusedIndex = null;
    
    constructor()
    {
        super();
    }
    
    get label()
    {
        return this.#label && this.#label.textContent;
    }
    
    get path()
    {
        var array = [];
        
        if(this.parentNode instanceof TreeNode)
        {
            array = this.parentNode.path;
        }
        
        array.push(this.value || this.label);
        
        return array;
    }
    
    get length()
    {
        return this.#children.length;
    }
    
    get value()
    {
        return this.getAttribute("value");
    }
    
    set value(value)
    {
        this.setAttribute("value", value);
    }
    
    get open()
    { 
        return this.#open; 
    }
    
    set open(open) 
    {
        this.#open = (!!open && !!this.#children.length); 
        
        this.setAttribute("aria-expanded", String(this.#open));
        this.setAttribute("expanded", String(this.#open));
    }
    
    get focused()
    {
        return this.#focused;
    }
    
    set focused(focused)
    {
        focused = !!focused; // Force to a true/false value
        
        if(focused && this.parentElement) 
        {
            this.parentElement.focusedIndex = this;
        }
        
        this.#focused = focused;
        this.#focusedIndex = null;

        if(focused && document.activeElement !== this.#label) this.#label.focus();
    }
    
    get focusedIndex()
    {
        return this.#focusedIndex;
    }
    
    set focusedIndex(index)
    {
        if(Number.isInteger(index) && index >= 0 && index < this.#children.length)
        {
            this.#focusedIndex = index;
            
            if(this.parentElement) this.parentElement.focusedIndex = this;
        }
        else if(index instanceof TreeNode)
        {
            if(this.#children.includes(index)) 
            {
                this.#focusedIndex = this.#children.indexOf(index);
                
                if(this.parentElement) this.parentElement.focusedIndex = this;
            }
        }
        else if(index === null)
        {
            this.#focusedIndex = null;
            
            if(this.parentElement) this.parentElement.focusedIndex = null;
        }
        else
        {
            console.error("Unknown value for focusedIndex ", index);
        }
    }
    
    get selected()
    {
        return this.#selected;
    }
    
    set selected(selected)
    {
        var updated;
        
        selected = !!selected; // Force to a true/false value
        updated = (this.#selected !== selected);

        if(selected && this.parentElement) 
        {
            this.parentElement.selectedIndex = this;
        }
        
        this.#selected = selected;
        
        if(!this.#label) return;
        
        if(selected) this.#label.setAttribute("aria-current", "true");
        else this.#label.removeAttribute("aria-current");
        
        if(selected && updated) this.fireEvent(this, "NodeSelected");
    }
    
    get selectedIndex()
    {
        return this.#selectedIndex;
    }
    
    set selectedIndex(index)
    {
        if(Number.isInteger(index) && index >= 0 && index < this.#children.length)
        {
            this.#selectedIndex = index;
            
            if(this.parentElement) this.parentElement.selectedIndex = this;
        }
        else if(index instanceof TreeNode)
        {
            if(this.#children.includes(index)) 
            {
                this.#selectedIndex = this.#children.indexOf(index);
                
                if(this.parentElement) this.parentElement.selectedIndex = this;
            }
        }
        else
        {
            console.error("Unknown value for selecteIndex ", index);
        }
    }
    
    get depth()
    {
        if(this.parentElement instanceof TreeNode)
        {
            return this.parentElement.depth + 1;
        }
        
        return 0;
    }
    
    childIndex(element)
    {
        return this.#children.indexOf(element);
    }
    
    fireEvent(node, eventType)
    {   
        var event = new CustomEvent(eventType, {
            bubbles: true,
            cancelable: true,
            detail: {
                label: node.label,
                path: node.path,
                node: node,
                value: node.getAttribute("value")
            }
        });
        
        this.dispatchEvent(event);
    }
    
    selectNone()
    {
        this.querySelectorAll("tree-label[aria-current]").forEach(function(element) {
            element.parentElement.selected = false; 
        });
    }
    
    focusHome()
    {
        if(this.parentElement) this.parentElement.focusHome();
    }
    
    focusEnd()
    {
        if(this.parentElement && this.parentElement.childIndex(this) < this.parentElement.length-1)
        {
            this.parentElement.focusEnd();
        }
        else if(!this.#children.length) 
        {
            this.focused = true;
            return;
        }
        else
        {
            if(this.#children[this.#children.length-1].open)
            {
                this.#children[this.#children.length-1].focusEnd();
            }
            else
            {
                this.#children[this.#children.length-1].focused = true;
            }
        }
    }
    
    focusPrevious()
    {
        if(this.#open)
        {
            if(this.#focused)
            {
                this.parentElement.focusPrevious();
            }
            else if(this.#focusedIndex === null)
            {
                if(this.#children[this.#children.length - 1].open)
                {
                    this.#children[this.#children.length - 1].focusPrevious();
                }
                else
                {
                    this.#children[this.#children.length - 1].focused = true;
                }
            }
            else if(this.#focusedIndex > 0) 
            {
                if(this.#children[this.focusedIndex-1].open)
                {
                    this.#children[this.focusedIndex-1].focusPrevious();
                }
                else
                {
                    this.#children[this.focusedIndex-1].focused = true;
                }
            }
            else
            {
                this.focused = true;
            }
        }
        else if(this.parentElement) 
        {
            this.parentElement.focusPrevious();
        }
    }
    
    focusNext()
    {
        if(this.#open)
        {
            if(this.#focusedIndex === null && this.#children.length) 
            {
                this.#children[0].focused = true;
            }
            else if(this.#focusedIndex < this.#children.length-1) 
            {
                this.#children[this.focusedIndex+1].focused = true;
            }
            else
            {
                this.parentElement.focusNext();
            }
        }
        else if(this.parentElement) 
        {
            this.parentElement.focusNext();
        }
    }
    
    #setExapndIcon()
    {
        this.#icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10">' +
                               '  <polygon points="2 1, 12 1, 7 9"></polygon>' +
                               '</svg>';
                       
        if(this.parentElement && this.depth) this.#icon.style.marginLeft = (13 * this.depth) + "px";
    }
    
    #setNoIcon()
    {
        if(this.getAttribute("icon"))
        {
            this.#icon.innerHTML = '<svg class="custom"><use xlink:href="' + this.getAttribute("icon") + '"\"></svg>';
        }
        else
        {
            this.#icon.innerHTML = '<svg class="expand" xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10">' +
                                   '</svg>';
        }
        
        if(this.parentElement && this.depth) this.#icon.style.marginLeft = (13 * this.depth) + "px";
    }
    
    collapse()
    {
        this.open = false;
    }
    
    expand()
    {
        this.open = true;
    }
    
    connectedCallback() 
    {
        var that = this;
        var depth = this.depth;
        
        if(!this.getAttribute("role")) this.setAttribute("role", "group");
        
        if(this.getAttribute("expanded")) this.setAttribute("aria-expanded", String(this.getAttribute("expanded").toLowerCase() === "true"));
        else if(!this.getAttribute("aria-expanded")) this.setAttribute("aria-expanded", "false");
        else this.#open = (this.getAttribute("aria-expanded") === "true");
        
        if(this.parentElement) this.parentElement.register(this);
        
        if(!this.#icon)
        {
            this.#icon = document.createElement("span");
            
            this.#setNoIcon();
            this.prepend(this.#icon);
            
            this.#icon.addEventListener("click", function(event) {
                that.open = !that.open;
            });
        }
        
        if(this.parentElement && depth) this.#icon.style.marginLeft = (13 * depth) + "px";
    }
    
    register(element)
    {
        if(element instanceof TreeLabel)
        {
            this.#label = element;
            this.selected = !!this.selected;
        }
        else if(element instanceof TreeNode)
        {
            if(!this.#children.includes(element)) this.#children.push(element);
            if(this.#children.length) this.#setExapndIcon();
        }
        else
        {
            console.error("Unknown element requesting registration ", element, ". Expected type of TreeNode or TreeLabel");
        }
    }
}

class TreeLabel extends HTMLElement
{
    static observedAttributes = ["value"];
    
    constructor()
    {
        super();
        
        this.addEventListener("focusin", (event) => {
            if(this.parentElement) this.parentElement.focused = true;
        });

        this.addEventListener("focusout", (event) => {
            if(this.parentElement) this.parentElement.focused = false;
            if(this.parentElement) this.parentElement.focusedIndex = null;
        });

        this.addEventListener("click", function(event) {
            if(this.parentElement) this.parentElement.selected = true;
        });

        this.addEventListener("dblclick", function(event) {
            if(this.parentElement) this.parentElement.fireEvent(this.parentElement, "NodeAction");
        });
        
        this.addEventListener("keydown", function(event) {
            if(event.keyCode === 13) // Activate this as if it were clicked on
            {
                if(this.parentElement && this.parentElement.selected) 
                {
                    this.parentElement.fireEvent(this.parentElement, "NodeAction"); 
                }
                else 
                {
                    this.click();
                }
            } 
            
            if(event.keyCode === 35 && this.parentElement) 
            { 
                this.parentElement.focusEnd(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
            
            if(event.keyCode === 36 && this.parentElement) 
            { 
                this.parentElement.focusHome(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
            
            if(event.keyCode === 37 && this.parentElement)
            { 
                this.parentElement.collapse(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
            
            if(event.keyCode === 38 && this.parentElement) 
            {
                this.parentElement.focusPrevious(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
            
            if(event.keyCode === 39 && this.parentElement) 
            { 
                this.parentElement.expand(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
            
            if(event.keyCode === 40 && this.parentElement) 
            {
                this.parentElement.focusNext(); 
                event.stopPropagation(); 
                event.preventDefault(); 
            }
        });
    }
    
    connectedCallback()
    {
        if(!this.getAttribute("tabindex")) this.setAttribute("tabindex", "0");
        if(!this.getAttribute("role")) this.setAttribute("role", "treeitem");
        
        if(this.parentElement) this.parentElement.register(this);
    }
}

customElements.define("tree-panel", TreePanel);
customElements.define("tree-node", TreeNode);
customElements.define("tree-label", TreeLabel);
