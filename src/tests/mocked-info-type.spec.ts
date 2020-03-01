import { MockedInfoType } from '../core/mocked-info-type.enum';

test('mocked info type uniqueness',
    () =>
    {
        const values: number[] = [];
        for (const member in MockedInfoType)
            if (isNaN(Number(member)))
                values.push(MockedInfoType[member] as any);

        expect(new Set(values).size).toBe(values.length);
    }
);
