import * as core from '@actions/core'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'

export const run = async (): Promise<void> => {
  try {
    const confirmationStatus = await getConfirmationStatus()

    switch (confirmationStatus) {
      case ConfirmationStatus.Confirmed: {
        core.info('Confirmed by user')
        break
      }
      case ConfirmationStatus.Cancelled: {
        core.setFailed('Cancelled by user')
        break
      }
      case ConfirmationStatus.Timeout: {
        core.setFailed('Canceled due to timeout')
        break
      }
    }
  } catch (error) {
    core.setFailed('Unknown error')
  }
}

run()
