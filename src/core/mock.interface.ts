import { IMockedMethodInfo } from './mocked-method-info.interface';
import { IMockedPropertyInfo } from './mocked-property-info.interface';
import { Nullable } from 'frl-ts-utils/lib/core/nullable';

/** Represents a mock proxy. */
export interface IMock<T>
{
    /** Specifies the mocked object. */
    readonly subject: T;
    /** Specifies mocked subject members. */
    readonly mockedMembers: ReadonlySet<keyof T>;
    /**
     * Returns mocked information store for a mocked method or a mocked property.
     * @param memberName subject's member name
     * @returns mocked method or property information store
     * */
    getMemberInfo(memberName: keyof T): Nullable<IMockedMethodInfo | IMockedPropertyInfo>;
}
