import * as core from '@actions/core'
import * as github from '@actions/github'
// eslint-disable-next-line import/no-unresolved
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'

export type Issues = Api['rest']['issues']

export const getIssueReactions = async (
  issues: Issues,
  issueNumber: number
) => {
  const issue = await issues.get({
    ...github.context.repo,
    issue_number: issueNumber
  })

  return issue.data.reactions
}

export const createIssue = (issues: Issues) => {
  const {GITHUB_SHA, GITHUB_RUN_ID} = process.env
  const commitSha = GITHUB_SHA?.substring(0, 7)

  console.log(github.context)
  console.log('', github.context.repo)

  return issues.create({
    ...github.context.repo,
    title: `🌺 Confirm deployment of ${commitSha}`,
    body: `The confirmation step has been requested by run https://github.com/humanizmu/frontend/actions/runs/${GITHUB_RUN_ID}

Related commit ${commitSha}

To confirm this step react to this issue with 👍
To cancel this step react to the issue with 👎`
  })
}

export const closeIssue = async (
  issues: Issues,
  number: number
): Promise<void> => {
  await issues.update({
    ...github.context.repo,
    issue_number: number,
    state: 'closed'
  })

  core.info(`Closed issue #${number}`)
}
