module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      ['json:test-results/cucumber-report.json'],
      ['html:test-results/cucumber-report.html']
    ],
    parallel: 2,
    retry: 1,
    tags: 'not @wip',
  },
  smoke: {
    paths: ['features/**/*.feature'],
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      ['json:test-results/smoke-report.json'],
      ['html:test-results/smoke-report.html']
    ],
    tags: '@smoke',
  }
};