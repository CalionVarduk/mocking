import { MockedInfoType } from './mocked-info-type.enum';
import { IMockedMethodInfo } from './mocked-method-info.interface';

/** Stores mocked property information. */
export interface IMockedPropertyInfo {
    /** Specifies mocked info type. */
    readonly type: MockedInfoType;
    /** Specifies property's mocked getter information store. */
    readonly get: IMockedMethodInfo | null;
    /** Specifies property's mocked setter information store. */
    readonly set: IMockedMethodInfo | null;
}
