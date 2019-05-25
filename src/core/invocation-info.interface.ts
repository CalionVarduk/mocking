import { InvocationInfoType } from './invocation-info-type.enum';

/** Represents function invocation metadata. */
export interface IInvocationInfo {
    /** Specifies invocation info type. */
    readonly type: InvocationInfoType;
    /** Specifies function's invocation count. */
    readonly count: number;
    /**
     * Returns arguments used for function's invocation.
     * @param invocationNo invocation's index
     * @returns invocation arguments
     * */
    getArguments(invocationNo: number): any[] | null;
    /**
     * Returns result returned by function's invocation.
     * @param invocationNo invocation's index
     * @returns invocation result
     * */
    getResult(invocationNo: number): any | null;
}

/** Represents invocation metadata for a property with a getter and/or a setter. */
export interface IPropertyInvocationInfo {
    /** Specifies invocation info type. */
    readonly type: InvocationInfoType;
    /** Specifies property's getter invocation metadata. */
    readonly get: IInvocationInfo | null;
    /** Specifies property's setter invocation metadata. */
    readonly set: IInvocationInfo | null;
}
