# DataView.prototype.setInt8()

The `setInt8()` method stores a signed 8-bit integer (byte) value at the specified byte offset from the start of the [`DataView`](../dataview).

## Syntax

    setInt8(byteOffset, value)

### Parameters

`byteOffset`  
The offset, in byte, from the start of the view where to store the data.

`value`  
The value to set.

### Return value

[`undefined`](../undefined).

### Errors thrown

[`RangeError`](../rangeerror)  
Thrown if the `byteOffset` is set such as it would store beyond the end of the view.

## Examples

### Using the setInt8 method

    var buffer = new ArrayBuffer(8);
    var dataview = new DataView(buffer);
    dataview.setInt8(1, 3);
    dataview.getInt8(1); // 3

## Specifications

<table><thead><tr class="header"><th>Specification</th></tr></thead><tbody><tr class="odd"><td><a href="https://tc39.es/ecma262/#sec-dataview.prototype.setint8">ECMAScript Language Specification (ECMAScript) 
<br/>


<span class="small">#sec-dataview.prototype.setint8</span></a></td></tr></tbody></table>

## Browser compatibility

Desktop

Mobile

Chrome

Edge

Firefox

Internet Explorer

Opera

Safari

WebView Android

Chrome Android

Firefox for Android

Opera Android

Safari on IOS

Samsung Internet

`setInt8`

9

12

15

10

12.1

5.1

4

18

15

12.1

4.2

1.0

## See also

-   [`DataView`](../dataview)
-   [`ArrayBuffer`](../arraybuffer)

<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8" class="_attribution-link">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8</a>
