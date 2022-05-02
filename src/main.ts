import * as core from '@actions/core'
import * as github from '@actions/github'
// eslint-disable-next-line import/no-unresolved
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'

type ConfirmationStatus = 'confirmed' | 'cancelled' | 'timeout' | 'pending'

const getConfirmationStatus = async (
  issues: Api['rest']['issues'],
  issueNumber: number
): Promise<ConfirmationStatus> => {
  const {
    context: {repo}
  } = github
  const issue = await issues.get({
    ...repo,
    issue_number: issueNumber
  })
  const {
    data: {reactions}
  } = issue

  if (reactions?.['+1']) {
    return 'confirmed'
  }

  if (reactions?.['-1']) {
    return 'cancelled'
  }

  return 'pending'
}

const closeIssue = async (
  issues: Api['rest']['issues'],
  number: number
): Promise<void> => {
  const {
    context: {repo}
  } = github

  await issues.update({...repo, issue_number: number, state: 'closed'})

  core.info(`Closed issue #${number}`)
}

const run = async (): Promise<void> => {
  try {
    const token = core.getInput('githubToken')
    const octokit = github.getOctokit(token)
    const {
      context: {repo}
    } = github
    const {
      rest: {issues}
    } = octokit
    const {GITHUB_SHA, GITHUB_RUN_ID} = process.env
    const commitSha = GITHUB_SHA?.substring(0, 7)

    const {
      data: {number, html_url}
    } = await issues.create({
      ...repo,
      title: `🌺 Confirm deployment of ${commitSha}`,
      body: `The confirmation step has been requested by run https://github.com/humanizmu/frontend/actions/runs/${GITHUB_RUN_ID}

Related commit ${commitSha}

To confirm this step react to this issue with 👍
To cancel this step react to the issue with 👎`
    })

    const interval = setInterval(async () => {
      const confirmationStatus = await getConfirmationStatus(issues, number)

      core.info(`Opened issue ${html_url}`)
      core.info(`Confirm this step by reacting to the issue with 👍`)
      core.info('To cancel this step react to the issue with 👎')

      if (confirmationStatus === 'confirmed') {
        clearInterval(interval)

        core.info('Confirmed')

        await closeIssue(issues, number)
      } else if (confirmationStatus === 'cancelled') {
        await closeIssue(issues, number)

        core.info(`Closed issue #${number}`)
        throw new Error('Cancelled')
      }
    }, 10000)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
