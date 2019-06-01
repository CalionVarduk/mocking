import { MockedInfoType } from './mocked-info-type.enum';
import { IInvocationData } from './invocation-data.interface';
import { Nullable } from 'frlluc-utils';

/** Stores mocked method information. */
export interface IMockedMethodInfo {
    /** Specifies mocked info type. */
    readonly type: MockedInfoType;
    /** Specifies method's invocation count. */
    readonly count: number;
    /**
     * Returns invocation's data.
     * @param invocationNo invocation's index
     * @returns invocation data
     * */
    getData(invocationNo: number): Nullable<IInvocationData>;
    /** Clears all stored invocation data. */
    clear(): void;
}
