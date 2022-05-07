export const missingGithubTokenMessage =
  () => `GitHub token is required, please provide token in the action input, example usage:
steps:
- uses: humanizmu/confirm-deployment-with-issue-reactions@some-version
  with:
    githubToken: \${{ secrets.GITHUB_TOKEN }}
`
