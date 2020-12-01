import { createForm } from 'test-helpers'

export const empty = function(elementType, elementName) {
  it('should have `empty` "true" if current language\'s value is empty', async () => {
    let form = createForm({
      language: 'en',
      languages: {
        en: {
          label: 'English',
          code: 'en'
        },
        fr: {
          label: 'French',
          code: 'fr'
        },
      },
      schema: {
        el: {
          type: elementType,
        }
      }
    })

    let el = form.vm.el$('el')

    expect(el.empty).toBe(true)

    el.update({
      en: 'value'
    })
    
    expect(el.empty).toBe(false)
  })
}