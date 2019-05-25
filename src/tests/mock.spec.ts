import { mock } from '../core/mock';
import { IMock } from '../core/mock.interface';
import { InvocationInfoType } from '../core/invocation-info-type.enum';
import { IPropertyInvocationInfo, IInvocationInfo } from '../core/invocation-info.interface';

abstract class Test {
    public abstract field: string;
    public abstract property: number;
    public abstract readonly readonlyProperty: string;
    public abstract voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void;
    public abstract returningMethod(a1?: number, a2?: string): { x: number; y: number };
}

function assert(sut: IMock<Test>, expectedMemberCount: number): void {
    expect(sut).toBeDefined();
    expect(sut).not.toBeNull();
    expect(sut.subject).toBeDefined();
    expect(sut.subject).not.toBeNull();
    expect(Object.getOwnPropertyNames(sut.subject).length).toBe(expectedMemberCount);
    expect(sut.mockedMembers).toBeDefined();
    expect(sut.mockedMembers).not.toBeNull();
    expect(sut.mockedMembers.length).toBe(expectedMemberCount);
}

test('mock function should create a valid mock object',
    () => {
        const sut = mock<Test>({});
        assert(sut, 0);
    }
);

test('mock function should create a valid mock object with field only',
    () => {
        const expected = 'foo';

        const sut = mock<Test>({
            field: expected
        });
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('field');
        expect(sut.getInvocationInfo('field')).not.toBeDefined();
        expect(sut.subject.field).toBe(expected);
    }
);

test('mock function should create a valid mock object with property getter only',
    () => {
        const expected = 'foo';

        const sut = mock<Test>({
            get readonlyProperty() { return expected; }
        });
        const info = sut.getInvocationInfo('readonlyProperty') as IPropertyInvocationInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('readonlyProperty');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(InvocationInfoType.Property);
        expect(info.get).toBeDefined();
        expect(info.get).not.toBeNull();
        expect(info.get!.type).toBe(InvocationInfoType.PropertyGetter);
        expect(info.get!.count).toBe(0);
        expect(info.set).toBeNull();
        expect(sut.subject.readonlyProperty).toBe(expected);
    }
);

test('mock function should create a valid mock object with property setter only',
    () => {
        const expected = 10;
        let result = -1;

        const sut = mock<Test>({
            set property(value: number) { result = value; }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('property');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(InvocationInfoType.Property);
        expect(info.get).toBeNull();
        expect(info.set).toBeDefined();
        expect(info.set).not.toBeNull();
        expect(info.set!.type).toBe(InvocationInfoType.PropertySetter);
        expect(info.set!.count).toBe(0);
        sut.subject.property = expected;
        expect(result).toBe(expected);
    }
);

test('mock function should create a valid mock object with property only',
    () => {
        const expected = 10;
        let result = -1;

        const sut = mock<Test>({
            get property(): number { return result; },
            set property(value: number) { result = value; }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('property');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(InvocationInfoType.Property);
        expect(info.get).toBeDefined();
        expect(info.get).not.toBeNull();
        expect(info.get!.type).toBe(InvocationInfoType.PropertyGetter);
        expect(info.get!.count).toBe(0);
        expect(info.set).toBeDefined();
        expect(info.set).not.toBeNull();
        expect(info.set!.type).toBe(InvocationInfoType.PropertySetter);
        expect(info.set!.count).toBe(0);
        sut.subject.property = expected;
        expect(sut.subject.property).toBe(expected);
        expect(result).toBe(expected);
    }
);

test('mock function should create a valid mock object with method only',
    () => {
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: 20 };
        let result1 = -1;
        let result2 = '';

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number } {
                result1 = a1!;
                result2 = a2!;
                return { x: a1!, y: a1! * 2 };
            }
        });
        const info = sut.getInvocationInfo('returningMethod') as IInvocationInfo;
        assert(sut, 1);
        expect(sut.mockedMembers).toContain('returningMethod');
        expect(info).toBeDefined();
        expect(info).not.toBeNull();
        expect(info.type).toBe(InvocationInfoType.Method);
        expect(info.count).toBe(0);
        expect(sut.subject.returningMethod(expected1, expected2)).toStrictEqual(expectedResult);
        expect(result1).toBe(expected1);
        expect(result2).toBe(expected2);
    }
);

