# FRL TypeScript mocking

[![Build Status](https://travis-ci.com/CalionVarduk/ts-mocking.png?branch=master)](https://travis-ci.com/CalionVarduk/ts-mocking)
[![Coverage Status](https://coveralls.io/repos/github/CalionVarduk/ts-mocking/badge.svg)](https://coveralls.io/github/CalionVarduk/ts-mocking)
[![npm version](https://badge.fury.io/js/frl-ts-mocking.svg)](https://www.npmjs.com/package/frl-ts-mocking)
[![Dependency status](https://david-dm.org/CalionVarduk/ts-mocking/status.svg)](https://david-dm.org/CalionVarduk/ts-mocking)
[![Dev Dependency Status](https://david-dm.org/CalionVarduk/ts-mocking/dev-status.svg)](https://david-dm.org/CalionVarduk/ts-mocking?type=dev)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/CalionVarduk/ts-mocking/blob/master/LICENSE)

This little project allows to easily create object mocks and partial object mocks for your unit testing needs.

## A. Installation

If you are using `npm`, then simply run the `npm install frl-ts-mocking` CLI command to get the latest version.

If you are using `yarn`, then go with the `yarn add frl-ts-mocking` command.

## B. The [mock\<T\>](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mock.ts#L94) function

This function is the bread and butter of this project. As the name suggests, it allows you to create a mocked object.

Let's assume we have an abstract class `Foo` that looks like this:

```typescript
abstract class Foo
{
    public abstract field: string;
    public abstract property: number;
    public abstract method(a: boolean, b: string): Date;
}
```

Now, let's create a mocked instance of this class, like so:

```typescript
import { mock } from 'frl-ts-mocking';
// ...
const fooMock = mock<Foo>({});
```

While this usage creates a valid mock, it won't really help us too much with our unit tests, since we have provided an empty mock setup (that's the mock function's argument).

Let's actually create a proper mock, that handles all 3 members of the `Foo` class:

```typescript
const fooMock = mock<Foo>({
    field: 'foo',
    get property(): number { return 123; },
    set property(value: number) { return; },
    method(a: boolean, b: string): Date { return new Date('2019-06-01'); }
});
```

That's it!

## C. The [IMock\<T\>](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mock.interface.ts) interface

Now, the `fooMock` object implements an `IMock<T>` interface, which contains some interesting members:

- `subject` - holds a reference to the actual mocked object. You can use it to invoke mocked members, like so:

```typescript
    // field will be equal to 'foo'
    const field = fooMock.subject.field;
    // property will be equal to 123
    const property = fooMock.subject.property;
    // method will be equal to new Date('2019-06-01')
    const method = fooMock.subject.method(true, 'bar');
```

- `mockedMembers` - a set that stores names of all mocked members. In our `fooMock` example, it will contain `'field'`, `'property'` and `'method'` entries.

- `getMemberInfo` - this method returns an invocation metadata of the requested mocked member, which allows us to check how many times a method or a property has been invoked, with what arguments and what did it return.<br/>**Important!** It will _always_ return `null` for mocked fields (e.g. `fooMock.getMemberInfo('field')`).

**NOTE:**<br/>
Be careful about using `instanceof` on `IMock<T>.subject`, e.g. `fooMock.subject instanceof Foo` will return `false`. The `mock` function doesn't actually create objects of type `T`. An exception to that rule are `IMock`s returned by the `partialMock` function, but more on that later in section `G`.

## D. The [IMockedPropertyInfo](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mocked-property-info.interface.ts) interface

Calling the `getMemberInfo` method on our `fooMock` object with the `'property'` argument will return an invocation metadata object that implements the `IMockedPropertyInfo` interface.

```typescript
const propertyInfo = fooMock.getMemberInfo('property') as IMockedPropertyInfo;
```

This interface has 3 members:

- `type` - specifies the invocation metadata type. For properties, it is always equal to `MockedInfoType.Property`. [MockedInfoType](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mocked-info-type.enum.ts) is a simple enum that contains all possible invocation metadata types.

- `get` - returns the property's getter invocation metadata, if the getter has been mocked. Otherwise, it will return `null`.

- `set` - returns the property's setter invocation metadata, if the setter has been mocked. Otherwise, it will return `null`.

## E. The [IMockedMethodInfo](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mocked-method-info.interface.ts) interface

The `IMockedMethodInfo` represents single method's invocation metadata. Objects, that implement this interface, can be accessed by calling the `getMemberInfo` with an argument, that specifies a method's name, or by calling the `get` and `set` properties of the `IMockedPropertyInfo` objects.

```typescript
const methodInfo = fooMock.getMemberInfo('method') as IMockedMethodInfo;
const propertyGetInfo = propertyInfo.get!;
const propertySetInfo = propertyInfo.set!;
```

This interface has 4 members:

- `type` - specifies the invocation metadata type. For methods, it is always equal to `MockedInfoType.Method`. For property getters, it is always equal to `MockedInfoType.PropertyGetter` and for property setters, it is always equal to `MockedInfoType.PropertySetter`.

- `count` - returns how many times this method mock has been invoked.

- `getData` - this method returns data for the specific method's invocation, like provided arguments or returned result. Invocations are identified by their indexes, starting from `0` with the first invocation.

- `clear` - clears all invocation data for this method and resets the counter.

## F. The [IInvocationData](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/invocation-data.interface.ts) interface

The `IInvocationData` contains single invocation's properties, like:

- `no` - specifies invocation's index.

- `globalNo` - specifies invocation's global index. The global index is incremented every time any mocked member invocation takes place, of any mocked object.

- `timestamp` - returns invocation's timestamp. It is equal to `new Date().valueOf()` at the moment of the invocation.

- `result` - specifies invocation's returned method result.

- `arguments` - specifies method arguments provided to this invocation.

Let's see what data has been gathered from our earlier mocked member invocations:

```typescript
// returns 1
let count = methodInfo.count;

const methodInvocation = methodInfo.getData(0)!;
// returns 0
let no = methodInvocation.no;
// returns 1
let globalNo = methodInvocation.globalNo;
// returns new Date('2019-06-01')
let result = methodInvocation.result;
// returns [true, 'bar']
let args = methodInvocation.arguments;

// returns 1
count = propertyGetInfo.count;

const propertyGetInvocation = propertyGetInfo.getData(0)!;
// returns 0
no = propertyGetInfo.no;
// returns 0
globalNo = propertyGetInfo.globalNo;
// returns 123
result = propertyGetInfo.result;
// returns []
args = propertyGetInfo.arguments;

// returns 0, since we haven't called the fooMock.subject.property setter
count = propertySetInfo.count;

// returns null
const propertySetInvocation = propertySetInfo.getData(0);
```

And there we have it.

## G. The [partialMock\<T\>](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mock.ts#L105) function

This function is very similar to the `mock<T>` function. The difference between these two is that the `partialMock<T>` allows you to modify an already existing object of type `T` and treat it as the mock subject, unlike the `mock<T>`, which creates the subject from scratch.

Let's assume, that we have a class `Bar` that extends the class `Foo`:

```typescript
class Bar extends Foo
{
    public field: string = 'foo';
    public property: number = 123;
    public method(a: boolean, b: string): Date
    {
        return new Date('2019-06-01');
    }
}
```

Let's see how to create a partial mock for an instance of the `Bar` class:

```typescript
const bar = new Bar();
const barMock = partialMock<T>(bar, {
    get property(): number { return 321; }
    set property(value: number) { return; }
});
```

There we go. The `barMock.subject` will be strictly equal to the `bar` object. Because of that, the `barMock.subject instanceof Bar` will return `true`.

As you can see, the `partialMock<T>` function accepts two parameters. The first one specifies the subject that we want to partially mock, and the second one represents the mock setup.

In the example above, we have mocked only the `property` member, which means that the `field` and `method` members will behave normally. It also means, that the `barMock.mockedMembers` set contains only the `'property'` entry.

## H. What about `this`?

It is possible to use the `this` keyword inside the mocked member bodies and it's as simple as:

```typescript
const bar = new Bar();
const barMock = partialMock<T>(bar, {
    get property(): number { return Number(this.field); }
    set property(value: number) { this.field = String(value); }
});
```

`this` inside setup object always refers to the mock's subject. The same rule applies to mocks built by the `mock<T>` function.

## I. Miscellaneous

There are a few additional functions that don't really belong to any category. These are:

- [resetGlobalMockInvocationNo](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mock.ts#L148) - allows to reset the `IInvocationData.globalNo` generator to `0`. This may for example be called before each test.

- [getGlobalMockInvocationNo](https://github.com/CalionVarduk/ts-mocking/blob/master/src/core/mock.ts#L154) - allows to lookup the next value for `IInvocationData.globalNo`.
