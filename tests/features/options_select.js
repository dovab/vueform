import { createForm, testPropDefault, destroy } from 'test-helpers'
import { nextTick } from 'composition-api'

export const isNative = function (elementType, elementName, options) {
  it('should have `isNative` "true" if "native" is true and "search" is false', async () => {
    let form = createForm({
      schema: {
        el: {
          type: elementType,
        }
      }
    })

    let el = form.vm.el$('el')
    
    expect(el.isNative).toBe(true)

    el.$set(form.vm.vueform.schema.el, 'native', false)
    await nextTick()
    expect(el.isNative).toBe(false)

    el.$set(form.vm.vueform.schema.el, 'native', true)
    el.$set(form.vm.vueform.schema.el, 'search', true)
    await nextTick()
    expect(el.isNative).toBe(false)

    // destroy() // teardown
  })
}

export const fieldOptions = function (elementType, elementName, options) {
  it('should have default `fieldOptions`', () => {
    let form = createForm({
      schema: {
        el: {
          type: elementType,
        }
      }
    })

    let el = form.vm.el$('el')

    expect(el.fieldOptions).toStrictEqual({
      mode: 'single',
      searchable: el.search,
      noOptionsText: el.__('vueform.multiselect.noOptions'),
      noResultsText: el.__('vueform.multiselect.noResults'),
      label: el.labelProp,
      trackBy: el.trackBy,
      valueProp: el.valueProp,
      limit: el.limit,
      caret: el.caret,
      loading: el.isLoading,
      object: el.object,
      delay: el.delay,
      minChars: el.minChars,
      resolveOnLoad: el.resolveOnLoad,
      filterResults: el.filterResults,
      clearOnSearch: el.clearOnSearch,
      canDeselect: el.canDeselect,
      canClear: el.canClear,
      openDirection: el.openDirection,
      strict: el.strict,
      closeOnSelect: el.closeOnSelect,
      autocomplete: el.autocomplete,
      groups: el.groups,
      groupLabel: el.groupLabel,
      groupOptions: el.groupOptions,
      groupHideEmpty: el.groupHideEmpty,
      inputType: el.inputType,
    })
  })
  
  it('should extend `fieldOptions` from schema', () => {
    let form = createForm({
      schema: {
        el: {
          type: elementType,
          extendOptions: {
            custom: 'option'
          }
        }
      }
    })

    let el = form.vm.el$('el')

    expect(el.fieldOptions).toStrictEqual({
      mode: 'single',
      searchable: el.search,
      noOptionsText: el.__('vueform.multiselect.noOptions'),
      noResultsText: el.__('vueform.multiselect.noResults'),
      label: el.labelProp,
      trackBy: el.trackBy,
      valueProp: el.valueProp,
      limit: el.limit,
      caret: el.caret,
      loading: el.isLoading,
      object: el.object,
      delay: el.delay,
      minChars: el.minChars,
      resolveOnLoad: el.resolveOnLoad,
      filterResults: el.filterResults,
      clearOnSearch: el.clearOnSearch,
      canDeselect: el.canDeselect,
      canClear: el.canClear,
      openDirection: el.openDirection,
      strict: el.strict,
      closeOnSelect: el.closeOnSelect,
      autocomplete: el.autocomplete,
      groups: el.groups,
      groupLabel: el.groupLabel,
      groupOptions: el.groupOptions,
      groupHideEmpty: el.groupHideEmpty,
      inputType: el.inputType,
      custom: 'option'
    })
  })
  
  it('should bind `options` to Multiselect when not native', () => {
    let form = createForm({
      schema: {
        el: {
          type: elementType,
          native: false,
        }
      }
    })

    let el = form.vm.el$('el')
    let elWrapper = findAllComponents(form, { name: elementName }).at(0)
    let Multiselect = findAllComponents(elWrapper, { name: 'Multiselect' }).at(0)

    _.each(el.fieldOptions, (value, key) => {
      expect(Multiselect.props(key)).toStrictEqual(value)
    })

    // destroy() // teardown
  })
}