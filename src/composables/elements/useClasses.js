import { computed, toRefs } from 'composition-api'
import { mergeComponentClasses } from './../../utils/mergeClasses'

const base = function(props, context, dependencies, options = {})
{
  const {
    addClasses,
    overrideClasses,
    addClass
  } = toRefs(props)
  
  const componentName = context.name

  // ============ DEPENDENCIES ============

  const form$ = dependencies.form$
  const theme = dependencies.theme

  // ================ DATA ================

  /**
  * 
  * 
  * @type {object} 
  */
  const defaultClasses = toRefs(context.data).defaultClasses

  // ============== COMPUTED ==============
  
  /**
  * Class of the element's outermost DOM. Can use Vue syntaxes (string, array, object).
  * 
  * @type {string}
  */
  const mainClass = computed(() => {
    return _.keys(defaultClasses.value)[0]
  })

  /**
   * Returns the final classes of the components within the element.
   * 
   * @type {object}
   * @option
   */
  const classes = computed(() => {
    let classes = _.merge({},
      // Default component classes
      defaultClasses.value,

      // Theme / form level overwrites
      theme.value.classes[componentName.value] || {},

      // Element level overwrites
      overrideClasses.value[componentName.value] || {}
    )

    // Add classes defined by specific elements
    if (options.addClasses) {
      options.addClasses.forEach((add) => {
        if (add[2].value) {
          classes = mergeComponentClasses(classes, {
            [add[0]]: typeof add[1] == 'object' ? add[1].value : classes[add[1]],
          })
        }
      })
    }

    // Add form's addClasses
    if (form$.value.options.addClasses[componentName.value] !== undefined) {
      classes = mergeComponentClasses(classes, form$.value.options.addClasses[componentName.value] || null)
    }
    
    // Add element's addClasses options
    classes = mergeComponentClasses(classes, addClasses.value[componentName.value] || null)
    
    // Add element's class to main class
    if (addClass.value) {
      classes = mergeComponentClasses(classes, {
        [mainClass.value]: addClass.value
      })
    }

    return classes
  })

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const input = function(props, context, dependencies)
{
  const {
    mainClass,
    classes,
    defaultClasses,
  } = base(props, context, dependencies, {
    addClasses: [
      ['input', 'inputEnabled', computed(() => !isDisabled.value)],
      ['input', 'inputDisabled', computed(() => isDisabled.value)],
    ]
  })

  // ============ DEPENDENCIES ============

  const isDisabled = dependencies.isDisabled

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const list = function(props, context, dependencies)
{
  const {
    mainClass,
    classes,
    defaultClasses,
  } = base(props, context, dependencies, {
    addClasses: [
      ['list', 'listDisabled', computed(() => isDisabled.value)],
      ['list', 'listSorting', computed(() => sorting.value)],
    ]
  })

  // ============ DEPENDENCIES ============

  const isDisabled = dependencies.isDisabled
  const sorting = dependencies.sorting

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const multifile = function(props, context, dependencies)
{
  const {
    view,
  } = toRefs(props)

  const {
    mainClass,
    classes,
    defaultClasses,
  } = base(props, context, dependencies, {
    addClasses: [
      ['list', 'listDefault', computed(() => view.value !== 'gallery')],
      ['list', 'listGallery', computed(() => view.value === 'gallery')],
      ['list', 'listSorting', computed(() => sorting.value)],
      ['list', 'listDisabled', computed(() => isDisabled.value)],
      ['listItem', 'listItemDefault', computed(() => view.value !== 'gallery')],
      ['listItem', 'listItemGallery', computed(() => view.value === 'gallery')],
      ['handle', 'handleDefault', computed(() => view.value !== 'gallery')],
      ['handle', 'handleGallery', computed(() => view.value === 'gallery')],
      ['button', 'buttonEnabled', computed(() => !isDisabled.value && !preparing.value)],
      ['button', 'buttonDisabled', computed(() => isDisabled.value || preparing.value)],
    ]
  })

  // ============ DEPENDENCIES ============

  const isDisabled = dependencies.isDisabled
  const sorting = dependencies.sorting
  const preparing = dependencies.preparing

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const file = function(props, context, dependencies)
{
  const {
    defaultClasses,
    mainClass,
    classes,
  } = base(props, context, dependencies, {
    addClasses: [
      ['container', 'containerRemoving', computed(() => removing.value)],
      ['button', 'buttonEnabled', computed(() => !isDisabled.value && !preparing.value)],
      ['button', 'buttonDisabled', computed(() => isDisabled.value || preparing.value)],
    ]
  })

  // ============ DEPENDENCIES ============

  const removing = dependencies.removing
  const isDisabled = dependencies.isDisabled
  const preparing = dependencies.preparing

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const button = function(props, context, dependencies)
{
  const {
    buttonClass,
  } = toRefs(props)

  const {
    mainClass,
    classes,
    defaultClasses,
  } = base(props, context, dependencies, {
    addClasses: [
      ['button', 'buttonLoading', computed(() => isLoading.value)],
      ['button', 'buttonEnabled', computed(() => !isDisabled.value && !isLoading.value)],
      ['button', 'buttonDisabled', computed(() => isDisabled.value)],
      ['button', buttonClass, buttonClass],
    ]
  })

  // ============ DEPENDENCIES ============

  const isLoading = dependencies.isLoading
  const isDisabled = dependencies.isDisabled

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

const trix = function(props, context, dependencies)
{
  const {
    mainClass,
    classes,
    defaultClasses,
  } = base(props, context, dependencies, {
    addClasses: [
      ['input', 'inputEnabled', computed(() => !isDisabled.value)],
      ['input', 'inputDisabled', computed(() => isDisabled.value)],
      ['input', 'inputFocused', computed(() => focused.value)],
    ]
  })

  // ============ DEPENDENCIES ============

  const isDisabled = dependencies.isDisabled
  const focused = dependencies.focused

  return {
    classes,
    mainClass,
    defaultClasses,
  }
}

export {
  input,
  list,
  file,
  button,
  multifile,
  trix,
}

export default base