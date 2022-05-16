export const getMissingGithubTokenMessage =
  () => `GitHub token is required, please provide token in the action input, example usage:
steps:
- uses: humanizmu/confirm-deployment-with-issue-reactions@some-version
  with:
    githubToken: \${{ secrets.GITHUB_TOKEN }}
`
export const getIssueUrlMessage = (
  issueUrl: string
) => `Opened issue ${issueUrl}
Confirm this step by reacting to the issue with 👍
To cancel this step react to the issue with 👎
`
