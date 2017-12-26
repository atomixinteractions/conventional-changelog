const Q = require('q')
const conventionalChangelog = require('./conventional-changelog')
const parserOpts = require('./parser-opts')
const recommendedBumpOpts = require('./conventional-recommended-bump')
const writerOpts = require('./writer-opts')


module.exports = Q.all([conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts])
  // eslint-disable-next-line no-shadow
  .spread((conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts) => ({
    conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts,
  }))
