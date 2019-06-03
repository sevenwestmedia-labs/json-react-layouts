import path from 'path'
import spawn from 'cross-spawn'

test('component-library/__App/component-rendering', () => {
    const typescriptCompilation = spawn.sync('./node_modules/.bin/tsc', [
        '-p',
        path.resolve(__dirname, '../TypeSafetyTestFixtures/testconfig.json'),
    ])

    const output = typescriptCompilation.stdout.toString()

    expect(output).toMatchSnapshot('Typescript expected failures')
})
