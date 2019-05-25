import { IMock } from './mock.interface';
import { IInvocationInfo, IPropertyInvocationInfo } from './invocation-info.interface';
import { InvocationInfoType } from './invocation-info-type.enum';

type InvocationCounter = {
    value: number;
};

function createInvocationInfo(type: InvocationInfoType, data: any[], counter: InvocationCounter): IInvocationInfo {
    return Object.freeze({
        get type(): InvocationInfoType {
            return type;
        },
        get count(): number {
            return counter.value;
        },
        getArguments(no: number): any[] | null {
            const i = data[no];
            return i ? i[0] : null;
        },
        getResult(no: number): any | null {
            const i = data[no];
            return i ? i[1] : null;
        }
    });
}

function createFunctionMock(func: Function, setup: any, data: any, counter: InvocationCounter): Function {
    return function() {
        ++counter.value;
        const result = func.bind(setup)(...arguments);
        data.push([[...arguments], result]);
        return result;
    };
}

function createMethodMock(
    invocationCache: { [id: string]: IInvocationInfo | IPropertyInvocationInfo },
    setup: any, func: Function, name: string): Function {

    const data: any[] = [];
    const counter: InvocationCounter = { value: 0 };
    invocationCache[name] = createInvocationInfo(InvocationInfoType.Method, data, counter);
    return createFunctionMock(func, setup, data, counter);
}

function createPropertyMock(
    invocationCache: { [id: string]: IInvocationInfo | IPropertyInvocationInfo },
    setup: any, prop: PropertyDescriptor, name: string): { getter?(): any; setter?(value: any): void } {

    const info: any = {
        get type(): InvocationInfoType {
            return InvocationInfoType.Property;
        },
        get: null,
        set: null
    };
    const result: { getter?(): any; setter?(value: any): void } = {};
    if (prop.get) {
        const data: any[] = [];
        const counter: InvocationCounter = { value: 0 };
        info.get = createInvocationInfo(InvocationInfoType.PropertyGetter, data, counter);
        result.getter = createFunctionMock(prop.get, setup, data, counter) as () => any;
    }
    if (prop.set) {
        const data: any[] = [];
        const counter: InvocationCounter = { value: 0 };
        info.set = createInvocationInfo(InvocationInfoType.PropertySetter, data, counter);
        result.setter = createFunctionMock(prop.set, setup, data, counter) as (value: any) => void;
    }
    invocationCache[name] = Object.freeze(info);
    return result;
}

/**
 * Allows to create a mocked object.
 * @param setup mock setup
 * @returns mocked object
 * */
export function mock<T>(setup: Partial<T>): IMock<T> {
    const members: string[] = [];
    const invocationCache: { [id: string]: IInvocationInfo | IPropertyInvocationInfo } = {};
    const result: any = {
        getInvocationInfo(m: string): IInvocationInfo | IPropertyInvocationInfo | null {
            return invocationCache[m];
        }
    };
    const subject: any = {};
    for (const key of Object.getOwnPropertyNames(setup)) {
        members.push(key);
        const descriptor = Object.getOwnPropertyDescriptor(setup, key)!;
        if (descriptor.value === void(0)) {
            const propertyMock = createPropertyMock(invocationCache, setup, descriptor, key);
            Object.defineProperty(subject, key, {
                get: propertyMock.getter,
                set: propertyMock.setter
            });
        } else {
            subject[key] = (typeof descriptor.value === 'function') ?
                createMethodMock(invocationCache, setup, descriptor.value, key) :
                descriptor.value;
        }
    }
    result.subject = Object.freeze(subject);
    result.mockedMembers = Object.freeze(members);
    return Object.freeze(result);
}
