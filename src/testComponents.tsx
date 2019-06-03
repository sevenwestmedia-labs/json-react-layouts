import React from 'react'
import {
    createRegisterableComponent,
    createRegisterableComponentWithData,
} from './ComponentRegistrar'
import { DataDefinition } from './DataLoading'
import { createRegisterableComposition } from './CompositionRegistrar'

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

// Test component with data
export const TestComponentWithData: React.FC<{ length: number | undefined }> = ({ length }) => (
    <div>{length ? `Length: ${length}` : 'Loading'}</div>
)

const lengthCalculatorDataDefinition: DataDefinition<{ dataArg: string }, number, {}> = {
    loadData: props => new Promise(resolve => setTimeout(() => resolve(props.dataArg.length))),
}
export const testComponentWithDataRegistration = createRegisterableComponentWithData(
    'test-with-data',
    lengthCalculatorDataDefinition,
    props => {
        return (
            <TestComponentWithData
                length={props.data.loaded ? props.data.result : undefined}
                {...props}
            />
        )
    },
)

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

export const TestComposition: React.FC<{ main: React.ReactElement<any> }> = props => (
    <div>{props.main}</div>
)

export const testCompositionRegistration = createRegisterableComposition<'main', {}>()(
    'test-composition',
    ({ contentAreas }) => <TestComposition main={contentAreas.main} />,
)

// Test composition with props
export interface CompositionProps {
    opts: string
}
export const TestCompositionWithProps: React.FC<
    { main: React.ReactElement<any> } & CompositionProps
> = props => <div>{props.main}</div>

export const testCompositionWithPropsRegistration = createRegisterableComposition<'main', {}>()(
    'test-composition',
    ({ contentAreas, props }) => <TestComposition main={contentAreas.main} {...props} />,
)
