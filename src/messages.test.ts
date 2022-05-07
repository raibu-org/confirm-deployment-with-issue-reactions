import {getIssueUrlMessage, getMissingGithubTokenMessage} from './messages'

describe('messages', () => {
  describe('missingGithubTokenMessage()', () => {
    it('returns correct message', () => {
      expect(getMissingGithubTokenMessage()).toMatchSnapshot()
    })
  })

  describe('issueUrlMessage', () => {
    it('returns correct message', () => {
      expect(getIssueUrlMessage('http://some-issue-url')).toMatchSnapshot()
    })
  })
})
