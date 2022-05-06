import * as core from '@actions/core'
import {castToMock} from './test/type-utils'
import {logConfirmationIssueUrl} from './utils'

jest.mock('@actions/core')
const coreInfoMock = castToMock(core.info)

describe('utils', () => {
  describe('logConfirmationIssueUrl()', () => {
    beforeEach(() => {
      logConfirmationIssueUrl('http://putin.huilo')
    })

    it('logs issue url and explanation messages correctly', () => {
      expect(coreInfoMock.mock.calls).toMatchSnapshot()
    })
  })
})
