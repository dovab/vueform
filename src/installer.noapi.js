import 'regenerator-runtime/runtime'
import _ from 'lodash'
import flatten from 'flat'
import shouldApplyPlugin from './utils/shouldApplyPlugin'
import packageJson from './../package.json'

import axios from './services/axios/index'
import validation from './services/validation/index'
import messageBag from './services/messageBag/index'
import autosize from './services/autosize/index'
import location from './services/location/index'
import condition from './services/condition/index'
import i18n from './services/i18n/index'
import columns from './services/columns/index'
import { ref, markRaw } from 'vue'


export default function(config, components) {
  const Vueform = class {
    constructor() {
      this.options = {
        config: _.omit(config, [
          'theme', 'templates', 'locales', 'rules', 'plugins',
        ]),
        templates: config.templates || {},
        theme: config.theme || {},
        rules: config.rules || {},
        locales: config.locales || {},
        plugins: config.plugins || [],
        i18n: null,
        vueVersion: null,
        services: {
          validation,
          axios,
          messageBag,
          autosize,
          location,
          condition,
          columns,
        },
        version: packageJson.version,
      }
    }

    config(config) {
      // merge
      _.each([
        'theme', 'templates', 'locales', 'rules',
      ], (attr) => {
          if (config[attr] !== undefined) {
            this.options[attr] = Object.assign({}, this.options[attr], config[attr])
          }
      })

      // replace
      _.each([
        'plugins',
      ], (attr) => {
          if (config[attr] !== undefined) {
            this.options[attr] = config[attr]
          }
      })

      // merge (config)
      _.each([
        'languages', 'services', 'addClasses', 'removeClasses',
        'replaceClasses', 'overrideClasses', 'presets', 'views',
      ], (attr) => {
          if (config[attr] !== undefined) {
            this.options.config[attr] = Object.assign({}, this.options.config[attr], config[attr])
          }
      })

      // deep merge
      _.each([
        'endpoints',
      ], (attr) => {
          if (config[attr] !== undefined) {
            this.options.config[attr] = _.merge({}, this.options.config[attr], config[attr])
          }
      })
      
      // replace
      _.each([
        'columns', 'forceLabels', 'displayErrors', 'floatPlaceholders', 'displayErrors', 'displayMessages',
        'language', 'locale', 'fallbackLocale', 'orderFrom', 'validateOn', 'formData', 'beforeSend',
        'locationProvider', 'classHelpers', 'env', 'usePresets', 'plugins', 'size', 'apiKey',
      ], (attr) => {
          if (config[attr] !== undefined) {
            this.options.config[attr] = config[attr]
          }
      })

      if (config.elements) {
        config.elements.forEach((element) => {
          components[element.name] = _.omit(element, ['render', 'staticRenderFns', 'components'])
        })

        config.elements.forEach((element) => {
          if (this.options.templates[element.name] === undefined) {
            this.options.templates[element.name] = _.pick(element, ['render', 'staticRenderFns', 'components'])
          }
        })
      }

      if (config.axios !== undefined) {
        if (typeof config.axios === 'function') {
          this.options.services.axios = config.axios
        } else {
          this.options.config.axios = config.axios
        }
      }
    }

    registerComponents(appOrVue) {
      _.each(components, (comp, name) => {
        const component = {...comp}

        component.setup = (props, context) => {
          context = Object.assign({}, context, {
            name: ref(name),
            emits: component.emits,
          })

          let setup = comp.setup(props, context)

          this.options.plugins.forEach((p) => {
            if (typeof p === 'function') {
              p = p()
            }

            p = Array.isArray(p) ? p : [p]

            p.forEach((plugin) => {
              const pluginOptions = typeof plugin === 'function' ? plugin() : plugin

              if (pluginOptions.setup && shouldApplyPlugin(name, pluginOptions)) {
                setup = pluginOptions.setup(props, context, setup)
              }
            })
          })

          return setup
        }

        if (component.components === undefined) {
          component.components = this.options.templates[name]?.components || this.options.theme.templates[name]?.components || {}
        }

        component.render = function() {
          return this.template.render.apply(this, arguments)
        }

        component.staticRenderFns = function() {
          return this.template.staticRenderFns
        }

        this.options.plugins.forEach((p) => {
          if (typeof p === 'function') {
            p = p()
          }

          p = Array.isArray(p) ? p : [p]

          p.forEach((plugin) => {
            const pluginOptions = typeof plugin === 'function' ? plugin() : plugin

            _.each(_.without(Object.keys(pluginOptions), 'setup', 'apply', 'config', 'install'), (key) => {
              if (pluginOptions[key] && shouldApplyPlugin(name, pluginOptions)) {
                if (Array.isArray(pluginOptions[key])) {
                  let base = component[key] || []
                  component[key] = base.concat(pluginOptions[key])
                } else if (_.isPlainObject(pluginOptions[key])) {
                  component[key] = Object.assign({}, component[key] || {}, pluginOptions[key])
                } else {
                  component[key] = pluginOptions[key]
                }
              }
            })
          })
        })

        appOrVue.component(name, component)
      })
    }

    initAxios() {
      const $axios = this.options.services.axios
      const axiosConfig = this.options.config.axios
      const axiosConfigFlat = flatten(this.options.config.axios)

      Object.keys(axiosConfigFlat).forEach((key) => {
        const value = axiosConfigFlat[key]

        if (['onUnauthenticated'].indexOf(key) === -1 && key.indexOf('csrfRequest.') === -1) {
          _.set($axios.defaults, key, value)
        }
      })

      $axios.interceptors.response.use(r => r, (error) => {
        if (!error.response) {
          return Promise.reject(error)
        }

        return new Promise((resolve, reject) => {
          const response = error.response
          const originalRequest = response.config

          if ([401, 419].indexOf(error.response.status) !== -1) {
            if (axiosConfig.csrfRequest && !originalRequest.CSRF) {
              $axios.request({
                ...axiosConfig.csrfRequest,
                CSRF: true,
              }).then(() => {
                resolve($axios.request({...originalRequest, CSRF: true }))
              }).catch((error) => {
                reject(error)
              })
            } else if (axiosConfig.onUnauthenticated) {
              axiosConfig.onUnauthenticated(originalRequest)
            } else {
              reject(error)
            }
          } else {
            reject(error)
          }
        })
      })
    }

    initI18n() {
      this.options.i18n = new i18n({
        locales: this.options.locales,
        locale: this.options.config.locale,
        fallbackLocale: this.options.config.fallbackLocale,
      })
    }

    createApiKeyError(message = '=== Vueform API Key Missing ===') {
      let error = ``
      error += `\n`
      error += ` .....................  ......\n`
      error += `  ..................   ......\n`
      error += `   ................  .......\n` 
      error += `     ......         ......\n`
      error += `      ..........  .......\n`
      error += `       ........  ......\n`   
      error += `                ......\n`
      error += `          ...........\n`
      error += `            .......\n`
      error += `             .....\n`
      error += `               .\n`
      error += `\n`
      error += `===============================\n`
      error += `${message}\n`
      error += `===============================\n`
      error += `\n`
      error += `Create a free API Key at:\n`
      error += `https://vueform.com/docs/installation#api-key\n`
      error += `\n`

      return error
    }

    install(appOrVue, options = {}) {
      const version = parseInt(appOrVue.version.split('.')[0])
      const minor = parseInt(appOrVue.version.split('.')[1])

      this.options.vueVersion = version


      const plugins = options.plugins || []
      
      plugins.forEach((p) => {
        if (typeof p === 'function') {
          p = p()
        }

        p = Array.isArray(p) ? p : [p]

        p.forEach((plugin) => {
          const pluginOptions = typeof plugin === 'function' ? plugin() : plugin

          if (pluginOptions.config) {
            pluginOptions.config(options)
          }
        })
      })

      if (options) {
        this.config(options)
      }

      this.options.plugins.forEach((p) => {
        if (typeof p === 'function') {
          p = p()
        }

        p = Array.isArray(p) ? p : [p]

        p.forEach((plugin) => {
          const pluginOptions = typeof plugin === 'function' ? plugin() : plugin
          
          if (pluginOptions.install) {
            pluginOptions.install(appOrVue, this.options)
          }
        })
      })

      if (typeof config.axios !== 'function') {
        this.initAxios()
      }
      
      this.initI18n()
      this.registerComponents(appOrVue)

      let themeTemplates = this.options.theme?.templates || {}

      Object.keys(themeTemplates).forEach((componentName) => {
        themeTemplates[componentName] = markRaw(themeTemplates[componentName])
      })

      let $vueform = ref({
        ...this.options,
        theme: {
          ...this.options.theme,
          templates: themeTemplates,
        }
      })

      switch (version) {
        case 2:
          appOrVue.config.ignoredElements = ['trix-editor']
          appOrVue.config.unwrapInjectedRef = true

          if (!appOrVue.prototype.$vueform) {
            appOrVue.prototype.$vueform = new Proxy($vueform, {
              get: (target, prop, receiver) => {
                return target.value[prop]
              }
            })
          }

          if (!appOrVue.__VUEFORM__) {
            appOrVue.__VUEFORM__ = true
            appOrVue.mixin({
              methods: {
                __: (expr, data) => {
                  if (!data) {
                    console.warn('DEPRECATED: __ method should be no longer used for translating labels, only if they contain variables. For general translation use form$.translation.TAG instead.')
                  }

                  return this.options.i18n.$t(expr, data)
                },
              },
            })
          }
          break

        case 3:
          if (minor < 3) {
            appOrVue.config.unwrapInjectedRef = true
          }

          appOrVue.config.globalProperties.$vueform = new Proxy($vueform, {
            get: (target, prop, receiver) => {
              return target.value[prop]
            }
          })
          appOrVue.provide('$vueform', $vueform)

          appOrVue.mixin({
            methods: {
              $set(obj, key, value) {
                obj[key] = value
              },
              $delete(obj, key) {
                delete obj[key]
              },
              __:  (expr, data) => {
                if (!data) {
                  console.warn('DEPRECATED: __ method should be no longer used for translating labels, only if they contain variables. For general translation use form$.translation.TAG instead.')
                }
                
                return this.options.i18n.$t(expr, data)
              },
            },
          })
          break
      }
    }
  }

  return new Vueform()
}
