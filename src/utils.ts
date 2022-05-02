import * as core from '@actions/core'

export const logConfirmationIssueUrl = (issueUrl: string) => {
  core.info(`Opened issue ${issueUrl}`)
  core.info(`Confirm this step by reacting to the issue with 👍`)
  core.info('To cancel this step react to the issue with 👎')
}
