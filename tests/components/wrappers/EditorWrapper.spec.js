import { createLocalVue, mount } from '@vue/test-utils'
import { createForm, findAllComponents, installVueform, createElement } from 'test-helpers'
import { markRaw, nextTick } from 'composition-api'
import TrixEditor from './../../mocks/TrixEditor'
import flushPromises from 'flush-promises'
import defaultTheme from './../../../src/themes/default'

const createEditor = (details) => {
  const originalConsoleError = console.error

  console.error = (e) => { if (!e.toString().includes('Unknown custom element: <trix-editor>')) throw new Error(e) }

  defaultTheme.templates.EditorWrapper.components = {
    TrixEditor: markRaw(TrixEditor)
  }

  let form = createForm(details, {
    config: {
      themes: {
        default: defaultTheme,
      }
    }
  })
  
  console.error = originalConsoleError

  return form
}

describe('Editor Element Rendering', () => {
  it('should set `contentEditable` false when `disabled`', async () => {
    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          disabled: true
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(editorInstnace$.contentEditable).toBe(false)
  })

  it('should update `contentEditable` when `disabled` changes', async () => {
    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(editorInstnace$.contentEditable).toBe(true)

    a.vm.disable()

    await nextTick()

    expect(editorInstnace$.contentEditable).toBe(false)
  })

  it('should `update` editor value', async () => {
    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(editorInstnace$.value).toBe(null)

    a.vm.update('<div>aaa</div>')
    await nextTick()
    expect(editorInstnace$.value).toBe('<div>aaa</div>')
  })

  it('should set editor options with `setOption`', async () => {
    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    editor$.setOption('option', 'value')
    expect(editorInstnace$.option).toBe('value')
  })

  it('should update element value with `handleChange`', async () => {
    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(a.vm.value).toBe(null)
    expect(editorInstnace$.value).toBe(null)

    editorInstnace$.value = '<div>aaa</div>'
    editor$.handleChange()

    expect(a.vm.value).toBe('<div>aaa</div>')
  })

  it('should trigger element\'s `change` event on `handleChange`', async () => {
    let onChangeMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          onChange: onChangeMock
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onChangeMock.mock.calls.length).toBe(0)

    editorInstnace$.value = '<div>aaa</div>'
    editor$.handleChange()

    await nextTick()

    expect(onChangeMock.mock.calls.length).toBe(1)
    expect(onChangeMock.mock.calls[0][0]).toBe('<div>aaa</div>')
    expect(onChangeMock.mock.calls[0][1]).toBe(null)
  })

  it('should not trigger `error` event when mime type is allowed', async () => {
    let onErrorMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          onError: onErrorMock,
          acceptMimes: ['image/jpeg', 'image/png']
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onErrorMock.mock.calls.length).toBe(0)

    let fileMock = {
      type: 'image/jpeg',
      name: 'image.jpg',
    }

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      file: fileMock,
      preventDefault: preventMock
    })
    
    await nextTick()

    expect(onErrorMock.mock.calls.length).toBe(0)
    expect(preventMock.mock.calls.length).toBe(0)
  })

  it('should trigger `alert` event when mime type is not allowed', async () => {
    let onAlertMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          onAlert: onAlertMock,
          acceptMimes: ['image/jpeg', 'image/png']
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()

    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onAlertMock.mock.calls.length).toBe(0)

    let fileMock = {
      type: 'image/gif',
      name: 'image.gif',
    }

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      file: fileMock,
      preventDefault: preventMock
    })

    await nextTick()

    expect(onAlertMock.mock.calls.length).toBe(1)
    expect(onAlertMock.mock.calls[0][0]).toContain('image/jpeg')
    expect(onAlertMock.mock.calls[0][0]).toContain('image/png')
    expect(preventMock.mock.calls.length).toBe(1)
  })

  it('should not trigger `error` event when extension is allowed', async () => {
    let onErrorMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          onError: onErrorMock,
          accept: ['jpg', 'png']
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onErrorMock.mock.calls.length).toBe(0)

    let fileMock = {
      type: 'image/jpeg',
      name: 'image.jpg',
    }

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      file: fileMock,
      preventDefault: preventMock
    })
    await nextTick()

    expect(onErrorMock.mock.calls.length).toBe(0)
    expect(preventMock.mock.calls.length).toBe(0)
  })

  it('should trigger `alert` event when mime type is not allowed', async () => {
    let onAlertMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          onAlert: onAlertMock,
          accept: ['.jpg', '.png']
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onAlertMock.mock.calls.length).toBe(0)

    let fileMock = {
      type: 'image/gif',
      name: 'image.gif',
    }

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      file: fileMock,
      preventDefault: preventMock
    })
    await nextTick()

    expect(onAlertMock.mock.calls.length).toBe(1)
    expect(onAlertMock.mock.calls[0][0]).toContain('jpg')
    expect(onAlertMock.mock.calls[0][0]).toContain('png')
    expect(preventMock.mock.calls.length).toBe(1)
  })

  it('should prevent file accept if disabled', async () => {
    let onErrorMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
          disabled: true
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onErrorMock.mock.calls.length).toBe(0)

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      preventDefault: preventMock
    })
    await nextTick()

    expect(preventMock.mock.calls.length).toBe(1)
  })

  it('should prevent file accept if file does not exist', async () => {
    let onErrorMock = jest.fn()

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(onErrorMock.mock.calls.length).toBe(0)

    let preventMock = jest.fn()

    editor$.handleFileAccept({
      preventDefault: preventMock
    })
    await nextTick()

    expect(preventMock.mock.calls.length).toBe(1)
  })

  it('should return in `handleAttachmentAdd` if file does not exist', async () => {
    let axiosPostMock = jest.fn()

    let axiosMock = {
      post: axiosPostMock,
    }

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    form.vm.$vueform.services.axios = axiosMock

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$


    editor$.handleAttachmentAdd({
      attachment: {}
    })
    await nextTick()

    expect(axiosPostMock.mock.calls.length).toBe(0)
  })

  it('should throw error in `handleAttachmentAdd` if endpoint does not exist', async () => {
    let axiosPostMock = jest.fn()

    let axiosMock = {
      post: axiosPostMock,
    }

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    form.vm.$vueform.services.axios = axiosMock

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    form.vm.$set(form.vm.vueform.schema.a, 'endpoint', null)

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    expect(() => {
      const originalConsoleError = console.error

      console.error = (e) => {  }

      editor$.handleAttachmentAdd({
        attachment: {
          file: {}
        }
      })

      console.error = originalConsoleError
    }).toThrowError()
  })

  it('should call axios.post on `handleAttachmentAdd`', async () => {
    let axiosPostMock = jest.fn(() => {
      return new Promise((resolve, reject) => {
        setTimeout(function(){
          resolve({
            data: {
              url: 'url',
              href: 'href',
            }
          })
        }, 1)
      })
    })

    let axiosMock = {
      post: axiosPostMock,
    }

    let form = createEditor({
      schema: {
        a: {
          type: 'editor',
        }
      }
    })

    let a = findAllComponents(form, { name: 'EditorElement' }).at(0)

    a.vm.$vueform.services.axios = axiosMock

    await nextTick()
    let editor$ = a.vm.input
    let editorInstnace$ = a.vm.input.$refs.editor$

    editor$.handleAttachmentAdd({
      attachment: {
        file: {},
        setUploadProgress: jest.fn()
      }
    })

    await nextTick()

    expect(axiosPostMock.mock.calls.length).toBe(1)
  })
})