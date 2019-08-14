import React from 'react'
import { ComponentRegistrar } from '../ComponentRegistrar'
import { testComponentRegistration, testCompositionRegistration } from '../__tests__/testComponents'
import { CompositionRegistrar } from '../CompositionRegistrar'
import { consoleLogger } from 'typescript-log'
import { LayoutRegistration } from '../LayoutRegistration'

const layout = new LayoutRegistration()
    .registerComponents(registrar => registrar.registerComponent(testComponentRegistration))
    .registerCompositions(registrar => registrar.registerComposition(testCompositionRegistration))

// Should not compile
// @ts-ignore
const _el = (
    <layout.CompositionsRenderer
        compositions={[
            {
                type: 'test-composition2',
                props: {},
                contentAreas: { main: [] },
            },
        ]}
    />
)

// Should not compile
// @ts-ignore
const _el2 = (
    <layout.CompositionsRenderer
        compositions={[
            {
                type: 'test-composition',
                props: {},
                contentAreas: { main: [{ type: 'test2', props: {} }] },
            },
        ]}
    />
)
