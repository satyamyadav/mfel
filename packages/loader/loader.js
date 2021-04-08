
/**
 * @param
 * bundles array
 * name string
 * hostURL URL
 * manifestURL link
 */
export default (app = {}) => {
  const defaultName = `mfa${Date.now()}`;
  const { bundles = [], name = defaultName, hostURL, manifestURL } = app;

  const isCompleteUrl = link => link.includes('://');
  const buildUrl = link => {
    if (!isCompleteUrl(link) && hostURL) {
      return `${hostURL}${link}`;
    }
    return link;
  };

  const loadManifest = (link) => {
    return fetch(link, {
      // mode: 'no-cors'
    })
      .then(res => {
        if (!res.body) {
          throw new Error('Empty response');
        }
        return res.json();
      })
      .then(({ entrypoints = [] }) => {
        return entrypoints.map(item => {
          return {
            url: `/${item}`
          }
        })
      });
  }

  /**
   * 
   * @param {object} bundle 
   * url
   * fileType
   * ...rest script attributes
   * @param {string} name 
   */
  const loadAssets = (name, bundle = {}) => {
    const TAG = {
      script: 'script',
      style: 'link'
    }

    const TAG_ATTRIBUTES = {
      script: { type: 'text/javascript' },
      style: {
        rel: 'stylesheet',
        type: 'text/css'
      }
    }

    const TAG_TARGET = {
      script: 'src',
      style: 'href'
    }

    let { url, fileType, parent = 'body', ...restAttributes } = bundle;
    const fileTypeMap = {
      'js': 'script',
      'css': 'style'
    }
    if (!url) {
      return
    }
    if (!fileType) {
      fileType = fileTypeMap[url.slice(url.lastIndexOf('.') + 1)];
    }
    url = buildUrl(url);

    const id = `mfa_${url.substring(url.lastIndexOf('/') + 1)}_${name}`.replaceAll('.', '_');
    return new Promise(resolve => {
      const script = document.createElement(TAG[fileType]);
      script.id = id;
      const attributes = { ...TAG_ATTRIBUTES[fileType], ...restAttributes };
      Object.keys(attributes).forEach(key => {
        script.setAttribute(key, attributes[key]);
      })
      script.type = attributes.type;
      script.addEventListener('load', () => resolve());
      script[TAG_TARGET[fileType]] = url;
      script.async = false;
      const parentEl = document[parent];
      if (!parentEl.querySelector(`${TAG[fileType]}#${id}`)) {
        parentEl.append(script);
      } else {
        resolve();
      }
    });
  }

  const load = () => {
    bundles
      .sort((a, b) => a.weight - b.weight)
      .forEach(loadAssets.bind(null, name));
    if (manifestURL) {
      loadManifest(buildUrl(manifestURL))
        .then(bundles => bundles.forEach(loadAssets.bind(null, name)))
        .catch(console.log);
    }
  };

  return {
    load
  };

}