test('mock function should create a valid mock object with all members',
    () => {
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
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void {
                voidMethodArgs = [a1, a2, a3, a4, a5];
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number } {
                returningMethodArgs = [a1, a2];
                return { x: a1!, y: a1! * 2 };
            }
        });
        const propertyInfo = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        const readonlyPropertyInfo = sut.getInvocationInfo('readonlyProperty') as IPropertyInvocationInfo;
        const voidMethodInfo = sut.getInvocationInfo('voidMethod') as IInvocationInfo;
        const returningMethodInfo = sut.getInvocationInfo('returningMethod') as IInvocationInfo;
        assert(sut, 5);
        expect(sut.mockedMembers).toContain('field');
        expect(sut.mockedMembers).toContain('property');
        expect(sut.mockedMembers).toContain('readonlyProperty');
        expect(sut.mockedMembers).toContain('voidMethod');
        expect(sut.mockedMembers).toContain('returningMethod');
        expect(sut.getInvocationInfo('field')).not.toBeDefined();
        expect(propertyInfo).toBeDefined();
        expect(propertyInfo).not.toBeNull();
        expect(propertyInfo.type).toBe(InvocationInfoType.Property);
        expect(propertyInfo.get).toBeDefined();
        expect(propertyInfo.get).not.toBeNull();
        expect(propertyInfo.get!.type).toBe(InvocationInfoType.PropertyGetter);
        expect(propertyInfo.get!.count).toBe(0);
        expect(propertyInfo.set).toBeDefined();
        expect(propertyInfo.set).not.toBeNull();
        expect(propertyInfo.set!.type).toBe(InvocationInfoType.PropertySetter);
        expect(propertyInfo.set!.count).toBe(0);
        expect(readonlyPropertyInfo).toBeDefined();
        expect(readonlyPropertyInfo).not.toBeNull();
        expect(readonlyPropertyInfo.type).toBe(InvocationInfoType.Property);
        expect(readonlyPropertyInfo.get).toBeDefined();
        expect(readonlyPropertyInfo.get).not.toBeNull();
        expect(readonlyPropertyInfo.get!.type).toBe(InvocationInfoType.PropertyGetter);
        expect(readonlyPropertyInfo.get!.count).toBe(0);
        expect(readonlyPropertyInfo.set).toBeNull();
        expect(voidMethodInfo).toBeDefined();
        expect(voidMethodInfo).not.toBeNull();
        expect(voidMethodInfo.type).toBe(InvocationInfoType.Method);
        expect(voidMethodInfo.count).toBe(0);
        expect(returningMethodInfo).toBeDefined();
        expect(returningMethodInfo).not.toBeNull();
        expect(returningMethodInfo.type).toBe(InvocationInfoType.Method);
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

