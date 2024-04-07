/* eslint-disable */
export default {
    displayName: 'workspace-plugin',
    preset: '../../jest.preset.cjs',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/tools/workspace-plugin'
};
