function* f() {
  a = (yield) ? 1 : 1;
  a = yield 1 ? 1 : 1;
  a = (yield 1) ? 1 : 1;
  a = 1 ? yield : yield;
  a = 1 ? yield 1 : yield 1;
}

function* f() {
  a = yield* 1 ? 1 : 1;
  a = (yield* 1) ? 1 : 1;
  a = 1 ? yield* 1 : yield* 1;
}

async function f() {
  a = await 1 ? 1 : 1;
  a = (await 1) ? 1 : 1;
  a = 1 ? await 1 : await 1;
}
