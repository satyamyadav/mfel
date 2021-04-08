
import UniversalRouter from 'universal-router';
import generateUrls from 'universal-router/generateUrls';
import loader from '@mfel/loader';

class Shell {
  constructor() {
    this.options = {
      router: {}
    };
    this.url = () => {};
    this.apps = [];
    this.router = {};
    this.state = {
      configured: false,
      registered: false,
      routed: false,
      running: false
    };
  }

  config(options = {}) {
    this.options = { ...this.options, ...options };
    this.state.configured = true;
    return this;
  }

  register(apps = []) {
    this.apps = [...this.apps, ...apps]
    this.state.registered = true;
    return this;
  }

  createRoutes() {
    const routes = this.apps.map((app) => {
      const { name, path, title, action } = app;
      const children = [
        {
          path: "",
          action: action || this.pageAction(app)
        }
      ];

      const rootPaths = ['', '/'];

      if (!rootPaths.includes(path)) {
        children.push({
          path: "/(.*)",
          action: action || this.pageAction(app)
        })
      }

      return {
        name,
        path,
        title,
        children,
      }
    });

    const router = new UniversalRouter(routes, this.options.router);
    const url = generateUrls(router);
    this.router = router;
    this.routes = routes.map(route => {
      return {
        ...route,
        url: url(route.name)
      }
    });
    this.url = url;
    this.state.routed = true;
    return this;
  }

  genUrl(p) {
    return this.url(p);
  }

  init() {
    this.createRoutes();
    this.navigateToRoute(window.location.pathname);

    window.addEventListener("popstate", this.popstateHandler.bind(this));
  }

  run(cb) {
    this.init();
    this.running = true;
    if (cb) {
      cb({ ...this }); // doesn't expose instance and instance methods to callback
    }
  }

  pageAction(app) {
    return this.pageRenderer.bind(this, app);
  }

  pageRenderer(app, context, params) {

    const { template=`` } = app;
    if (this.options.pageRenderer) {
      return this.options.pageRenderer(app, context, params);
    }
    try {
      loader(app)
      .load();
    } catch (error) {
      console.log(error);
    }

    return template;
  }

  goTo(p) {
    return this.navigateToRoute(p)
      .then(d => {
        history.pushState({}, 'this page', p);
      })
      .catch(err => {
        console.error(err);
      })
  }

  popstateHandler(ev) {
    this.navigateToRoute(window.location.pathname);
  }

  navigateToRoute(p) {
    return this.router.resolve(p)
      .then(html => {
        const panel = document.getElementById('app');
        const newNode = panel.cloneNode(false);
        newNode.innerHTML = html
        panel.replaceWith(newNode);
        return Promise.resolve({ msg: 'app updated' });
      })
      .catch(console.log)
  }

}

const instance = new Shell();

// Object.freeze(instance);

export default instance;


window.RootApp = instance;
