const base = function(props, context, dependencies)
{
  // ============ DEPENDENCIES ============
  
  const fire = dependencies.fire
  const listeners = dependencies.listeners

  // =============== METHODS ==============

  /**
   * Handles `alert` event.
   *
   * @param {string} message* alert message
   * @returns {void}
   * @private
   */
  const handleAlert = (message) => {
    fire('alert', message)

    if (!listeners.value.error) {
      alert(message)
    } 
  }


  return {
    handleAlert,
  }
}

export default base