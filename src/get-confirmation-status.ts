import * as core from '@actions/core'
import * as github from '@actions/github'
import {Issues, closeIssue, createIssue, getIssueReactions} from './issues'
import {logConfirmationIssueUrl} from './utils'

const second = 1000
const minute = 60 * 1000
const timeout = 20 * minute
const retryInterval = 10 * second

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

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getConfirmationStatus = async () => {
  const token = core.getInput('githubToken')
  const octokit = github.getOctokit(token)
  const {
    rest: {issues}
  } = octokit

  const {
    data: {number, html_url}
  } = await createIssue(issues)

  for (let i = 0; i < timeout / retryInterval; i++) {
    await wait(retryInterval)

    const confirmationStatus = await getStatusFromIssueReactions(issues, number)

    logConfirmationIssueUrl(html_url)

    if (
      confirmationStatus === ConfirmationStatus.Confirmed ||
      confirmationStatus === ConfirmationStatus.Cancelled
    ) {
      await closeIssue(issues, number)

      return confirmationStatus
    }
  }

  await closeIssue(issues, number)

  return ConfirmationStatus.Timeout
}

export default getConfirmationStatus
