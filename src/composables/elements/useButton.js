import { toRefs, computed } from 'composition-api'

const base = function (props, context, dependencies)
{
  const {
    buttonLabel,
    buttonType,
    href,
    target,
    loading,
    onClick,
    resets,
    submits,
  } = toRefs(props)

  // ============ DEPENDENCIES ============

  const form$ = dependencies.form$
  const isDisabled = dependencies.isDisabled
  const el$ = dependencies.el$

  // ============== COMPUTED ==============

  /**
   * Whether the button is in loading state.
   * 
   * @type {boolean}
   */
  const isLoading = computed(() => {
    if (typeof loading.value === 'function') {
      return loading.value(form$.value, el$.value)
    }
    
    if (submits.value && (form$.value.submitting || form$.value.preparing || form$.value.isLoading)) {
      return true
    }
    
    return loading.value
  })

  /**
   * Whether the button's label is a component.
   * 
   * @type {boolean}
   * @private
   */
  const isButtonLabelComponent = computed(() => {
    return buttonLabel.value !== null && typeof buttonLabel.value === 'object'
  })

  /**
   * Attributes of the button.
   * 
   * @type {object}
   * @private
   */
  const button = computed(() => {
    const button = {}

    switch (buttonType.value) {
      case 'anchor':
        button.href = href.value
        button.target = target.value
        break

      case 'button':
        button.disabled = isDisabled.value
        break
    }

    if (isLoading.value) {
      button.tabindex = undefined
    }

    return button
  })

  // =============== METHODS ==============

  /**
   * Handles the button's click event.
   *
   * @param {Event} e* event
   * @returns {void}
   * @private
   */
  const handleClick = (e) => {
    if (!href.value) {
      e.preventDefault()
    }

    if (isDisabled.value || isLoading.value) {
      e.preventDefault()
      return
    }

    if (resets.value) {
      form$.value.reset()
    }

    if (submits.value) {
      form$.value.submit()
    }

    if (typeof onClick.value == 'function') {
      onClick.value(form$.value)
    }
  }

  return {
    isButtonLabelComponent,
    button,
    isLoading,
    handleClick,
  }
}

export default base