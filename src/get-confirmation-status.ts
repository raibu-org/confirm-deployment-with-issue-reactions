import * as core from '@actions/core'
import * as github from '@actions/github'
import {Issues, closeIssue, createIssue, getIssueReactions} from './issues'
import {logConfirmationIssueUrl} from './utils'

// eslint-disable-next-line no-shadow
export enum ConfirmationStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Timeout = 'timeout',
  Pending = 'pending'
}

const getStatusFromIssueReactions = async (
  issues: Issues,
  issueNumber: number
): Promise<ConfirmationStatus> => {
  const reactions = await getIssueReactions(issues, issueNumber)

  if (reactions?.['+1']) {
    return ConfirmationStatus.Confirmed
  }

  if (reactions?.['-1']) {
    return ConfirmationStatus.Cancelled
  }

  return ConfirmationStatus.Pending
}

const getConfirmationStatus = async () =>
  new Promise(async resolve => {
    const token = core.getInput('githubToken')
    const octokit = github.getOctokit(token)
    const {
      rest: {issues}
    } = octokit

    const {
      data: {number, html_url}
    } = await createIssue(issues)

    const interval = setInterval(async () => {
      const confirmationStatus = await getStatusFromIssueReactions(
        issues,
        number
      )

      logConfirmationIssueUrl(html_url)

      if (
        confirmationStatus === ConfirmationStatus.Confirmed ||
        confirmationStatus === ConfirmationStatus.Cancelled
      ) {
        clearInterval(interval)

        await closeIssue(issues, number)

        resolve(confirmationStatus)
      }
    }, 10000)
  })

export default getConfirmationStatus
