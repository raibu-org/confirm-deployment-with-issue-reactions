# Confirm deployment with issue reactions

This actions allow to create a deployment confirmation job in CI. The job will create a new issue in the repository where the action runs. You can react to the issue with either 👍 or 👎 to confirm or cancel the deployment confirmation job. 

Usage example:

```yaml
  confirm-dummy-deployment:
    runs-on: ubuntu-latest
    steps:
    - uses: humanizmu/confirm-deployment-with-issue-reactions@v0.2
      with:
        githubToken: ${{ secrets.GITHUB_TOKEN }}

  dummy-deployment:
    runs-on: ubuntu-latest
    needs: [confirm-dummy-deployment]
    steps:
    - run: 'echo putin huilo'
```

The example above will creates two jobs
- confirm-dummy-deployment - job that needs to be confirmed by reacting to the issue opened by the job
- dummy-deployment - job depending on the confirmation job

The run containing these jobs will look as following:

![Alt text](/docs/screenshots/pending-ci.png "Pending CI")

## Confirming the deployment

`confirm-dummy-deployment` will automatically create an issue and will log the link to the issue in CI

![Alt text](/docs/screenshots/link-to-issue-in-ci.png "Link to issue in CI")

The issue itself will look like this

![Alt text](/docs/screenshots/open-issue.png "Open issue")

You confirm the deployment by reacting to the issue with 👍. Upon confirmation the issue will be closed automatically.

![Alt text](/docs/screenshots/confirmed-issue.png "Confirmed issue")

The confirmation job will pass and the dependent deployment step will be triggered

![Alt text](/docs/screenshots/passing-ci.png "Passing CI")

## Cancelling the deployment

You can react to the issue with 👎. Upon cancellation the issue will be closed automatically.

![Alt text](/docs/screenshots/cancelled-issue.png "Cancelled issue")

The confirmation job will fail and the dependent deployment step will be skipped

![Alt text](/docs/screenshots/cancelled-ci.png "Cancelled CI")
