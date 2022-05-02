import * as core from '@actions/core'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'

const run = async (): Promise<void> => {
  try {
    const confirmationStatus = await getConfirmationStatus()

    if (confirmationStatus === ConfirmationStatus.Cancelled) {
      core.setFailed('Cancelled by user')
    }
  } catch (error) {
    core.setFailed('Unknown error')
  }
}

run()
