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

class TabPanel extends HTMLElement
{
    #buttons;
    #content = [];
    #selected;
    
    constructor()
    {
        super();
    }
    
    get selected()
    {
        return this.#selected;
    }
    
    get length()
    {
        return this.#content.length;
    }
    
    buttons()
    {
        this.#buttons;
    }
    
    content(index)
    {
        return this.#content[index];
    }
    
    select(index)
    {
        if(Number.isInteger(index) && index >= 0 && index < this.#content.length)
        {
            if(this.#selected === index) return;
            
            for(var content of this.#content) content.select(false);
            
            this.#content[index].select(true);
            this.#selected = index;
            this.#buttons.select(index);
        }
        else
        {
            console.error("Unknown element requesting focus ", index);
        }
    }
    
    addTab(tab, content)
    {
        var element = document.createElement("tab-content");
        
        if(this.#buttons) this.#buttons.add(tab);
        
        element.appendChild(content);
        this.appendChild(element);
    }
    
    removeTab(element)
    {
        var index = Number.isInteger(element) ? element : this.#content.indexOf(element);
        
        index = this.#buttons.remove(index >= 0 ? index : element);
        
        if(index < 0) return -1; // We tried, but we can't find it
        
        this.#content[index].parentElement.removeChild(this.#content[index]);
        this.#content.splice(index, 1);
        
        if(this.#selected === index)
        {
            this.#selected = null;
            
            if(this.#content.length) 
            {
                if(this.#content.length > index) this.select(index);
                else this.select(this.#content.length - 1); 
            }
        }
        
        if(this.#selected > index) this.#selected--;
        
        return index;
    }
    
    register(element)
    {
        var button = this.#buttons && this.#buttons.button(this.#content.length);
        
        if(element instanceof TabButtons)
        {
            this.#buttons = element;
        }
        else if(element instanceof TabContent)
        {
            if(!this.#content.includes(element)) this.#content.push(element);
            if(this.#content.indexOf(element) !== this.#selected) element.select(false);
            
            if(button)
            {
                element.setAttribute("aria-labelledby", button.id);
                button.setAttribute("aria-controls", element.id);
            }
        }
        else
        {
            console.error("Unexpected element registraion ", element, " to tab-panel ", this);
            
            return;
        }

        if(!this.#selected && this.#selected !== 0 && this.#content.length)
        {
            this.select(this.#content.length - 1);
        }
    }
}

class TabButtons extends HTMLElement
{
    #buttons = [];
    #selected;
    #focused;
    
    constructor()
    {
        super();
    }
    
    connectedCallback() 
    {
        if(!this.getAttribute("role")) this.setAttribute("role", "tablist");
        
        if(this.parentElement) this.parentElement.register(this);
    }
    
    get selected()
    {
        return this.#selected;
    }
    
    get length()
    {
        return this.#buttons.length;
    }
    
    button(index)
    {
        return this.#buttons[index];
    }
    
    add(element)
    {
        var button = document.createElement("tab-button");
        
        button.appendChild(element);
        
        if(this.#buttons.length)
        {
            this.#buttons[this.#buttons.length-1].after(button);
        }
        else if(this.firstChild)
        {
            this.firstChild.after(button);
        }
        else
        {
            this.appendChild(button);
        }
    }
    
    remove(element)
    {
        var index = Number.isInteger(element) ? element : this.#buttons.indexOf(element);
        
        if(index < 0) return index;
        
        this.#buttons[index].parentElement.removeChild(this.#buttons[index]);
        this.#buttons.splice(index, 1);
        
        if(this.#selected === index)
        {
            this.#selected = null;
            
            if(this.#buttons.length)
            {
                this.select(Math.min(index, this.#buttons.length - 1)); 
            }
        }
        
        if(this.#selected > index) this.#selected--;
        
        return index;
    }
    
    focus(element)
    {
        if(element instanceof HTMLElement) 
        {
            this.#focused = this.#buttons.indexOf(element);
            
            if(document.activeElement !== element) element.focus();
        }
        else if(Number.isInteger(element))
        {
            this.#focused = this.#buttons.indexOf(element);
            
            if(document.activeElement !== this.#buttons[this.#focused]) 
            {
                this.#buttons[this.#focused].focus();
            }
        }
        else
        {
            console.error("Unknown element requesting focus ", element);
        }
    }
    
    focusPrevious()
    {
        this.#focused = (this.#focused - 1) % this.#buttons.length;
        
        if(this.#focused < 0) this.#focused += this.#buttons.length;
            
        this.#buttons[this.#focused].focus();
    }
    
    focusNext()
    {
        this.#focused = (this.#focused + 1) % this.#buttons.length;
        this.#buttons[this.#focused].focus();
    }
    
    #select(selected)
    {
        if(selected >= 0 && selected !== this.#selected)
        {
            for(var button of this.#buttons) button.select(false);

            this.#buttons[selected].select(true);
            this.#selected = selected;

            if(this.parentElement && this.parentElement.length > selected) 
            {
                this.parentElement.select(selected);
            }
        }
    }
    
    select(element)
    {
        if(element instanceof HTMLElement) 
        {
            this.#select(this.#buttons.indexOf(element));
        }
        else if(Number.isInteger(element) && element >= 0 && element < this.#buttons.length)
        {
            this.#select(element);
        }
        else
        {
            console.error("Unknown element requesting focus ", element);
        }
    }
    
    register(button)
    {
        var content = this.parentElement && this.parentElement.content(this.#buttons.length);
        
        if(!(button instanceof TabButton)) console.error("Unexpected element ", button);
        if(!(button instanceof TabButton)) throw new Error("Children must be <tab-button> tags!");
        
        if(!this.#buttons.includes(button)) this.#buttons.push(button);
        if(!this.#selected && this.#selected !== 0) this.select(this.#buttons.length-1);
        
        if(content)
        {
            content.setAttribute("aria-labelledby", button.id);
            button.setAttribute("aria-controls", content.id);
        }
    }
}

class TabButton extends HTMLElement
{
    constructor()
    {
        super();
        
        this.addEventListener("click", function(event) {
            if(this.parentElement) this.parentElement.select(this);
        });
        
        this.addEventListener("focus", function(event) {
           if(this.parentElement) this.parentElement.focus(this); 
        });
        
        this.addEventListener("keydown", function(event) {
            if(event.keyCode === 13) this.click(); // Activate this as if it were clicked on
            if(event.keyCode === 37 && this.parentElement) this.parentElement.focusPrevious();
            if(event.keyCode === 39 && this.parentElement) this.parentElement.focusNext();
        });
    }
    
    connectedCallback() 
    {
        var index = 0;
        
        while(document.getElementById("tabbutton-" + index)) index++;
        
        // Install tab index so that we can maintain focus
        if(!this.getAttribute("tabindex")) this.setAttribute("tabindex", "0");
        if(!this.getAttribute("type")) this.setAttribute("type", "button");
        if(!this.getAttribute("role")) this.setAttribute("role", "tab");
        if(!this.getAttribute("id")) this.setAttribute("id", "tabbutton-" + index);
        
        if(this.parentElement)
        {
            if(!(this.parentElement instanceof TabButtons))
            {
                console.error("Unexpected parent element ", this.parentElement);
                console.error("Parent element must be <tab-buttons> tag!");
                return;
            }
            
            this.parentElement.register(this);
            this.setAttribute("aria-selected", String(this.parentElement.length === 1));
            this.setAttribute("tabindex", (this.parentElement.length === 1) ? "0" : "-1");
        }
    }
    
    select(select)
    {
        this.setAttribute("aria-selected", String(!!select));
        this.setAttribute("tabindex", select ? "0" : "-1");
    }
}

class TabContent extends HTMLElement
{
    constructor()
    {
        super();
    }
    
    connectedCallback() 
    {
        var index = 0;
        
        while(document.getElementById("tabcontent-" + index)) index++;
        
        if(!this.getAttribute("id")) this.setAttribute("id", "tabcontent-" + index);
        if(!this.getAttribute("role")) this.setAttribute("role", "tabpanel");

        if(this.parentElement) this.parentElement.register(this);
    }
    
    select(select)
    {
        if(!select) this.style.display = "none";
        else delete this.style.removeProperty("display");
    }
}

customElements.define("tab-panel", TabPanel);
customElements.define("tab-buttons", TabButtons);
customElements.define("tab-button", TabButton);
customElements.define("tab-content", TabContent);