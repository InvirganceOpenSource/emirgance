# Emirgance
Web Components for rapidly building user interfaces

These components are currently under development. Current release includes:

 - An extension of HTMLElement that provides three key features:
   - Allows you embed `<style>` and `<link>` tags into your component's HTML
   - `emirganceInit()` function can be overridden to render as soon as the Web Component's element is fully loaded
   - Shadow DOM is automatically created and can be accessed with this.shadowRoot
 - A paginated table component with a customizable CSS stylesheet
 - A pager to use with the table, also with a customizable CSS stylesheet

## Building an Emirgance Web Component

You can build your own Web Component by extending `EmirganceBaseElement` and overriding `emirganceInit()`.

Example:

    class MyButton extends EmirganceBaseElement
    {
        constructor()
        {
            super();
        }

        emirganceInit()
        {
            var button = document.createElement("button");

            button.textContent = this.textContent;

            this.shadowRoot.appendChild(button);
        }
    }

    customElements.define("my-button", MyButton);

We can then use the component in a page like this:

    <my-button>
        <style>
            button { background: green; color: white; font-size: 16pt; border: 2px outset green; }
            button:active { border: 2px inset green; }
        </style>
        Hello!
    </my-button>
