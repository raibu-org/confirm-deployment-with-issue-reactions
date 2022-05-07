import * as core from '@actions/core'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'
import {castToMock} from './test/type-utils'
import {run} from './main'

jest.mock('@actions/core')
jest.mock('./get-confirmation-status')

const getConfirmationStatusMock = castToMock(getConfirmationStatus)

describe('main', () => {
  describe('run()', () => {
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
