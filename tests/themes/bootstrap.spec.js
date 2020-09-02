import _ from 'lodash'
import { testThemeComponents, testThemeElements } from './../../src/utils/testHelpers'

describe('Bootstrap Theme', () => {
  it('should have all the components', () => {
    testThemeComponents('bootstrap', expect)
  })

  it('should have all the elements', () => {
    testThemeElements('bootstrap', expect)
  })
})