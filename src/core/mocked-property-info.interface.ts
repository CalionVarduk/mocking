import { MockedInfoType } from './mocked-info-type.enum';
import { IMockedMethodInfo } from './mocked-method-info.interface';
import { Nullable } from 'frlluc-utils';

/** Stores mocked property information. */
export interface IMockedPropertyInfo {
    /** Specifies mocked info type. */
    readonly type: MockedInfoType;
    /** Specifies property's mocked getter information store. */
    readonly get: Nullable<IMockedMethodInfo>;
    /** Specifies property's mocked setter information store. */
    readonly set: Nullable<IMockedMethodInfo>;
}
