import { MockedInfoType } from '../src/mocked-info-type.enum';
import { IMockedMethodInfo } from '../src/mocked-method-info.interface';
import { IMockedPropertyInfo } from '../src/mocked-property-info.interface';
import { IMock } from '../src/mock.interface';
import { mock, resetGlobalMockInvocationNo, getGlobalMockInvocationNo, partialMock } from '../src/mock';
import { reinterpretCast } from 'frl-ts-utils/lib/functions/reinterpret-cast';

abstract class Test
{
    public abstract field: string;
    public abstract property: number;
    public abstract readonly readonlyProperty: string;
    public abstract voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void;
    public abstract returningMethod(a1?: number, a2?: string): { x: number; y: number };
}

class TestImpl extends Test
{
    public get property(): number { return this._property; }
    public set property(value: number) { this._property = value; }
    public get readonlyProperty(): string { return 'test impl'; }
    public field: string = 'field';
    private _property: number = 0;
    public voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void { return; }
    public returningMethod(a1?: number, a2?: string): { x: number; y: number } { return { x: a1|| 0, y: (a1 || 0) * 2 }; }
}

function assert(sut: IMock<Test>, expectedMemberCount: number): void
{
    expect(sut).toBeDefined();
    expect(sut).not.toBeNull();
    expect(sut.subject).toBeDefined();
    expect(sut.subject).not.toBeNull();
    expect(sut.mockedMembers).toBeDefined();
    expect(sut.mockedMembers).not.toBeNull();
    expect(sut.mockedMembers.size).toBe(expectedMemberCount);
}

beforeEach(() => resetGlobalMockInvocationNo());

test('mock function should create a valid mock object',
    () =>
    {
        const sut = mock<Test>({});
        assert(sut, 0);
    }
);

test('mock function should create a valid mock object with field only',
    () =>
    {
        const expected = 'foo';

        const sut = mock<Test>({
            field: expected
        });
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('field');
        expect(sut.getMemberInfo('field')).toBeNull();
        expect(sut.subject.field).toBe(expected);
    }
);

test('mock function should create a valid mock object with property getter only',
    () =>
    {
        const expected = 'foo';

        const sut = mock<Test>({
            get readonlyProperty() { return expected; }
        });
        const info = sut.getMemberInfo('readonlyProperty') as IMockedPropertyInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('readonlyProperty');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(MockedInfoType.Property);
        expect(info.get).toBeDefined();
        expect(info.get).not.toBeNull();
        expect(info.get!.type).toBe(MockedInfoType.PropertyGetter);
        expect(info.get!.count).toBe(0);
        expect(info.set).toBeNull();
        expect(sut.subject.readonlyProperty).toBe(expected);
    }
);

