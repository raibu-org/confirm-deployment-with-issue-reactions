import * as core from '@actions/core'
import {castToMock} from './test/type-utils'
import {logConfirmationIssueUrl} from './utils'

jest.mock('@actions/core')
const coreInfoMock = castToMock(core.info)

describe('utils', () => {
  describe('logConfirmationIssueUrl()', () => {
    beforeEach(() => {
      logConfirmationIssueUrl('http://putin-huilo.fuck')
    })

    it('logs issue url and explanation messages correctly', () => {
      expect(coreInfoMock).toBeCalledWith(
        'Opened issue http://putin-huilo.fuck'
      )
      expect(coreInfoMock).toBeCalledWith(
        'Confirm this step by reacting to the issue with 👍'
      )
      expect(coreInfoMock).toBeCalledWith(
        'To cancel this step react to the issue with 👎'
      )
    })
  })
})
