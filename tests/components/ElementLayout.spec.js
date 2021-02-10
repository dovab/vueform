import { createForm, findAllComponents} from 'test-helpers'
import useElementComponent from './../composables/useElementComponent'

describe('ElementLayout', () => {
  let form = createForm({
    schema: {
      el: {
        type: 'text',
      }
    }
  })

  let el = form.vm.el$('el')
  let Layout = findAllComponents(form, { name: 'ElementLayout' }).at(0)

  useElementComponent('text', 'ElementLayout', { class: 'element-class' }, {
    mergeWith: {
      [Layout.vm.containers.element]: `${el.columns.classes.element} ${el.classes[el.mainClass]} element-class`,
      [Layout.vm.containers.label]: el.columns.classes.label,
      [Layout.vm.containers.field]: el.columns.classes.field,
    }
  })

  describe('rendering', () => {
    it('should render label if config.labels is false, but element has label', () => {
      let form = createForm({
        schema: {
          name: {
            type: 'text',
            label: 'Name'
          }
        }
      }, {
        config: {
          labels: false,
        }
      })

      expect(form.findComponent({name:'ElementLabel'}).exists()).toBe(true)
    })

    it('should not render label if config.labels is false and element does not have label', () => {
      let form = createForm({
        schema: {
          name: {
            type: 'text',
          }
        }
      }, {
        config: {
          labels: false,
        }
      })

      expect(form.findComponent({name:'ElementLabel'}).exists()).toBe(false)
    })

    it('should render label if config.labels is true, but element does not have label', () => {
      let form = createForm({
        schema: {
          name: {
            type: 'text',
          }
        }
      }, {
        config: {
          labels: true,
        }
      })
      
      expect(form.findComponent({name:'ElementLabel'}).exists()).toBe(true)
    })

    it('should render label if config.labels is true, but element does have label', () => {
      let form = createForm({
        schema: {
          name: {
            type: 'text',
            label: 'Name'
          }
        }
      }, {
        config: {
          labels: true,
        }
      })
      
      expect(form.findComponent({name:'ElementLabel'}).exists()).toBe(true)
    })

    it('should render decorators', () => {
      let form = createForm({
        schema: {
          name: {
            type: 'text',
            label: 'label',
            info: '<div>info</div>',
            description: '<div>description</div>',
            before: '<div>before</div>',
            after: '<div>after</div>',
            between: '<div>between</div>',
          }
        }
      })

      
      expect(form.findComponent({ name: 'ElementInfo' }).html()).toContain('<div>info</div>')
      expect(form.findComponent({ name: 'ElementDescription' }).html()).toContain('<div>description</div>')
      expect(findAllComponents(form, { name: 'ElementText' }).at(0).html()).toContain('<div>before</div>')
      expect(findAllComponents(form, { name: 'ElementText' }).at(1).html()).toContain('<div>between</div>')
      expect(findAllComponents(form, { name: 'ElementText' }).at(2).html()).toContain('<div>after</div>')
    })
  })
})