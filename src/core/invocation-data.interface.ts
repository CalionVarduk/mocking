/** Stores information for a single mocked method invocation. */
export interface IInvocationData
{
    /** Represents invocation's index. */
    readonly no: number;
    /** Represents invocation's global index. */
    readonly globalNo: number;
    /** Represents invocation's timestamp. */
    readonly timestamp: number;
    /** Represents invocation's result. */
    readonly result: any;
    /** Represents invocation's arguments. */
    readonly arguments: ReadonlyArray<any>;
}
