import * as core from '@actions/core'
import getConfirmationStatus, {
  ConfirmationStatus
} from './get-confirmation-status'
import {getMissingGithubTokenMessage} from './messages'

export const run = async (): Promise<void> => {
  try {
    const githubToken = core.getInput('githubToken')

    if (!githubToken) {
      core.setFailed(getMissingGithubTokenMessage())
      return
    }

    const confirmationStatus = await getConfirmationStatus(githubToken)

    switch (confirmationStatus) {
      case ConfirmationStatus.Confirmed: {
        core.info('Confirmed by user')
        break
      }
      case ConfirmationStatus.Canceled: {
        core.setFailed('Canceled by user')
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
