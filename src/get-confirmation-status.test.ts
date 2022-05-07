import * as core from '@actions/core'
import * as github from '@actions/github'
import {Issues, closeIssue, createIssue, getIssueReactions} from './issues'
import {castToAnyMock, castToMock} from './test/type-utils'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'

jest.mock('@actions/core')
const getInputMock = castToMock(core.getInput)

jest.mock('@actions/github')
const getOctokitMock = castToAnyMock(github.getOctokit)

jest.mock('./issues')
const createIssueMock = castToAnyMock(createIssue)
const getIssueReactionsMock = castToAnyMock(getIssueReactions)

describe('getConfirmationStatus()', () => {
  const issues = {someIssueStuff: 'ok'} as unknown as Issues

  beforeEach(async () => {
    getInputMock.mockReturnValue('someToken')
    getOctokitMock.mockReturnValue({rest: {issues}})
    createIssueMock.mockResolvedValue({data: {number: 510}})

    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn()
      return setTimeout(() => {})
    })
  })

  describe('always', () => {
    beforeEach(async () => {
      await getConfirmationStatus()
    })

    it('gets github token from action input', () => {
      expect(getInputMock).toBeCalledWith('githubToken')
    })

    it('gets octokit with correct token', () => {
      expect(getOctokitMock).toBeCalledWith('someToken')
    })

    it('tries to create an issue', () => {
      expect(createIssue).toBeCalledWith(issues)
    })
  })

  describe('when creating an issue succeeds', () => {
    beforeEach(async () => {
      await getConfirmationStatus()
    })

    it('tries to poll issue reactions', () => {
      expect(getIssueReactionsMock).toBeCalledWith(issues, 510)
    })
  })

  describe.each`
    description | reactions      | expectedStatus
    ${'👍'}     | ${{['+1']: 1}} | ${ConfirmationStatus.Confirmed}
    ${'👎'}     | ${{['-1']: 1}} | ${ConfirmationStatus.Canceled}
  `(
    'when issue reactions contain $description',
    ({reactions, expectedStatus}) => {
      let result: ConfirmationStatus

      beforeEach(async () => {
        getIssueReactionsMock.mockResolvedValue(reactions)

        result = await getConfirmationStatus()
      })

      it('closes the issue', () => {
        expect(closeIssue).toBeCalledWith(issues, 510)
      })

      it('returns correct confirmation status', () => {
        expect(result).toBe(expectedStatus)
      })
    }
  )

  describe('when issue reactions do not contain either 👍 or 👎 after all retries', () => {
    let result: ConfirmationStatus

    beforeEach(async () => {
      getIssueReactionsMock.mockResolvedValue({['+1']: 0, ['-1']: 0})

      result = await getConfirmationStatus()
    })

    it('returns correct timeout confirmation status', () => {
      expect(result).toBe(ConfirmationStatus.Timeout)
    })

    it('retries to poll the issue correct number of times', () => {
      expect(getIssueReactionsMock).toBeCalledTimes(120)
    })

    it('closes the issue', () => {
      expect(closeIssue).toBeCalledWith(issues, 510)
    })
  })

  describe('when creating an issue fails', () => {
    let error: unknown

    beforeEach(async () => {
      createIssueMock.mockRejectedValue('Some error')

      try {
        await getConfirmationStatus()
      } catch (err) {
        error = err
      }
    })

    afterEach(() => {
      error = undefined
    })

    it('tries to poll issue reactions', () => {
      expect(error).toBeDefined()
    })

    it('does not poll issue reactions', () => {
      expect(getIssueReactionsMock).not.toBeCalled()
    })
  })
})
