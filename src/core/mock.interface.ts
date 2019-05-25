import { IInvocationInfo, IPropertyInvocationInfo } from './invocation-info.interface';

/** Represents a mock proxy. */
export interface IMock<T> {
    /** Specifies the mocked object. */
    readonly subject: T;
    /** Specifies mocked subject members. */
    readonly mockedMembers: ReadonlyArray<keyof T>;
    /**
     * Returns invocation metadata for a function or a property.
     * @param memberName subject's member name
     * @returns function or property invocation metadata
     * */
    getInvocationInfo(memberName: keyof T): IInvocationInfo | IPropertyInvocationInfo | null;
}
