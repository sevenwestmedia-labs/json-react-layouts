import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation } from './CompositionRegistrar'
import { NestedCompositionProps } from './LayoutRegistration'

export interface ComponentPathOptions {
    subpath: string
    index?: number
    prefix?: string
}

export function getComponentPath(options: ComponentPathOptions) {
    const { subpath, index, prefix } = options

    const componentPath = index !== undefined ? `[${index}]${subpath}` : subpath
    const prefixPath = prefix ? `${prefix}` : ''
    const renderPath = `${prefixPath}${componentPath}`

    return renderPath
}
export function isNestedComposition(
    component: ComponentInformation<any, any>,
): component is ComponentInformation<any, NestedCompositionProps<any>> {
    return component.type === 'nested-composition'
}

export function flatMap<T, Mapped>(collection: T[], map: (value: T, i: number) => Mapped[]) {
    return collection.reduce((acc: Mapped[], val: T, i: number) => {
        map(val, i).forEach(v => acc.push(v))
        return acc
    }, [])
}

/** Maps an array of compositions to a flat list of components */
export function getComponentsInCompositions(
    compositions: Array<CompositionInformation<any, any, any>>,
    componentRenderPath: string | undefined,
) {
    return flatMap(compositions, (composition: CompositionInformation<any, any, any>, i: number) =>
        flatMap(Object.keys(composition.contentAreas), key =>
            contentAreas(
                composition,
                i,
                key,
                componentRenderPath !== undefined,
                componentRenderPath,
            ),
        ),
    )
}

/** Takes an array of compositions, and expands any nested compostions
 * into a flat list of components
 */
function expandNestedCompositionsIntoComponents(
    components: Array<ComponentInformation<any, any>>,
    componentRenderPath: string,
): ContentAreaData[] {
    const contentAreasArr: ContentAreaData[] = []
    components.forEach((c, i) => {
        if (isNestedComposition(c)) {
            const props = c.props
            const result = getComponentsInCompositions(
                [props.composition],
                `${componentRenderPath}/[${i}]`,
            )
            result.forEach(col => contentAreasArr.push(col))
        } else {
            contentAreasArr.push({ ...c, componentRenderPath: `${componentRenderPath}/[${i}]` })
        }
    })

    return contentAreasArr
}

// map the content areas from the given composition
function contentAreas(
    composition: CompositionInformation<any, any, any>,
    i: number,
    contentAreaKey: string,
    innerSearch: boolean,
    componentRenderPath: string | undefined,
): ContentAreaData[] {
    const routeDataOptions: ComponentPathOptions = {
        subpath: !innerSearch ? composition.type : 'nested:' + composition.type,
        index: !innerSearch ? i : undefined,
        prefix: componentRenderPath,
    }

    const components = composition.contentAreas[contentAreaKey]

    const path = `${getComponentPath(routeDataOptions)}/${contentAreaKey}`

    return expandNestedCompositionsIntoComponents(components, path)
}

export interface ContentAreaData extends ComponentInformation<any, any> {
    componentRenderPath: string
}