test('mock function should create a valid mock object with property setter only',
    () =>
    {
        const expected = 10;
        let result = -1;

        const sut = mock<Test>({
            set property(value: number) { result = value; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('property');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(MockedInfoType.Property);
        expect(info.get).toBeNull();
        expect(info.set).toBeDefined();
        expect(info.set).not.toBeNull();
        expect(info.set!.type).toBe(MockedInfoType.PropertySetter);
        expect(info.set!.count).toBe(0);
        sut.subject.property = expected;
        expect(result).toBe(expected);
    }
);

test('mock function should create a valid mock object with property only',
    () =>
    {
        const expected = 10;
        let result = -1;

        const sut = mock<Test>({
            get property(): number { return result; },
            set property(value: number) { result = value; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('property');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(MockedInfoType.Property);
        expect(info.get).toBeDefined();
        expect(info.get).not.toBeNull();
        expect(info.get!.type).toBe(MockedInfoType.PropertyGetter);
        expect(info.get!.count).toBe(0);
        expect(info.set).toBeDefined();
        expect(info.set).not.toBeNull();
        expect(info.set!.type).toBe(MockedInfoType.PropertySetter);
        expect(info.set!.count).toBe(0);
        sut.subject.property = expected;
        expect(sut.subject.property).toBe(expected);
        expect(result).toBe(expected);
    }
);

test('mock function should create a valid mock object with method only',
    () =>
    {
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: 20 };
        let result1 = -1;
        let result2 = '';

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                result1 = a1!;
                result2 = a2!;
                return { x: a1!, y: a1! * 2 };
            }
        });
        const info = sut.getMemberInfo('returningMethod') as IMockedMethodInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('returningMethod');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(MockedInfoType.Method);
        expect(info.count).toBe(0);
        expect(sut.subject.returningMethod(expected1, expected2)).toStrictEqual(expectedResult);
        expect(result1).toBe(expected1);
        expect(result2).toBe(expected2);
    }
);

test('mock function should create a valid mock object with all members',
    () =>
    {
        const expectedField = 'foo';
        const expectedProperty = 10;
        const expectedReadonlyProperty = 'bar';
        const expectedVoidMethodArgs: any[] = [7, 'faz', true, { x: 100, y: 200 }, [1, 2, 3]];
        const expectedVoidMethodResult = void(0);
        const expectedReturningMethodArgs: any[] = [15, 'baz'];
        const expectedReturningMethodResult = { x: 15, y: 30 };
        let property = -1;
        let voidMethodArgs: any[] = [];
        let returningMethodArgs: any[] = [];

        const sut = mock<Test>({
            field: expectedField,
            get property(): number { return property; },
            set property(value: number) { property = value; },
            get readonlyProperty() { return expectedReadonlyProperty; },
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void
            {
                voidMethodArgs = [a1, a2, a3, a4, a5];
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                returningMethodArgs = [a1, a2];
                return { x: a1!, y: a1! * 2 };
            }
        });
        const propertyInfo = sut.getMemberInfo('property') as IMockedPropertyInfo;
        const readonlyPropertyInfo = sut.getMemberInfo('readonlyProperty') as IMockedPropertyInfo;
        const voidMethodInfo = sut.getMemberInfo('voidMethod') as IMockedMethodInfo;
        const returningMethodInfo = sut.getMemberInfo('returningMethod') as IMockedMethodInfo;
        assert(sut, 5);
        expect(sut.mockedMembers).toContain('field');
        expect(sut.mockedMembers).toContain('property');
        expect(sut.mockedMembers).toContain('readonlyProperty');
        expect(sut.mockedMembers).toContain('voidMethod');
        expect(sut.mockedMembers).toContain('returningMethod');
        expect(sut.getMemberInfo('field')).toBeNull();
        expect(propertyInfo).toBeDefined();
        expect(propertyInfo).not.toBeNull();
        expect(propertyInfo.type).toBe(MockedInfoType.Property);
        expect(propertyInfo.get).toBeDefined();
        expect(propertyInfo.get).not.toBeNull();
        expect(propertyInfo.get!.type).toBe(MockedInfoType.PropertyGetter);
        expect(propertyInfo.get!.count).toBe(0);
        expect(propertyInfo.set).toBeDefined();
        expect(propertyInfo.set).not.toBeNull();
        expect(propertyInfo.set!.type).toBe(MockedInfoType.PropertySetter);
        expect(propertyInfo.set!.count).toBe(0);
        expect(readonlyPropertyInfo).toBeDefined();
        expect(readonlyPropertyInfo).not.toBeNull();
        expect(readonlyPropertyInfo.type).toBe(MockedInfoType.Property);
        expect(readonlyPropertyInfo.get).toBeDefined();
        expect(readonlyPropertyInfo.get).not.toBeNull();
        expect(readonlyPropertyInfo.get!.type).toBe(MockedInfoType.PropertyGetter);
        expect(readonlyPropertyInfo.get!.count).toBe(0);
        expect(readonlyPropertyInfo.set).toBeNull();
        expect(voidMethodInfo).toBeDefined();
        expect(voidMethodInfo).not.toBeNull();
        expect(voidMethodInfo.type).toBe(MockedInfoType.Method);
        expect(voidMethodInfo.count).toBe(0);
        expect(returningMethodInfo).toBeDefined();
        expect(returningMethodInfo).not.toBeNull();
        expect(returningMethodInfo.type).toBe(MockedInfoType.Method);
        expect(returningMethodInfo.count).toBe(0);
        expect(sut.subject.field).toStrictEqual(expectedField);
        sut.subject.property = expectedProperty;
        expect(sut.subject.property).toBe(expectedProperty);
        expect(property).toBe(expectedProperty);
        expect(sut.subject.voidMethod(...expectedVoidMethodArgs)).toBe(expectedVoidMethodResult);
        expect(voidMethodArgs).toStrictEqual(expectedVoidMethodArgs);
        expect(sut.subject.returningMethod(...expectedReturningMethodArgs)).toStrictEqual(expectedReturningMethodResult);
        expect(returningMethodArgs).toStrictEqual(expectedReturningMethodArgs);
    }
);

test('mocked property info should cache first property getter call',
    () =>
    {
        const result = 10;

        const sut = mock<Test>({
            get property() { return result; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        expect(info.get!.count).toBe(0);
        expect(info.get!.getData(0)).toBeNull();

        const start = new Date().valueOf();
        expect(sut.subject.property).toBe(result);
        const end = new Date().valueOf();

        expect(info.get!.count).toBe(1);
        const data = info.get!.getData(0)!;
        expect(Object.isFrozen(data)).toBe(true);
        expect(Object.isFrozen(data.arguments)).toBe(true);
        expect(Object.isFrozen(data.result)).toBe(true);
        expect(data).toBeDefined();
        expect(data).not.toBeNull();
        expect(data.no).toBe(0);
        expect(data.globalNo).toBe(0);
        expect(data.timestamp).toBeGreaterThanOrEqual(start);
        expect(data.timestamp).toBeLessThanOrEqual(end);
        expect(data.arguments).toBeDefined();
        expect(data.arguments).not.toBeNull();
        expect(data.arguments.length).toBe(0);
        expect(data.result).toBe(result);
    }
);

test('mocked property info should cache next property getter calls',
    () =>
    {
        const count = 5;
        const resultIncr = 10;
        let result = 0;

        const sut = mock<Test>({
            get property() { return (result += resultIncr); }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        expect(info.get!.count).toBe(0);
        expect(info.get!.getData(0)).toBeNull();

        for (let i = 1; i <= count; ++i)
        {
            const start = new Date().valueOf();
            expect(sut.subject.property).toBe(resultIncr * i);
            const end = new Date().valueOf();

            expect(info.get!.count).toBe(i);
            const data = info.get!.getData(i - 1)!;
            expect(Object.isFrozen(data)).toBe(true);
            expect(Object.isFrozen(data.arguments)).toBe(true);
            expect(Object.isFrozen(data.result)).toBe(true);
            expect(data).toBeDefined();
            expect(data).not.toBeNull();
            expect(data.no).toBe(i - 1);
            expect(data.globalNo).toBe(i - 1);
            expect(data.timestamp).toBeGreaterThanOrEqual(start);
            expect(data.timestamp).toBeLessThanOrEqual(end);
            expect(data.arguments).toBeDefined();
            expect(data.arguments).not.toBeNull();
            expect(data.arguments.length).toBe(0);
            expect(data.result).toBe(resultIncr * i);
            expect(result).toBe(resultIncr * i);
        }
    }
);

test('mocked property info should cache first property setter call',
    () =>
    {
        const expectedResult = 10;
        let result = 0;

        const sut = mock<Test>({
            set property(value: number) { result = value; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        expect(info.set!.count).toBe(0);
        expect(info.set!.getData(0)).toBeNull();

        const start = new Date().valueOf();
        sut.subject.property = expectedResult;
        const end = new Date().valueOf();

        expect(info.set!.count).toBe(1);
        const data = info.set!.getData(0)!;
        expect(Object.isFrozen(data)).toBe(true);
        expect(Object.isFrozen(data.arguments)).toBe(true);
        expect(Object.isFrozen(data.result)).toBe(true);
        expect(data).toBeDefined();
        expect(data).not.toBeNull();
        expect(data.no).toBe(0);
        expect(data.globalNo).toBe(0);
        expect(data.timestamp).toBeGreaterThanOrEqual(start);
        expect(data.timestamp).toBeLessThanOrEqual(end);
        expect(data.arguments).toBeDefined();
        expect(data.arguments).not.toBeNull();
        expect(data.arguments.length).toBe(1);
        expect(data.arguments[0]).toBe(expectedResult);
        expect(data.result).not.toBeDefined();
        expect(result).toBe(expectedResult);
    }
);

test('mocked property info should cache next property setter calls',
    () =>
    {
        const count = 5;
        const resultIncr = 10;
        let result = 0;

        const sut = mock<Test>({
            set property(value: number) { result = value; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        expect(info.set!.count).toBe(0);
        expect(info.set!.getData(0)).toBeNull();

        for (let i = 1; i <= count; ++i)
        {
            const start = new Date().valueOf();
            sut.subject.property = resultIncr * i;
            const end = new Date().valueOf();

            expect(info.set!.count).toBe(i);
            const data = info.set!.getData(i - 1)!;
            expect(Object.isFrozen(data)).toBe(true);
            expect(Object.isFrozen(data.arguments)).toBe(true);
            expect(Object.isFrozen(data.result)).toBe(true);
            expect(data).toBeDefined();
            expect(data).not.toBeNull();
            expect(data.no).toBe(i - 1);
            expect(data.globalNo).toBe(i - 1);
            expect(data.timestamp).toBeGreaterThanOrEqual(start);
            expect(data.timestamp).toBeLessThanOrEqual(end);
            expect(data.arguments).toBeDefined();
            expect(data.arguments).not.toBeNull();
            expect(data.arguments.length).toBe(1);
            expect(data.arguments[0]).toBe(resultIncr * i);
            expect(data.result).not.toBeDefined();
            expect(result).toBe(resultIncr * i);
        }
    }
);

test('mocked method info should cache first method call',
    () =>
    {
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: -10 };

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                return { x: a1!, y: -a1! };
            }
        });
        const info = sut.getMemberInfo('returningMethod') as IMockedMethodInfo;
        expect(info.count).toBe(0);
        expect(info.getData(0)).toBeNull();

        const start = new Date().valueOf();
        expect(sut.subject.returningMethod(expected1, expected2)).toStrictEqual(expectedResult);
        const end = new Date().valueOf();

        expect(info.count).toBe(1);
        const data = info!.getData(0)!;
        expect(Object.isFrozen(data)).toBe(true);
        expect(Object.isFrozen(data.arguments)).toBe(true);
        expect(Object.isFrozen(data.result)).toBe(true);
        expect(data).toBeDefined();
        expect(data).not.toBeNull();
        expect(data.no).toBe(0);
        expect(data.globalNo).toBe(0);
        expect(data.timestamp).toBeGreaterThanOrEqual(start);
        expect(data.timestamp).toBeLessThanOrEqual(end);
        expect(data.arguments).toBeDefined();
        expect(data.arguments).not.toBeNull();
        expect(data.arguments.length).toBe(2);
        expect(data.arguments[0]).toBe(expected1);
        expect(data.arguments[1]).toBe(expected2);
        expect(data.result).toStrictEqual(expectedResult);
    }
);

test('mocked method info should cache next method calls',
    () =>
    {
        const count = 5;
        const resultIncr = 10;
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: -10 };

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                return { x: a1!, y: -a1! };
            }
        });
        const info = sut.getMemberInfo('returningMethod') as IMockedMethodInfo;
        expect(info.count).toBe(0);
        expect(info.getData(0)).toBeNull();

        for (let i = 1; i <= count; ++i)
        {
            const start = new Date().valueOf();
            expect(sut.subject.returningMethod(expected1 * resultIncr, expected2 + String(expected1 * resultIncr)))
                .toStrictEqual({ x: expectedResult.x * resultIncr, y: expectedResult.y * resultIncr });
            const end = new Date().valueOf();

            expect(info!.count).toBe(i);
            const data = info!.getData(i - 1)!;
            expect(Object.isFrozen(data)).toBe(true);
            expect(Object.isFrozen(data.arguments)).toBe(true);
            expect(Object.isFrozen(data.result)).toBe(true);
            expect(data).toBeDefined();
            expect(data).not.toBeNull();
            expect(data.no).toBe(i - 1);
            expect(data.globalNo).toBe(i - 1);
            expect(data.timestamp).toBeGreaterThanOrEqual(start);
            expect(data.timestamp).toBeLessThanOrEqual(end);
            expect(data.arguments).toBeDefined();
            expect(data.arguments).not.toBeNull();
            expect(data.arguments.length).toBe(2);
            expect(data.arguments[0]).toBe(expected1 * resultIncr);
            expect(data.arguments[1]).toBe(expected2 + String(expected1 * resultIncr));
            expect(data.result).toStrictEqual({ x: expectedResult.x * resultIncr, y: expectedResult.y * resultIncr });
        }
    }
);

test('data global no should increment properly',
    () =>
    {
        const sut = mock<Test>({
            set property(value: number) { return; },
            get readonlyProperty() { return 'bar'; },
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void
            {
                return;
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                return { x: 0, y: 0 };
            }
        });
        sut.subject.property = 0;
        sut.subject.voidMethod();
        const result1 = sut.subject.readonlyProperty;
        const result2 = sut.subject.returningMethod();

        expect(result1).toBe('bar');
        expect(result2).toStrictEqual({ x: 0, y: 0 });

        const propertyInfo = sut.getMemberInfo('property')! as IMockedPropertyInfo;
        const readonlyPropertyInfo = sut.getMemberInfo('readonlyProperty')! as IMockedPropertyInfo;
        const voidMethodInfo = sut.getMemberInfo('voidMethod')! as IMockedMethodInfo;
        const returningMethodInfo = sut.getMemberInfo('returningMethod')! as IMockedMethodInfo;

        expect(propertyInfo.set!.getData(0)!.globalNo).toBe(0);
        expect(readonlyPropertyInfo.get!.getData(0)!.globalNo).toBe(2);
        expect(voidMethodInfo.getData(0)!.globalNo).toBe(1);
        expect(returningMethodInfo.getData(0)!.globalNo).toBe(3);
        expect(getGlobalMockInvocationNo()).toBe(4);
    }
);

test('mocked method info clear should remove all invocation data',
    () =>
    {
        const sut = mock<Test>({
            set property(value: number) { return; }
        });
        const info = sut.getMemberInfo('property') as IMockedPropertyInfo;
        sut.subject.property = 0;
        sut.subject.property = 1;
        sut.subject.property = 2;
        info.set!.clear();
        expect(info.set!.count).toBe(0);
    }
);

test('created mock should be frozen',
    () =>
    {
        const sut = mock<Test>({});
        expect(Object.isFrozen(sut)).toBe(true);
        expect(Object.isFrozen(sut.mockedMembers)).toBe(true);
    }
);

test('all info should be frozen',
    () =>
    {
        const sut = mock<Test>({
            field: 'foo',
            get property(): number { return 0; },
            set property(value: number) { return; },
            get readonlyProperty() { return 'bar'; },
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void
            {
                return;
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                return { x: 0, y: 0 };
            }
        });
        for (const member of sut.mockedMembers)
        {
            const info = sut.getMemberInfo(member);
            if (info)
                expect(Object.isFrozen(info)).toBe(true);
        }
    }
);

test('partial mock function should throw when subject is null',
    () =>
    {
        const action = () => partialMock(reinterpretCast<TestImpl>(null), {});
        expect(action).toThrowError();
    }
);

test('partial mock function should throw when subject is undefined',
    () =>
    {
        const action = () => partialMock(reinterpretCast<TestImpl>(void(0)), {});
        expect(action).toThrowError();
    }
);

test('partial mock function should throw when setup is null',
    () =>
    {
        const action = () => partialMock(new TestImpl(), reinterpretCast<Partial<TestImpl>>(null));
        expect(action).toThrowError();
    }
);

test('partial mock function should throw when setup is undefined',
    () =>
    {
        const action = () => partialMock(new TestImpl(), reinterpretCast<Partial<TestImpl>>(void(0)));
        expect(action).toThrowError();
    }
);

test('partial mock function should throw when subject is frozen',
    () =>
    {
        const action = () => partialMock(Object.freeze(new TestImpl()), {});
        expect(action).toThrowError();
    }
);

test('partial mock function should modify the original subject',
    () =>
    {
        const subject = new TestImpl();
        const expectedField = 'foo';
        const expectedProperty = 10;
        const expectedVoidMethodArgs: any[] = [7, 'faz', true, { x: 100, y: 200 }, [1, 2, 3]];
        const expectedVoidMethodResult = void(0);
        const expectedReturningMethodArgs: any[] = [15, 'baz'];
        const expectedReturningMethodResult = { x: 15, y: 30 };
        let property = -1;
        let voidMethodArgs: any[] = [];
        let returningMethodArgs: any[] = [];

        const sut = partialMock<Test>(subject, {
            field: expectedField,
            get property(): number { return property; },
            set property(value: number) { property = value; },
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void
            {
                voidMethodArgs = [a1, a2, a3, a4, a5];
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number }
            {
                returningMethodArgs = [a1, a2];
                return { x: a1!, y: a1! * 2 };
            }
        });
        const propertyInfo = sut.getMemberInfo('property') as IMockedPropertyInfo;
        const voidMethodInfo = sut.getMemberInfo('voidMethod') as IMockedMethodInfo;
        const returningMethodInfo = sut.getMemberInfo('returningMethod') as IMockedMethodInfo;
        assert(sut, 4);
        expect(sut.subject).toBe(subject);
        expect(sut.mockedMembers).toContain('field');
        expect(sut.mockedMembers).toContain('property');
        expect(sut.mockedMembers).toContain('voidMethod');
        expect(sut.mockedMembers).toContain('returningMethod');
        expect(sut.getMemberInfo('field')).toBeNull();
        expect(propertyInfo).toBeDefined();
        expect(propertyInfo).not.toBeNull();
        expect(propertyInfo.type).toBe(MockedInfoType.Property);
        expect(propertyInfo.get).toBeDefined();
        expect(propertyInfo.get).not.toBeNull();
        expect(propertyInfo.get!.type).toBe(MockedInfoType.PropertyGetter);
        expect(propertyInfo.get!.count).toBe(0);
        expect(propertyInfo.set).toBeDefined();
        expect(propertyInfo.set).not.toBeNull();
        expect(propertyInfo.set!.type).toBe(MockedInfoType.PropertySetter);
        expect(propertyInfo.set!.count).toBe(0);
        expect(voidMethodInfo).toBeDefined();
        expect(voidMethodInfo).not.toBeNull();
        expect(voidMethodInfo.type).toBe(MockedInfoType.Method);
        expect(voidMethodInfo.count).toBe(0);
        expect(returningMethodInfo).toBeDefined();
        expect(returningMethodInfo).not.toBeNull();
        expect(returningMethodInfo.type).toBe(MockedInfoType.Method);
        expect(returningMethodInfo.count).toBe(0);
        expect(sut.subject.field).toStrictEqual(expectedField);
        sut.subject.property = expectedProperty;
        expect(sut.subject.property).toBe(expectedProperty);
        expect(property).toBe(expectedProperty);
        expect(sut.subject.voidMethod(...expectedVoidMethodArgs)).toBe(expectedVoidMethodResult);
        expect(voidMethodArgs).toStrictEqual(expectedVoidMethodArgs);
        expect(sut.subject.returningMethod(...expectedReturningMethodArgs)).toStrictEqual(expectedReturningMethodResult);
        expect(returningMethodArgs).toStrictEqual(expectedReturningMethodArgs);
        expect(sut.subject.readonlyProperty).toBe('test impl');
    }
);
