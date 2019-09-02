import React from 'react'
import { getRegistrationCreators } from '..'

const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<{}>()

// Test Component
export const TestComponent: React.FC<{}> = () => <div>Test component</div>

export const testComponentRegistration = createRegisterableComponent('test', () => (
    <TestComponent />
))

// Test component 2
export const TestComponent2: React.FC<{}> = () => <div>Test component 2</div>

export const testComponent2Registration = createRegisterableComponent('test2', () => (
    <TestComponent2 />
))

// Test Component With props
export interface TestProps {
    title: string
}

export const TestComponentWithProps: React.FC<TestProps> = (props: TestProps) => (
    <div>Test component that has a title = {props.title}</div>
)

export const testComponentWithPropsRegistration = createRegisterableComponent(
    'testWithTitleProp',
    (props: { title: string }) => <TestComponentWithProps title={props.title} />,
)

// Test composition

export const TestComposition: React.FC<{
    main: React.ReactElement<any>
    compositionTitle?: string
}> = props => (
    <div>
        {props.compositionTitle && <h1>{props.compositionTitle}</h1>}
        {props.main}
    </div>
)

export const testCompositionRegistration = createRegisterableComposition<'main'>()(
    'test-composition',
    contentAreas => <TestComposition main={contentAreas.main} />,
)

// Test composition with props
export interface CompositionProps {
    opts: string
}
export const TestCompositionWithProps: React.FC<
    { main: React.ReactElement<any> } & CompositionProps
> = props => <div>{props.main}</div>

export const testCompositionWithPropsRegistration = createRegisterableComposition<'main'>()(
    'test-composition-with-props',
    (contentAreas, props: { compositionTitle: string }) => (
        <TestComposition main={contentAreas.main} {...props} />
    ),
)
