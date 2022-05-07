import * as core from '@actions/core'
import * as github from '@actions/github'
import {Issues, closeIssue, createIssue, getIssueReactions} from './issues'
import {castToAnyMock, castToMock} from './test/type-utils'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'
import {getIssueUrlMessage} from './messages'

jest.mock('@actions/core')
const coreInfoMock = castToMock(core.info)

jest.mock('@actions/github')
const getOctokitMock = castToAnyMock(github.getOctokit)

jest.mock('./issues')
const createIssueMock = castToAnyMock(createIssue)
const getIssueReactionsMock = castToAnyMock(getIssueReactions)

describe('getConfirmationStatus()', () => {
  const issues = {someIssueStuff: 'ok'} as unknown as Issues
  const githubToken = 'some-token'

  beforeEach(async () => {
    getOctokitMock.mockReturnValue({rest: {issues}})
    createIssueMock.mockResolvedValue({
      data: {number: 510, html_url: 'http://some-issue-url'}
    })

    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn()
      return undefined as unknown as NodeJS.Timeout
    })
  })

  describe('always', () => {
    beforeEach(async () => {
      await getConfirmationStatus(githubToken)
    })

    it('gets octokit with correct token', () => {
      expect(getOctokitMock).toBeCalledWith(githubToken)
    })

    it('tries to create an issue', () => {
      expect(createIssue).toBeCalledWith(issues)
    })
  })

  describe('when creating an issue succeeds', () => {
    beforeEach(async () => {
      await getConfirmationStatus(githubToken)
    })

    it('logs link to the issue in CI console', () => {
      expect(coreInfoMock).toBeCalledWith(
        getIssueUrlMessage('http://some-issue-url')
      )
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

        result = await getConfirmationStatus(githubToken)
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

      result = await getConfirmationStatus(githubToken)
    })

    it('returns timeout confirmation status', () => {
      expect(result).toBe(ConfirmationStatus.Timeout)
    })

    it('polls issue reactions correct number of times', () => {
      expect(getIssueReactionsMock).toBeCalledTimes(120)
    })

    it('waits for 10 seconds on each retry', () => {
      expect(global.setTimeout).toBeCalledWith(expect.any(Function), 10000)
      expect(global.setTimeout).toBeCalledTimes(120)
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
        await getConfirmationStatus(githubToken)
      } catch (err) {
        error = err
      }
    })

    afterEach(() => {
      error = undefined
    })

    it('throws an error', () => {
      expect(error).toBeDefined()
    })

    it('does not poll issue reactions', () => {
      expect(getIssueReactionsMock).not.toBeCalled()
    })
  })
})
