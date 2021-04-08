
import loader from './loader';

const mfaLoader = () => {

  class AppElement extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      let data = this.getAttribute('app');
      if(!data) {
        return;
      }
      try {
        data = JSON.parse(data);
      }
      catch (err) {
        console.error(err);
      }
      loader(data)
      .load();
    }

    disconnectedCallback() {

    }

  }

  return customElements.define(`mfel-loader`, AppElement);

}


export default mfaLoader();
