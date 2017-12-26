const conventionalChangelogCore = require('conventional-changelog-core')
const { expect } = require('chai')
const gitDummyCommit = require('git-dummy-commit')
const shell = require('shelljs')
const through = require('through2')
const betterThanBefore = require('better-than-before')()
const preset = require('../')

/* eslint-disable no-magic-numbers */

const { preparing } = betterThanBefore

betterThanBefore.setups([
  function () {
    shell.config.silent = true
    shell.rm('-rf', 'tmp')
    shell.mkdir('tmp')
    shell.cd('tmp')
    shell.mkdir('git-templates')
    shell.exec('git init --template=./git-templates')

    gitDummyCommit('chore: first commit')
    gitDummyCommit(['feat: amazing new module', 'BREAKING CHANGE: Not backward compatible.'])
    gitDummyCommit(['fix(compile): avoid a bug', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['perf(ngOptions): make it faster', ' closes #1, #2'])
    gitDummyCommit('revert(ngOptions): bad commit')
    gitDummyCommit('fix(*): oops')
  },
  function () {
    gitDummyCommit(['feat(awesome): addresses the issue brought up in #133'])
  },
  function () {
    gitDummyCommit(['feat(awesome): fix #88'])
  },
  function () {
    gitDummyCommit(['feat(awesome): issue brought up by @bcoe! on Friday'])
  },
  function () {
    gitDummyCommit(['docs(readme): make it clear', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['style(whitespace): make it easier to read', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['refactor(code): change a lot of code', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['test(*): more tests', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['chore(deps): bump', 'BREAKING CHANGE: The Change is huge.'])
  },
  function () {
    gitDummyCommit(['feat(deps): bump', 'BREAKING CHANGES: Also works :)'])
  },
  function () {
    shell.exec('git tag v1.0.0')
    gitDummyCommit('feat: some more features')
  },
  function () {
    gitDummyCommit(['feat(*): implementing #5 by @dlmr', ' closes #10'])
  },
  function () {
    gitDummyCommit(['fix: use npm@5 (@username)'])
  },
])

describe('atomix preset', () => {
  it('should work if there is no semver tag', (done) => {
    preparing(1)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()

        expect(chunk).to.include('amazing new module')
        expect(chunk).to.include('**compile:** avoid a bug')
        expect(chunk).to.include('make it faster')
        expect(chunk).to.include(', closes [#1](https://github.com/atomixinteractions/conventional-changelog/issues/1) [#2](https://github.com/atomixinteractions/conventional-changelog/issues/2)')
        expect(chunk).to.include('Not backward compatible.')
        expect(chunk).to.include('**compile:** The Change is huge.')
        expect(chunk).to.include('Features')
        expect(chunk).to.include('Bug Fixes')
        expect(chunk).to.include('Performance Improvements')
        expect(chunk).to.include('Reverts')
        expect(chunk).to.include('bad commit')
        // expect(chunk).to.include('BREAKING CHANGES')

        // expect(chunk).to.not.include('first commit')
        // expect(chunk).to.not.include('feat')
        // expect(chunk).to.not.include('fix')
        // expect(chunk).to.not.include('perf')
        // expect(chunk).to.not.include('revert')
        expect(chunk).to.not.include('***:**')
        expect(chunk).to.not.include(': Not backward compatible.')

        done()
      }))
  })

  it('should replace #[0-9]+ with GitHub issue URL', (done) => {
    preparing(2)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()
        expect(chunk).to.include('[#133](https://github.com/atomixinteractions/conventional-changelog/issues/133)')
        done()
      }))
  })

  // it('should remove the issues that already appear in the subject', (done) => {
  //   preparing(3)

  //   conventionalChangelogCore({
  //     config: preset,
  //   })
  //     .on('error', (err) => {
  //       done(err)
  //     })
  //     .pipe(through((chunk) => {
  //       chunk = chunk.toString()
  //       expect(chunk).to.include('[#88](https://github.com/atomixinteractions/conventional-changelog-atomix/issues/88)')
  //       expect(chunk).to.not.include('closes [#88](https://github.com/atomixinteractions/conventional-changelog-atomix/issues/88)')
  //       done()
  //     }))
  // })

  it('should replace @username with GitHub user URL', (done) => {
    preparing(4)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()
        expect(chunk).to.include('[@bcoe](https://github.com/bcoe)')
        done()
      }))
  })

  it('should not discard commit if there is BREAKING CHANGE', (done) => {
    preparing(5)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()

        expect(chunk).to.include('Documentation')
        expect(chunk).to.include('Styles')
        expect(chunk).to.include('Code Refactoring')
        expect(chunk).to.include('Tests')
        expect(chunk).to.include('Chores')

        done()
      }))
  })

  it('should BREAKING CHANGES the same as BREAKING CHANGE', (done) => {
    preparing(6)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()

        expect(chunk).to.include('Also works :)')

        done()
      }))
  })

  it('should work if there is a semver tag', (done) => {
    preparing(7)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      outputUnreleased: true,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk, enc, cb) => {
        chunk = chunk.toString()

        expect(chunk).to.include('some more features')
        // expect(chunk).to.not.include('BREAKING')

        i++
        cb()
      }, () => {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should work with unknown host', (done) => {
    preparing(7)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: `${__dirname}/fixtures/_unknown-host.json`,
      },
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk, enc, cb) => {
        chunk = chunk.toString()

        expect(chunk).to.include('(http://unknown/compare')
        expect(chunk).to.include('](http://unknown/commits/')

        i++
        cb()
      }, () => {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should work specifying where to find a package.json using conventional-changelog-core', (done) => {
    preparing(8)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: `${__dirname}/fixtures/_known-host.json`,
      },
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk, enc, cb) => {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.com/conventional-changelog/example/compare')
        expect(chunk).to.include('](https://github.com/conventional-changelog/example/commit/')
        expect(chunk).to.include('](https://github.com/conventional-changelog/example/issues/')

        i++
        cb()
      }, () => {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should fallback to the closest package.json when not providing a location for a package.json', (done) => {
    preparing(8)
    let i = 0

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk, enc, cb) => {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.com/atomixinteractions/conventional-changelog/compare')
        expect(chunk).to.include('](https://github.com/atomixinteractions/conventional-changelog/commit/')
        expect(chunk).to.include('](https://github.com/atomixinteractions/conventional-changelog/issues/')

        i++
        cb()
      }, () => {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should support non public GitHub repository locations', (done) => {
    preparing(8)

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: `${__dirname}/fixtures/_ghe-host.json`,
      },
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.internal.example.com/dlmr')
        expect(chunk).to.include('(https://github.internal.example.com/conventional-changelog/internal/compare')
        expect(chunk).to.include('](https://github.internal.example.com/conventional-changelog/internal/commit/')
        expect(chunk).to.include('5](https://github.internal.example.com/conventional-changelog/internal/issues/5')
        expect(chunk).to.include(' closes [#10](https://github.internal.example.com/conventional-changelog/internal/issues/10)')

        done()
      }))
  })

  it('should only replace with link to user if it is an username', (done) => {
    preparing(9)

    conventionalChangelogCore({
      config: preset,
    })
      .on('error', (err) => {
        done(err)
      })
      .pipe(through((chunk) => {
        chunk = chunk.toString()

        expect(chunk).to.not.include('(https://github.com/5')
        expect(chunk).to.include('(https://github.com/username')

        done()
      }))
  })
})
