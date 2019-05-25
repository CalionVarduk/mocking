import { InvocationInfoType } from '../core/invocation-info-type.enum';

test('invocation info type uniqueness',
    () => {
        const values: number[] = [];
        for (const member in InvocationInfoType) {
            if (isNaN(Number(member))) {
                values.push(InvocationInfoType[member] as any);
            }
        }
        expect(new Set(values).size).toBe(values.length);
    }
);
