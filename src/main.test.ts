import * as core from '@actions/core'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'
import {castToMock} from './test/type-utils'
import {missingGithubTokenMessage} from './messages'
import {run} from './main'

jest.mock('@actions/core')
const getInputMock = castToMock(core.getInput)

jest.mock('./get-confirmation-status')

const getConfirmationStatusMock = castToMock(getConfirmationStatus)

describe('main', () => {
  describe('run()', () => {
    const githubToken = 'some token'

    describe('always', () => {
      beforeEach(async () => {
        getConfirmationStatusMock.mockResolvedValue(
          ConfirmationStatus.Confirmed
        )
        await run()
      })

      it('gets github token from action input', () => {
        expect(getInputMock).toBeCalledWith('githubToken')
      })
    })

    describe('when github token is not provided', () => {
      beforeEach(async () => {
        getInputMock.mockReturnValue('')
        await run()
      })

      it('fails the action with correct error message', () => {
        expect(core.setFailed).toBeCalledWith(missingGithubTokenMessage())
      })

      it('does not call getConfirmationStatus', () => {
        expect(getConfirmationStatusMock).not.toBeCalled()
      })
    })

    describe('when github token is provided', () => {
      beforeEach(() => {
        getInputMock.mockReturnValue(githubToken)
      })

      describe('always', () => {
        beforeEach(async () => {
          await run()
        })

        it('calls getConfirmationStatus with correct params', () => {
          expect(getConfirmationStatusMock).toBeCalledWith(githubToken)
        })
      })

      describe('when confirmation status is "confirmed"', () => {
        beforeEach(async () => {
          getConfirmationStatusMock.mockResolvedValue(
            ConfirmationStatus.Confirmed
          )
          await run()
        })

        it('logs correct info message', () => {
          expect(core.info).toBeCalledWith('Confirmed by user')
        })
      })

      describe.each`
        confirmationStatus             | expectedErrorMessage
        ${ConfirmationStatus.Canceled} | ${'Canceled by user'}
        ${ConfirmationStatus.Timeout}  | ${'Canceled due to timeout'}
      `(
        'when confirmation status is "$confirmationStatus"',
        ({confirmationStatus, expectedErrorMessage}) => {
          beforeEach(async () => {
            getConfirmationStatusMock.mockResolvedValue(confirmationStatus)
            await run()
          })

          it('fails action with correct message', () => {
            expect(core.setFailed).toBeCalledWith(expectedErrorMessage)
          })
        }
      )

      describe('when getConfirmation status throws an error', () => {
        beforeEach(async () => {
          getConfirmationStatusMock.mockRejectedValue('Some error')
          await run()
        })

        it('fails action with correct message', () => {
          expect(core.setFailed).toBeCalledWith('Unknown error')
        })
      })
    })
  })
})