test('invocation info should cache first property getter call',
    () => {
        const result = 10;

        const sut = mock<Test>({
            get property() {
                return result;
            }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        expect(info.get!.count).toBe(0);
        expect(info.get!.getArguments(0)).toBeNull();
        expect(info.get!.getResult(0)).toBeNull();
        expect(sut.subject.property).toBe(result);
        expect(info.get!.count).toBe(1);
        expect(info.get!.getArguments(0)).toBeDefined();
        expect(info.get!.getArguments(0)).not.toBeNull();
        expect(info.get!.getArguments(0)!.length).toBe(0);
        expect(info.get!.getResult(0)).toBe(result);
    }
);

test('invocation info should cache next property getter calls',
    () => {
        const count = 5;
        const resultIncr = 10;
        let result = 0;

        const sut = mock<Test>({
            get property() {
                return (result += resultIncr);
            }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        expect(info.get!.count).toBe(0);
        expect(info.get!.getArguments(0)).toBeNull();
        expect(info.get!.getResult(0)).toBeNull();
        for (let i = 1; i <= count; ++i) {
            expect(sut.subject.property).toBe(resultIncr * i);
            expect(info.get!.count).toBe(i);
            expect(info.get!.getArguments(i - 1)!.length).toBe(0);
            expect(info.get!.getResult(i - 1)).toBe(resultIncr * i);
            expect(result).toBe(resultIncr * i);
        }
    }
);

test('invocation info should cache first property setter call',
    () => {
        const expectedResult = 10;
        let result = 0;

        const sut = mock<Test>({
            set property(value: number) {
                result = value;
            }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        expect(info.set!.count).toBe(0);
        expect(info.set!.getArguments(0)).toBeNull();
        expect(info.set!.getResult(0)).toBeNull();
        sut.subject.property = expectedResult;
        expect(info.set!.count).toBe(1);
        expect(info.set!.getArguments(0)).toBeDefined();
        expect(info.set!.getArguments(0)).not.toBeNull();
        expect(info.set!.getArguments(0)!.length).toBe(1);
        expect(info.set!.getArguments(0)![0]).toBe(expectedResult);
        expect(result).toBe(expectedResult);
    }
);

test('invocation info should cache next property setter calls',
    () => {
        const count = 5;
        const resultIncr = 10;
        let result = 0;

        const sut = mock<Test>({
            set property(value: number) {
                result = value;
            }
        });
        const info = sut.getInvocationInfo('property') as IPropertyInvocationInfo;
        expect(info.set!.count).toBe(0);
        expect(info.set!.getArguments(0)).toBeNull();
        expect(info.set!.getResult(0)).toBeNull();
        for (let i = 1; i <= count; ++i) {
            sut.subject.property = resultIncr * i;
            expect(info.set!.count).toBe(i);
            expect(info.set!.getArguments(i - 1)!.length).toBe(1);
            expect(info.set!.getArguments(i - 1)![0]).toBe(resultIncr * i);
            expect(info.set!.getResult(i - 1)).not.toBeDefined();
            expect(result).toBe(resultIncr * i);
        }
    }
);

test('invocation info should cache first method call',
    () => {
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: -10 };

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number } {
                return { x: a1!, y: -a1! };
            }
        });
        const info = sut.getInvocationInfo('returningMethod') as IInvocationInfo;
        expect(info.count).toBe(0);
        expect(info.getArguments(0)).toBeNull();
        expect(info.getResult(0)).toBeNull();
        expect(sut.subject.returningMethod(expected1, expected2)).toStrictEqual(expectedResult);
        expect(info.count).toBe(1);
        expect(info.getArguments(0)).toBeDefined();
        expect(info.getArguments(0)).not.toBeNull();
        expect(info.getArguments(0)!.length).toBe(2);
        expect(info.getArguments(0)![0]).toBe(expected1);
        expect(info.getArguments(0)![1]).toBe(expected2);
        expect(info.getResult(0)).toStrictEqual(expectedResult);
    }
);

test('invocation info should cache next method calls',
    () => {
        const count = 5;
        const resultIncr = 10;
        const expected1 = 10;
        const expected2 = 'foo';
        const expectedResult = { x: 10, y: -10 };

        const sut = mock<Test>({
            returningMethod(a1?: number, a2?: string): { x: number; y: number } {
                return { x: a1!, y: -a1! };
            }
        });
        const info = sut.getInvocationInfo('returningMethod') as IInvocationInfo;
        expect(info.count).toBe(0);
        expect(info.getArguments(0)).toBeNull();
        expect(info.getResult(0)).toBeNull();
        for (let i = 1; i <= count; ++i) {
            expect(sut.subject.returningMethod(expected1 * resultIncr, expected2 + String(expected1 * resultIncr)))
                .toStrictEqual({ x: expectedResult.x * resultIncr, y: expectedResult.y * resultIncr });
            expect(info.count).toBe(i);
            expect(info.getArguments(i - 1)!.length).toBe(2);
            expect(info.getArguments(i - 1)![0]).toBe(expected1 * resultIncr);
            expect(info.getArguments(i - 1)![1]).toBe(expected2 + String(expected1 * resultIncr));
            expect(info.getResult(i - 1)).toStrictEqual({ x: expectedResult.x * resultIncr, y: expectedResult.y * resultIncr });
        }
    }
);

test('created mock should be frozen',
    () => {
        const sut = mock<Test>({});
        expect(Object.isFrozen(sut)).toBe(true);
        expect(Object.isFrozen(sut.subject)).toBe(true);
        expect(Object.isFrozen(sut.mockedMembers)).toBe(true);
    }
);

test('all invocation info should be frozen',
    () => {
        let property = 0;

        const sut = mock<Test>({
            field: 'foo',
            get property(): number { return property; },
            set property(value: number) { property = value; },
            get readonlyProperty() { return 'bar'; },
            voidMethod(a1?: number, a2?: string, a3?: boolean, a4?: { x: number; y: number }, a5?: number[]): void {
                return;
            },
            returningMethod(a1?: number, a2?: string): { x: number; y: number } {
                return { x: 0, y: 0 };
            }
        });
        for (const member of sut.mockedMembers) {
            const info = sut.getInvocationInfo(member);
            if (info) {
                expect(Object.isFrozen(info)).toBe(true);
            }
        }
    }
);
