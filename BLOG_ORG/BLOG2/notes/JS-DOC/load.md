# Atomics.load()

The static ` Atomics``.load() ` method returns a value at a given position in the array.

## Syntax

    Atomics.load(typedArray, index)

### Parameters

`typedArray`  
An integer typed array. One of [`Int8Array`](../int8array), [`Uint8Array`](../uint8array), [`Int16Array`](../int16array), [`Uint16Array`](../uint16array), [`Int32Array`](../int32array), [`Uint32Array`](../uint32array), [`BigInt64Array`](../bigint64array), or [`BigUint64Array`](../biguint64array).

`index`  
The position in the `typedArray` to load from.

### Return value

The value at the given position (`typedArray[index]`).

### Exceptions

-   Throws a [`TypeError`](../typeerror), if `typedArray` is not one of the allowed integer types.
-   Throws a [`RangeError`](../rangeerror), if `index` is out of bounds in the `typedArray`.

## Examples

### Using `load`

    const sab = new SharedArrayBuffer(1024);
    const ta = new Uint8Array(sab);

    Atomics.add(ta, 0, 12);
    Atomics.load(ta, 0); // 12

## Specifications

<table><thead><tr class="header"><th>Specification</th></tr></thead><tbody><tr class="odd"><td><a href="https://tc39.es/ecma262/#sec-atomics.load">ECMAScript Language Specification (ECMAScript) 
<br/>


<span class="small">#sec-atomics.load</span></a></td></tr></tbody></table>

`load`

68

60-63

Chrome disabled `SharedArrayBuffer` on January 5, 2018 to help reduce the efficacy of [speculative side-channel attacks](https://www.chromium.org/Home/chromium-security/ssca). This was a temporary removal while mitigations were put in place.

79

16-17

Support was removed to mitigate [speculative execution side-channel attacks (Windows blog)](https://blogs.windows.com/msedgedev/2018/01/03/speculative-execution-mitigations-microsoft-edge-internet-explorer).

78

57

Support was disabled by default to mitigate [speculative execution side-channel attacks (Mozilla Security Blog)](https://blog.mozilla.org/security/2018/01/03/mitigations-landing-new-class-timing-attack/).

55-57

46-55

No

No

10.1-11.1

60-63

Chrome disabled `SharedArrayBuffer` on January 5, 2018 to help reduce the efficacy of [speculative side-channel attacks](https://www.chromium.org/Home/chromium-security/ssca). This is intended as a temporary measure until other mitigations are in place.

60-63

Chrome disabled SharedArrayBuffer on January 5, 2018 to help reduce the efficacy of [speculative side-channel attacks](https://www.chromium.org/Home/chromium-security/ssca). This is intended as a temporary measure until other mitigations are in place.

57

Support was disabled by default to mitigate [speculative execution side-channel attacks (Mozilla Security Blog)](https://blog.mozilla.org/security/2018/01/03/mitigations-landing-new-class-timing-attack/).

55-57

46-55

No

10.3-11.3

No

Chrome disabled SharedArrayBuffer on January 5, 2018 to help reduce the efficacy of [speculative side-channel attacks](https://www.chromium.org/Home/chromium-security/ssca). This is intended as a temporary measure until other mitigations are in place.

## See also

-   [`Atomics`](../atomics)
-   [`Atomics.store()`](store)

<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/load" class="_attribution-link">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics/load</a>
