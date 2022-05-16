import * as core from '@actions/core'
import * as github from '@actions/github'
import {Issues, closeIssue, createIssue, getIssueReactions} from './issues'
import {castToMock} from './test/type-utils'

jest.mock('@actions/github', () => ({
  context: {
    payload: {
      repository: {
        url: 'http://putin.huilo'
      }
    },
    repo: {
      someRepoData: 'putin huilo'
    }
  }
}))

jest.mock('@actions/core')
const coreInfoMock = castToMock(core.info)

const castToIssues = <T>(issuesMock: T) => issuesMock as unknown as Issues

describe('issues', () => {
  describe('getIssueReactions()', () => {
    const reactions = {['+1']: 1}
    const issue = {data: {reactions}}
    const getIssuesMock = jest.fn().mockResolvedValue(issue)
    const mockIssues = castToIssues({get: getIssuesMock})

    let result: unknown

    beforeEach(async () => {
      result = await getIssueReactions(mockIssues, 2)
    })

    it('makes a correct call to get issues endpoint', () => {
      expect(getIssuesMock).toBeCalledWith({
        issue_number: 2,
        ...github.context.repo
      })
    })

    it('returns issue reactions', () => {
      expect(result).toEqual(reactions)
    })
  })

  describe('createIssue()', () => {
    const issueData = {someIssueProp: 'ok'}
    const createIssueMock = jest.fn().mockResolvedValue(issueData)
    const mockIssues = castToIssues({create: createIssueMock})

    let result: unknown
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(async () => {
      originalEnv = process.env
      process.env = {
        ...originalEnv,
        GITHUB_SHA: '1234567890',
        GITHUB_RUN_ID: 'some-run-id'
      }

      result = await createIssue(mockIssues)
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('makes a correct call to create issue endpoint', () => {
      expect(createIssueMock.mock.calls[0][0]).toMatchSnapshot()
    })

    it('returns issue number', () => {
      expect(result).toEqual(issueData)
    })
  })

  describe('closeIssue()', () => {
    const updateIssueMock = jest.fn().mockResolvedValue(undefined)
    const mockIssues = castToIssues({update: updateIssueMock})

    describe('always', () => {
      beforeEach(async () => {
        await closeIssue(mockIssues, 2)
      })

      it('makes a correct request to update issue endpoint', () => {
        expect(updateIssueMock).toBeCalledWith({
          ...github.context.repo,
          issue_number: 2,
          state: 'closed'
        })
      })
    })

    describe('when issue update request succeeds', () => {
      beforeEach(async () => {
        await closeIssue(mockIssues, 2)
      })

      it('logs correct message', () => {
        expect(coreInfoMock).toBeCalledWith('Closed issue #2')
      })
    })

    describe('when issue update request fails', () => {
      beforeEach(async () => {
        updateIssueMock.mockRejectedValue(undefined)
        try {
          await closeIssue(mockIssues, 2)
          // eslint-disable-next-line no-empty
        } catch {}
      })

      it('does not log a message', () => {
        expect(coreInfoMock).not.toBeCalled()
      })
    })
  })
})
