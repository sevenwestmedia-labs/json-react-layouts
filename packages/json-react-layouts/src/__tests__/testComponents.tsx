import React from 'react'
import { getRegistrationCreators } from '..'

const { createRegisterableComponent, createRegisterableComposition } = getRegistrationCreators<{}>()

export const TestComponent: React.FC<{}> = () => <div>Test component</div>
export const TestComponent2: React.FC<{}> = () => <div>Test component 2</div>
export const TestComponent3: React.FC<{}> = () => <div>Test component 3</div>

export const testComponentRegistration = createRegisterableComponent('test', props => (
    <TestComponent {...props} />
))
export const testComponent2Registration = createRegisterableComponent('test2', props => (
    <TestComponent2 {...props} />
))
export const testComponent3Registration = createRegisterableComponent('test3', () => (
    <TestComponent3 />
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

export const testCompositionRegistration = createRegisterableComposition<
    'main'
>()('test-composition', contentAreas => <TestComposition main={contentAreas.main} />)

// Test composition with props
export interface CompositionProps {
    opts: string
    main: React.ReactElement<any>
}
export const TestCompositionWithProps: React.FC<CompositionProps> = props => <div>{props.main}</div>

export const testCompositionWithPropsRegistration = createRegisterableComposition<
    'main'
>()('test-composition-with-props', (contentAreas, props: { compositionTitle: string }) => (
    <TestComposition main={contentAreas.main} compositionTitle={props.compositionTitle} />
))
