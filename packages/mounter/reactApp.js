import React from 'react';
import ReactDOM from 'react-dom';

const reactWebComponent = (name = 'app', App) => {
  

  class AppElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    disconnectedCallback() {
      ReactDOM.unmountComponentAtNode(this.elem);
      this.elem = null;
    }

    render() {
      this.elem = document.createElement('div');
      // document.body.appendChild(this.elem);
      this.appendChild(this.elem);
      ReactDOM.render(
        React.createElement(App),
        this.elem
      );
    }

  }

  return customElements.define(`mfel-react-${name}`, AppElement);


}


export default reactWebComponent
