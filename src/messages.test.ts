import {missingGithubTokenMessage} from './messages'

describe('messages', () => {
  describe('missingGithubTokenMessage()', () => {
    it('returns correct message', () => {
      expect(missingGithubTokenMessage()).toMatchSnapshot()
    })
  })
})
