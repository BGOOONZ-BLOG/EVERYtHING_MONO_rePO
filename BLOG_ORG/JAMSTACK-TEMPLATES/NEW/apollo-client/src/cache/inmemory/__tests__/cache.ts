import gql, { disableFragmentWarnings } from 'graphql-tag';

import { stripSymbols } from '../../../utilities/testing/stripSymbols';
import { cloneDeep } from '../../../utilities/common/cloneDeep';
import { makeReference, Reference, makeVar, TypedDocumentNode, isReference } from '../../../core';
import { Cache } from '../../../cache';
import { InMemoryCache, InMemoryCacheConfig } from '../inMemoryCache';

disableFragmentWarnings();

describe('Cache', () => {
  function itWithInitialData(
    message: string,
    initialDataForCaches: ({ [key: string]: any })[],
    callback: (...caches: InMemoryCache[]) => any,
  ) {
    const cachesList: InMemoryCache[][] = [
      initialDataForCaches.map(data =>
        new InMemoryCache({
          addTypename: false,
        }).restore(cloneDeep(data)),
      ),
      initialDataForCaches.map(data =>
        new InMemoryCache({
          addTypename: false,
          resultCaching: false,
        }).restore(cloneDeep(data)),
      ),
    ];

    cachesList.forEach((caches, i) => {
      it(`${message} (${i + 1}/${cachesList.length})`,
         () => callback(...caches));
    });
  }

  function itWithCacheConfig(
    message: string,
    config: InMemoryCacheConfig,
    callback: (cache: InMemoryCache) => any,
  ) {
    const caches = [
      new InMemoryCache({
        addTypename: false,
        ...config,
        resultCaching: true,
      }),
      new InMemoryCache({
        addTypename: false,
        ...config,
        resultCaching: false,
      }),
    ];

    caches.forEach((cache, i) => {
      it(message + ` (${i + 1}/${caches.length})`, () => callback(cache));
    });
  }

  describe('readQuery', () => {
    itWithInitialData(
      'will read some data from the store',
      [
        {
          ROOT_QUERY: {
            a: 1,
            b: 2,
            c: 3,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  a
                }
              `,
            }),
          ),
        ).toEqual({ a: 1 });
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  b
                  c
                }
              `,
            }),
          ),
        ).toEqual({ b: 2, c: 3 });
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  a
                  b
                  c
                }
              `,
            }),
          ),
        ).toEqual({ a: 1, b: 2, c: 3 });
      },
    );

    itWithInitialData(
      'will read some deeply nested data from the store',
      [
        {
          ROOT_QUERY: {
            a: 1,
            b: 2,
            c: 3,
            d: makeReference('foo'),
          },
          foo: {
            e: 4,
            f: 5,
            g: 6,
            h: makeReference('bar'),
          },
          bar: {
            i: 7,
            j: 8,
            k: 9,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  a
                  d {
                    e
                  }
                }
              `,
            }),
          ),
        ).toEqual({ a: 1, d: { e: 4 } });
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  a
                  d {
                    e
                    h {
                      i
                    }
                  }
                }
              `,
            }),
          ),
        ).toEqual({ a: 1, d: { e: 4, h: { i: 7 } } });
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                {
                  a
                  b
                  c
                  d {
                    e
                    f
                    g
                    h {
                      i
                      j
                      k
                    }
                  }
                }
              `,
            }),
          ),
        ).toEqual({
          a: 1,
          b: 2,
          c: 3,
          d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } },
        });
      },
    );

    itWithInitialData(
      'will read some data from the store with variables',
      [
        {
          ROOT_QUERY: {
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":42})': 2,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                query($literal: Boolean, $value: Int) {
                  a: field(literal: true, value: 42)
                  b: field(literal: $literal, value: $value)
                }
              `,
              variables: {
                literal: false,
                value: 42,
              },
            }),
          ),
        ).toEqual({ a: 1, b: 2 });
      },
    );

    itWithInitialData(
      'will read some data from the store with null variables',
      [
        {
          ROOT_QUERY: {
            'field({"literal":false,"value":null})': 1,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readQuery({
              query: gql`
                query($literal: Boolean, $value: Int) {
                  a: field(literal: $literal, value: $value)
                }
              `,
              variables: {
                literal: false,
                value: null,
              },
            }),
          ),
        ).toEqual({ a: 1 });
      },
    );

    itWithInitialData(
      'should not mutate arguments passed in',
      [
        {
          ROOT_QUERY: {
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":42})': 2,
          },
        },
      ],
      proxy => {
        const options = {
          query: gql`
            query($literal: Boolean, $value: Int) {
              a: field(literal: true, value: 42)
              b: field(literal: $literal, value: $value)
            }
          `,
          variables: {
            literal: false,
            value: 42,
          },
        };

        const preQueryCopy = cloneDeep(options);
        expect(stripSymbols(proxy.readQuery(options))).toEqual({ a: 1, b: 2 });
        expect(preQueryCopy).toEqual(options);
      },
    );
  });

  describe('readFragment', () => {
    itWithInitialData(
      'will throw an error when there is no fragment',
      [
        // Empty data, but still want to test with/without result caching.
        {},
      ],
      proxy => {
        expect(() => {
          proxy.readFragment({
            id: 'x',
            fragment: gql`
              query {
                a
                b
                c
              }
            `,
          });
        }).toThrowError(
          'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.',
        );
        expect(() => {
          proxy.readFragment({
            id: 'x',
            fragment: gql`
              schema {
                query: Query
              }
            `,
          });
        }).toThrowError(
          'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
      },
    );

    itWithInitialData(
      'will throw an error when there is more than one fragment but no fragment name',
      [{}],
      proxy => {
        expect(() => {
          proxy.readFragment({
            id: 'x',
            fragment: gql`
              fragment a on A {
                a
              }

              fragment b on B {
                b
              }
            `,
          });
        }).toThrowError(
          'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
        expect(() => {
          proxy.readFragment({
            id: 'x',
            fragment: gql`
              fragment a on A {
                a
              }

              fragment b on B {
                b
              }

              fragment c on C {
                c
              }
            `,
          });
        }).toThrowError(
          'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
      },
    );

    itWithInitialData(
      'will read some deeply nested data from the store at any id',
      [
        {
          ROOT_QUERY: {
            __typename: 'Type1',
            a: 1,
            b: 2,
            c: 3,
            d: makeReference('foo'),
          },
          foo: {
            __typename: 'Foo',
            e: 4,
            f: 5,
            g: 6,
            h: makeReference('bar'),
          },
          bar: {
            __typename: 'Bar',
            i: 7,
            j: 8,
            k: 9,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fragmentFoo on Foo {
                  e
                  h {
                    i
                  }
                }
              `,
            }),
          ),
        ).toEqual({ e: 4, h: { i: 7 } });
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fragmentFoo on Foo {
                  e
                  f
                  g
                  h {
                    i
                    j
                    k
                  }
                }
              `,
            }),
          ),
        ).toEqual({ e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'bar',
              fragment: gql`
                fragment fragmentBar on Bar {
                  i
                }
              `,
            }),
          ),
        ).toEqual({ i: 7 });
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'bar',
              fragment: gql`
                fragment fragmentBar on Bar {
                  i
                  j
                  k
                }
              `,
            }),
          ),
        ).toEqual({ i: 7, j: 8, k: 9 });
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fragmentFoo on Foo {
                  e
                  f
                  g
                  h {
                    i
                    j
                    k
                  }
                }

                fragment fragmentBar on Bar {
                  i
                  j
                  k
                }
              `,
              fragmentName: 'fragmentFoo',
            }),
          ),
        ).toEqual({ e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'bar',
              fragment: gql`
                fragment fragmentFoo on Foo {
                  e
                  f
                  g
                  h {
                    i
                    j
                    k
                  }
                }

                fragment fragmentBar on Bar {
                  i
                  j
                  k
                }
              `,
              fragmentName: 'fragmentBar',
            }),
          ),
        ).toEqual({ i: 7, j: 8, k: 9 });
      },
    );

    itWithInitialData(
      'will read some data from the store with variables',
      [
        {
          foo: {
            __typename: 'Foo',
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":42})': 2,
          },
        },
      ],
      proxy => {
        expect(
          stripSymbols(
            proxy.readFragment({
              id: 'foo',
              fragment: gql`
                fragment foo on Foo {
                  a: field(literal: true, value: 42)
                  b: field(literal: $literal, value: $value)
                }
              `,
              variables: {
                literal: false,
                value: 42,
              },
            }),
          ),
        ).toEqual({ a: 1, b: 2 });
      },
    );

    itWithInitialData(
      'will return null when an id that can???t be found is provided',
      [
        // client1
        {},
        // client2
        {
          bar: { __typename: 'Bar', a: 1, b: 2, c: 3 },
        },
        // client3
        {
          foo: { __typename: 'Foo', a: 1, b: 2, c: 3 },
        },
      ],
      (client1, client2, client3) => {
        expect(
          stripSymbols(
            client1.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fooFragment on Foo {
                  a
                  b
                  c
                }
              `,
            }),
          ),
        ).toEqual(null);
        expect(
          stripSymbols(
            client2.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fooFragment on Foo {
                  a
                  b
                  c
                }
              `,
            }),
          ),
        ).toEqual(null);
        expect(
          stripSymbols(
            client3.readFragment({
              id: 'foo',
              fragment: gql`
                fragment fooFragment on Foo {
                  a
                  b
                  c
                }
              `,
            }),
          ),
        ).toEqual({ a: 1, b: 2, c: 3 });
      },
    );

    it("should not accidentally depend on unrelated entity fields", () => {
      const cache = new InMemoryCache({
        resultCaching: true,
      });

      const bothNamesData = {
        __typename: "Person",
        id: 123,
        firstName: "Ben",
        lastName: "Newman",
      };

      const firstNameQuery = gql`{ firstName }`;
      const lastNameQuery = gql`{ lastName }`;

      const id = cache.identify(bothNamesData);

      cache.writeQuery({
        id,
        query: firstNameQuery,
        data: bothNamesData,
      });

      const meta123 = {
        extraRootIds: ["Person:123"],
      };

      expect(cache.extract()).toEqual({
        __META: meta123,
        "Person:123": {
          __typename: "Person",
          id: 123,
          firstName: "Ben",
        },
      });

      const firstNameResult = cache.readQuery({
        id,
        query: firstNameQuery,
      });

      expect(firstNameResult).toEqual({
        __typename: "Person",
        firstName: "Ben",
      });

      cache.writeQuery({
        id,
        query: lastNameQuery,
        data: bothNamesData,
      });

      expect(cache.extract()).toEqual({
        __META: meta123,
        "Person:123": {
          __typename: "Person",
          id: 123,
          firstName: "Ben",
          lastName: "Newman",
        },
      });

      // This is the crucial test: modifying the lastName field should not
      // invalidate results that did not depend on the lastName field.
      expect(cache.readQuery({
        id,
        query: firstNameQuery,
      })).toBe(firstNameResult);

      const lastNameResult = cache.readQuery({
        id,
        query: lastNameQuery,
      });

      expect(lastNameResult).toEqual({
        __typename: "Person",
        lastName: "Newman",
      });

      cache.writeQuery({
        id,
        query: firstNameQuery,
        data: {
          ...bothNamesData,
          firstName: "Benjamin",
        },
      });

      expect(cache.extract()).toEqual({
        __META: meta123,
        "Person:123": {
          __typename: "Person",
          id: 123,
          firstName: "Benjamin",
          lastName: "Newman",
        },
      });

      const benjaminResult = cache.readQuery({
        id,
        query: firstNameQuery,
      });

      expect(benjaminResult).toEqual({
        __typename: "Person",
        firstName: "Benjamin",
      });

      // Still the same as it was?
      expect(firstNameResult).toEqual({
        __typename: "Person",
        firstName: "Ben",
      });

      // Updating the firstName should not have invalidated the
      // previously-read lastNameResult.
      expect(cache.readQuery({
        id,
        query: lastNameQuery,
      })).toBe(lastNameResult);
    });

    it("should not return null when ID found in optimistic layer", () => {
      const cache = new InMemoryCache();

      const fragment = gql`
        fragment NameFragment on Person {
          firstName
          lastName
        }
      `;

      const data = {
        __typename: "Person",
        id: 321,
        firstName: "Hugh",
        lastName: "Willson",
      };

      const id = cache.identify(data)!;

      cache.recordOptimisticTransaction(proxy => {
        proxy.writeFragment({ id, fragment, data });
      }, "optimistic Hugh");

      expect(cache.extract(false)).toEqual({});
      expect(cache.extract(true)).toEqual({
        __META: {
          extraRootIds: ["Person:321"],
        },
        "Person:321": {
          __typename: "Person",
          id: 321,
          firstName: "Hugh",
          lastName: "Willson",
        },
      });

      expect(
        cache.readFragment(
          { id, fragment },
          false, // not optimistic
        ),
      ).toBe(null);

      expect(
        cache.readFragment(
          { id, fragment },
          true, // optimistic
        ),
      ).toEqual({
        __typename: "Person",
        firstName: "Hugh",
        lastName: "Willson",
      });

      cache.writeFragment({
        id,
        fragment,
        data: {
          ...data,
          firstName: "HUGH",
          lastName: "WILLSON",
        },
      });

      expect(
        cache.readFragment(
          { id, fragment },
          false, // not optimistic
        ),
      ).toEqual({
        __typename: "Person",
        firstName: "HUGH",
        lastName: "WILLSON",
      });

      expect(
        cache.readFragment(
          { id, fragment },
          true, // optimistic
        ),
      ).toEqual({
        __typename: "Person",
        firstName: "Hugh",
        lastName: "Willson",
      });

      cache.removeOptimistic("optimistic Hugh");

      expect(
        cache.readFragment(
          { id, fragment },
          true, // optimistic
        ),
      ).toEqual({
        __typename: "Person",
        firstName: "HUGH",
        lastName: "WILLSON",
      });
    });
  });

  describe('writeQuery', () => {
    itWithInitialData('will write some data to the store', [{}], proxy => {
      proxy.writeQuery({
        data: { a: 1 },
        query: gql`
          {
            a
          }
        `,
      });

      expect((proxy as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 1,
        },
      });

      proxy.writeQuery({
        data: { b: 2, c: 3 },
        query: gql`
          {
            b
            c
          }
        `,
      });

      expect((proxy as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 1,
          b: 2,
          c: 3,
        },
      });

      proxy.writeQuery({
        data: { a: 4, b: 5, c: 6 },
        query: gql`
          {
            a
            b
            c
          }
        `,
      });

      expect((proxy as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 4,
          b: 5,
          c: 6,
        },
      });
    });

    it('will write some deeply nested data to the store', () => {
      const cache = new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              d: {
                // Deliberately silence "Cache data may be lost..."
                // warnings by unconditionally favoring the incoming data.
                merge: false,
              },
            },
          },
        },
      });

      cache.writeQuery({
        data: { a: 1, d: { e: 4 } },
        query: gql`
          {
            a
            d {
              e
            }
          }
        `,
      });

      expect((cache as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 1,
          d: {
            e: 4,
          },
        },
      });

      cache.writeQuery({
        data: { a: 1, d: { h: { i: 7 } } },
        query: gql`
          {
            a
            d {
              h {
                i
              }
            }
          }
        `,
      });

      expect((cache as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 1,
          // The new value for d overwrites the old value, since there
          // is no custom merge function defined for Query.d.
          d: {
            h: {
              i: 7,
            },
          },
        },
      });

      cache.writeQuery({
        data: {
          a: 1,
          b: 2,
          c: 3,
          d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } },
        },
        query: gql`
          {
            a
            b
            c
            d {
              e
              f
              g
              h {
                i
                j
                k
              }
            }
          }
        `,
      });

      expect((cache as InMemoryCache).extract()).toEqual({
        ROOT_QUERY: {
          __typename: "Query",
          a: 1,
          b: 2,
          c: 3,
          d: {
            e: 4,
            f: 5,
            g: 6,
            h: {
              i: 7,
              j: 8,
              k: 9,
            },
          },
        },
      });
    });

    itWithInitialData(
      'will write some data to the store with variables',
      [{}],
      proxy => {
        proxy.writeQuery({
          data: {
            a: 1,
            b: 2,
          },
          query: gql`
            query($literal: Boolean, $value: Int) {
              a: field(literal: true, value: 42)
              b: field(literal: $literal, value: $value)
            }
          `,
          variables: {
            literal: false,
            value: 42,
          },
        });

        expect((proxy as InMemoryCache).extract()).toEqual({
          ROOT_QUERY: {
            __typename: "Query",
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":42})': 2,
          },
        });
      },
    );

    itWithInitialData(
      'will write some data to the store with variables where some are null',
      [{}],
      proxy => {
        proxy.writeQuery({
          data: {
            a: 1,
            b: 2,
          },
          query: gql`
            query($literal: Boolean, $value: Int) {
              a: field(literal: true, value: 42)
              b: field(literal: $literal, value: $value)
            }
          `,
          variables: {
            literal: false,
            value: null,
          },
        });

        expect((proxy as InMemoryCache).extract()).toEqual({
          ROOT_QUERY: {
            __typename: "Query",
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":null})': 2,
          },
        });
      },
    );
  });

  describe('writeFragment', () => {
    itWithInitialData(
      'will throw an error when there is no fragment',
      [{}],
      proxy => {
        expect(() => {
          proxy.writeFragment({
            data: {},
            id: 'x',
            fragment: gql`
              query {
                a
                b
                c
              }
            `,
          });
        }).toThrowError(
          'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.',
        );
        expect(() => {
          proxy.writeFragment({
            data: {},
            id: 'x',
            fragment: gql`
              schema {
                query: Query
              }
            `,
          });
        }).toThrowError(
          'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
      },
    );

    itWithInitialData(
      'will throw an error when there is more than one fragment but no fragment name',
      [{}],
      proxy => {
        expect(() => {
          proxy.writeFragment({
            data: {},
            id: 'x',
            fragment: gql`
              fragment a on A {
                a
              }

              fragment b on B {
                b
              }
            `,
          });
        }).toThrowError(
          'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
        expect(() => {
          proxy.writeFragment({
            data: {},
            id: 'x',
            fragment: gql`
              fragment a on A {
                a
              }

              fragment b on B {
                b
              }

              fragment c on C {
                c
              }
            `,
          });
        }).toThrowError(
          'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.',
        );
      },
    );

    itWithCacheConfig(
      'will write some deeply nested data into the store at any id',
      {
        dataIdFromObject: (o: any) => o.id,
        addTypename: false,
      },
      proxy => {
        proxy.writeFragment({
          data: { __typename: 'Foo', e: 4, h: { id: 'bar', i: 7 } },
          id: 'foo',
          fragment: gql`
            fragment fragmentFoo on Foo {
              e
              h {
                i
              }
            }
          `,
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();
        proxy.writeFragment({
          data: { __typename: 'Foo', f: 5, g: 6, h: { id: 'bar', j: 8, k: 9 } },
          id: 'foo',
          fragment: gql`
            fragment fragmentFoo on Foo {
              f
              g
              h {
                j
                k
              }
            }
          `,
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();

        proxy.writeFragment({
          data: { i: 10, __typename: 'Bar' },
          id: 'bar',
          fragment: gql`
            fragment fragmentBar on Bar {
              i
            }
          `,
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();

        proxy.writeFragment({
          data: { j: 11, k: 12, __typename: 'Bar' },
          id: 'bar',
          fragment: gql`
            fragment fragmentBar on Bar {
              j
              k
            }
          `,
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();

        proxy.writeFragment({
          data: {
            __typename: 'Foo',
            e: 4,
            f: 5,
            g: 6,
            h: { __typename: 'Bar', id: 'bar', i: 7, j: 8, k: 9 },
          },
          id: 'foo',
          fragment: gql`
            fragment fooFragment on Foo {
              e
              f
              g
              h {
                i
                j
                k
              }
            }

            fragment barFragment on Bar {
              i
              j
              k
            }
          `,
          fragmentName: 'fooFragment',
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();

        proxy.writeFragment({
          data: { __typename: 'Bar', i: 10, j: 11, k: 12 },
          id: 'bar',
          fragment: gql`
            fragment fooFragment on Foo {
              e
              f
              g
              h {
                i
                j
                k
              }
            }

            fragment barFragment on Bar {
              i
              j
              k
            }
          `,
          fragmentName: 'barFragment',
        });

        expect((proxy as InMemoryCache).extract()).toMatchSnapshot();
      },
    );

    itWithCacheConfig(
      'writes data that can be read back',
      {
        addTypename: true,
      },
      proxy => {
        const readWriteFragment = gql`
          fragment aFragment on query {
            getSomething {
              id
            }
          }
        `;
        const data = {
          __typename: 'query',
          getSomething: { id: '123', __typename: 'Something' },
        };
        proxy.writeFragment({
          data,
          id: 'query',
          fragment: readWriteFragment,
        });

        const result = proxy.readFragment({
          fragment: readWriteFragment,
          id: 'query',
        });
        expect(stripSymbols(result)).toEqual(data);
      },
    );

    itWithCacheConfig(
      'will write some data to the store with variables',
      {
        addTypename: true,
      },
      proxy => {
        proxy.writeFragment({
          data: {
            a: 1,
            b: 2,
            __typename: 'Foo',
          },
          id: 'foo',
          fragment: gql`
            fragment foo on Foo {
              a: field(literal: true, value: 42)
              b: field(literal: $literal, value: $value)
            }
          `,
          variables: {
            literal: false,
            value: 42,
          },
        });

        expect((proxy as InMemoryCache).extract()).toEqual({
          __META: {
            extraRootIds: ["foo"],
          },
          foo: {
            __typename: 'Foo',
            'field({"literal":true,"value":42})': 1,
            'field({"literal":false,"value":42})': 2,
          },
        });
      },
    );
  });

  describe('performTransaction', () => {
    itWithInitialData('will not broadcast mid-transaction', [{}], cache => {
      let numBroadcasts = 0;

      const query = gql`
        {
          a
        }
      `;

      cache.watch({
        query,
        optimistic: false,
        callback: () => {
          numBroadcasts++;
        },
      });

      expect(numBroadcasts).toEqual(0);

      cache.performTransaction(proxy => {
        proxy.writeQuery({
          data: { a: 1 },
          query,
        });

        expect(numBroadcasts).toEqual(0);

        proxy.writeQuery({
          data: { a: 4, b: 5, c: 6 },
          query: gql`
            {
              a
              b
              c
            }
          `,
        });

        expect(numBroadcasts).toEqual(0);
      });

      expect(numBroadcasts).toEqual(1);
    });
  });

  describe('performOptimisticTransaction', () => {
    itWithInitialData('will only broadcast once', [{}], cache => {
      let numBroadcasts = 0;

      const query = gql`
        {
          a
        }
      `;

      cache.watch({
        query,
        optimistic: true,
        callback: () => {
          numBroadcasts++;
        },
      });

      expect(numBroadcasts).toEqual(0);

      cache.recordOptimisticTransaction(
        proxy => {
          proxy.writeQuery({
            data: { a: 1 },
            query,
          });

          expect(numBroadcasts).toEqual(0);

          proxy.writeQuery({
            data: { a: 4, b: 5, c: 6 },
            query: gql`
              {
                a
                b
                c
              }
            `,
          });

          expect(numBroadcasts).toEqual(0);
        },
        1 as any,
      );

      expect(numBroadcasts).toEqual(1);
    });
  });
});

describe("InMemoryCache#broadcastWatches", function () {
  it("should keep distinct consumers distinct (issue #5733)", function () {
    const cache = new InMemoryCache();
    const query = gql`
      query {
        value(arg: $arg) {
          name
        }
      }
    `;

    const receivedCallbackResults: [string, number, any][] = [];

    let nextWatchId = 1;
    function watch(arg: number) {
      const watchId = `id${nextWatchId++}`;
      cache.watch({
        query,
        variables: { arg },
        optimistic: false,
        callback(result) {
          receivedCallbackResults.push([watchId, arg, result]);
        },
      });
      return watchId;
    }

    const id1 = watch(1);
    expect(receivedCallbackResults).toEqual([]);

    function write(arg: number, name: string) {
      cache.writeQuery({
        query,
        variables: { arg },
        data: {
          value: { name },
        },
      });
    }

    write(1, "one");

    const received1 = [id1, 1, {
      result: {
        value: {
          name: "one",
        },
      },
      complete: true,
    }];

    expect(receivedCallbackResults).toEqual([
      received1,
    ]);

    const id2 = watch(2);

    expect(receivedCallbackResults).toEqual([
      received1,
    ]);

    write(2, "two");

    const received2 = [id2, 2, {
      result: {
        value: {
          name: "two",
        },
      },
      complete: true,
    }];

    expect(receivedCallbackResults).toEqual([
      received1,
      // New results:
      received1,
      received2,
    ]);

    const id3 = watch(1);
    const id4 = watch(1);

    write(1, "one");

    const received3 = [id3, 1, {
      result: {
        value: {
          name: "one",
        },
      },
      complete: true,
    }];

    const received4 = [id4, 1, {
      result: {
        value: {
          name: "one",
        },
      },
      complete: true,
    }];

    expect(receivedCallbackResults).toEqual([
      received1,
      received1,
      received2,
      // New results:
      received3,
      received4,
    ]);

    write(2, "TWO");

    const received2AllCaps = [id2, 2, {
      result: {
        value: {
          name: "TWO",
        },
      },
      complete: true,
    }];

    expect(receivedCallbackResults).toEqual([
      received1,
      received1,
      received2,
      received3,
      received4,
      // New results:
      received1,
      received2AllCaps,
      received3,
      received4,
    ]);
  });
});

describe("InMemoryCache#modify", () => {
  it("should work with single modifier function", () => {
    const cache = new InMemoryCache;
    const query = gql`
      query {
        a
        b
        c
      }
    `;

    cache.writeQuery({
      query,
      data: {
        a: 0,
        b: 0,
        c: 0,
      },
    });

    const resultBeforeModify = cache.readQuery({ query });
    expect(resultBeforeModify).toEqual({ a: 0, b: 0, c: 0 });

    cache.modify({
      // Passing a function for options.fields is equivalent to invoking
      // that function for all fields within the object.
      fields(value, { fieldName }) {
        switch (fieldName) {
          case "a": return value + 1;
          case "b": return value - 1;
          default: return value;
        }
      },
    });

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        a: 1,
        b: -1,
        c: 0,
      },
    });

    const resultAfterModify = cache.readQuery({ query });
    expect(resultAfterModify).toEqual({ a: 1, b: -1, c: 0 });
  });

  it("should work with multiple modifier functions", () => {
    const cache = new InMemoryCache;
    const query = gql`
      query {
        a
        b
        c
      }
    `;

    cache.writeQuery({
      query,
      data: {
        a: 0,
        b: 0,
        c: 0,
      },
    });

    const resultBeforeModify = cache.readQuery({ query });
    expect(resultBeforeModify).toEqual({ a: 0, b: 0, c: 0 });

    let checkedTypename = false;
    cache.modify({
      fields: {
        a(value) { return value + 1 },
        b(value) { return value - 1 },
        __typename(t: string, { readField }) {
          expect(t).toBe("Query");
          expect(readField("c")).toBe(0);
          checkedTypename = true;
          return t;
        },
      },
    });
    expect(checkedTypename).toBe(true);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        a: 1,
        b: -1,
        c: 0,
      },
    });

    const resultAfterModify = cache.readQuery({ query });
    expect(resultAfterModify).toEqual({ a: 1, b: -1, c: 0 });
  });

  it("should allow invalidation using details.INVALIDATE", () => {
    const cache = new InMemoryCache({
      typePolicies: {
        Book: {
          keyFields: ["isbn"],
        },
        Author: {
          keyFields: ["name"],
        },
      },
    });

    const query: TypedDocumentNode<{
      currentlyReading: {
        title: string;
        isbn: string;
        author: {
          name: string;
        },
      },
    }> = gql`
      query {
        currentlyReading {
          title
          isbn
          author {
            name
          }
        }
      }
    `;

    const currentlyReading = {
      __typename: "Book",
      isbn: "0374110034",
      title: "Beowulf: A New Translation",
      author: {
        __typename: "Author",
        name: "Maria Dahvana Headley",
      },
    };

    cache.writeQuery({
      query,
      data: {
        currentlyReading,
      }
    });

    function read() {
      return cache.readQuery({ query })!;
    }

    const initialResult = read();

    expect(cache.extract()).toMatchSnapshot();

    expect(cache.modify({
      id: cache.identify({
        __typename: "Author",
        name: "Maria Dahvana Headley",
      }),
      fields: {
        name(_, { INVALIDATE }) {
          return INVALIDATE;
        },
      },
    })).toBe(false); // Nothing actually modified.

    const resultAfterAuthorInvalidation = read();
    expect(resultAfterAuthorInvalidation).not.toBe(initialResult);
    expect(resultAfterAuthorInvalidation).toEqual(initialResult);

    expect(cache.modify({
      id: cache.identify({
        __typename: "Book",
        isbn: "0374110034",
      }),
      // Invalidate all fields of the Book entity.
      fields(_, { INVALIDATE }) {
        return INVALIDATE;
      },
    })).toBe(false); // Nothing actually modified.

    const resultAfterBookInvalidation = read();
    expect(resultAfterBookInvalidation).not.toBe(resultAfterAuthorInvalidation);
    expect(resultAfterBookInvalidation).toEqual(resultAfterAuthorInvalidation);
    expect(resultAfterBookInvalidation.currentlyReading.author).toEqual({
      __typename: "Author",
      name: "Maria Dahvana Headley",
    });
    expect(
      resultAfterBookInvalidation.currentlyReading.author
    ).toBe(
      resultAfterAuthorInvalidation.currentlyReading.author
    );
  });

  it("should allow deletion using details.DELETE", () => {
    const cache = new InMemoryCache({
      typePolicies: {
        Book: {
          keyFields: ["isbn"],
        },
        Author: {
          keyFields: ["name"],
        },
      },
    });

    const query = gql`
      query {
        currentlyReading {
          title
          isbn
          author {
            name
            yearOfBirth
          }
        }
      }
    `;

    const currentlyReading = {
      __typename: "Book",
      isbn: "147670032X",
      title: "Why We're Polarized",
      author: {
        __typename: "Author",
        name: "Ezra Klein",
        yearOfBirth: 1983,
      },
    };

    cache.writeQuery({
      query,
      data: {
        currentlyReading,
      }
    });

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        currentlyReading: {
          __ref: 'Book:{"isbn":"147670032X"}',
        },
      },
      'Book:{"isbn":"147670032X"}': {
        __typename: "Book",
        isbn: "147670032X",
        author: {
          __ref: 'Author:{"name":"Ezra Klein"}',
        },
        title: "Why We're Polarized",
      },
      'Author:{"name":"Ezra Klein"}': {
        __typename: "Author",
        name: "Ezra Klein",
        yearOfBirth: 1983,
      },
    });

    const authorId = cache.identify(currentlyReading.author)!;
    expect(authorId).toBe('Author:{"name":"Ezra Klein"}');

    cache.modify({
      id: authorId,
      fields: {
        yearOfBirth(yob) {
          return yob + 1;
        },
      },
    });

    const yobResult = cache.readFragment({
      id: authorId,
      fragment: gql`fragment YOB on Author { yearOfBirth }`,
    });

    expect(yobResult).toEqual({
      __typename: "Author",
      yearOfBirth: 1984,
    });

    const bookId = cache.identify(currentlyReading)!;

    // Modifying the Book in order to modify the Author is fancier than
    // necessary, but we want fancy use cases to work, too.
    cache.modify({
      id: bookId,
      fields: {
        author(author: Reference, { readField }) {
          expect(readField("title")).toBe("Why We're Polarized");
          expect(readField("name", author)).toBe("Ezra Klein");
          cache.modify({
            fields: {
              yearOfBirth(yob, { DELETE }) {
                expect(yob).toBe(1984);
                return DELETE;
              },
            },
            id: cache.identify({
              __typename: readField("__typename", author),
              name: readField("name", author),
            }),
          });
          return author;
        },
      },
    });

    const snapshotWithoutYOB = cache.extract();
    expect(snapshotWithoutYOB[authorId]!.yearOfBirth).toBeUndefined();
    expect("yearOfBirth" in snapshotWithoutYOB[authorId]!).toBe(false);
    expect(snapshotWithoutYOB).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        currentlyReading: {
          __ref: 'Book:{"isbn":"147670032X"}',
        },
      },
      'Book:{"isbn":"147670032X"}': {
        __typename: "Book",
        isbn: "147670032X",
        author: {
          __ref: 'Author:{"name":"Ezra Klein"}',
        },
        title: "Why We're Polarized",
      },
      'Author:{"name":"Ezra Klein"}': {
        __typename: "Author",
        name: "Ezra Klein",
        // yearOfBirth is gone now
      },
    });

    // Delete the whole Book.
    cache.modify({
      id: bookId,
      fields: (_, { DELETE }) => DELETE,
    });

    const snapshotWithoutBook = cache.extract();
    expect(snapshotWithoutBook[bookId]).toBeUndefined();
    expect(bookId in snapshotWithoutBook).toBe(false);
    expect(snapshotWithoutBook).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        currentlyReading: {
          __ref: 'Book:{"isbn":"147670032X"}',
        },
      },
      'Author:{"name":"Ezra Klein"}': {
        __typename: "Author",
        name: "Ezra Klein",
      },
    });

    // Delete all fields of the Author, which also removes the object.
    cache.modify({
      id: authorId,
      fields: {
        __typename(_, { DELETE }) { return DELETE },
        name(_, { DELETE }) { return DELETE },
      },
    });

    const snapshotWithoutAuthor = cache.extract();
    expect(snapshotWithoutAuthor[authorId]).toBeUndefined();
    expect(authorId in snapshotWithoutAuthor).toBe(false);
    expect(snapshotWithoutAuthor).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        currentlyReading: {
          __ref: 'Book:{"isbn":"147670032X"}',
        },
      },
    });

    cache.modify({
      fields: (_, { DELETE }) => DELETE,
    });

    expect(cache.extract()).toEqual({});
  });

  it("can remove specific items from paginated lists", () => {
    const cache = new InMemoryCache({
      typePolicies: {
        Thread: {
          keyFields: ["tid"],

          fields: {
            comments: {
              merge(existing: Reference[], incoming: Reference[], { args, mergeObjects }) {
                const merged = existing ? existing.slice(0) : [];
                const end = args!.offset + Math.min(args!.limit, incoming.length);
                for (let i = args!.offset; i < end; ++i) {
                  merged[i] = mergeObjects(merged[i], incoming[i - args!.offset]) as Reference;
                }
                return merged;
              },

              read(existing: Reference[], { args }) {
                const page = existing && existing.slice(
                  args!.offset,
                  args!.offset + args!.limit,
                );
                if (page && page.length > 0) {
                  return page;
                }
              },
            },
          },
        },

        Comment: {
          keyFields: ["id"],
        },
      },
    });

    const query = gql`
      query GetThread($offset: Int, $limit: Int) {
        thread {
          tid
          comments(offset: $offset, limit: $limit) {
            id
            text
          }
        }
      }
    `;

    cache.writeQuery({
      query,
      data: {
        thread: {
          __typename: "Thread",
          tid: 123,
          comments: [{
            __typename: "Comment",
            id: "c1",
            text: "first post",
          }, {
            __typename: "Comment",
            id: "c2",
            text: "I have thoughts",
          }, {
            __typename: "Comment",
            id: "c3",
            text: "friendly ping",
          }]
        }
      },
      variables: {
        offset: 0,
        limit: 3,
      },
    });

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        thread: {
          __ref: 'Thread:{"tid":123}',
        },
      },
      'Thread:{"tid":123}': {
        __typename: "Thread",
        tid: 123,
        comments: [
          { __ref: 'Comment:{"id":"c1"}' },
          { __ref: 'Comment:{"id":"c2"}' },
          { __ref: 'Comment:{"id":"c3"}' },
        ],
      },
      'Comment:{"id":"c1"}': {
        __typename: "Comment",
        id: "c1",
        text: "first post",
      },
      'Comment:{"id":"c2"}': {
        __typename: "Comment",
        id: "c2",
        text: "I have thoughts",
      },
      'Comment:{"id":"c3"}': {
        __typename: "Comment",
        id: "c3",
        text: "friendly ping",
      },
    });

    cache.modify({
      fields: {
        comments(comments: Reference[], { readField }) {
          expect(Object.isFrozen(comments)).toBe(true);
          expect(comments.length).toBe(3);
          const filtered = comments.filter(comment => {
            return readField("id", comment) !== "c1";
          });
          expect(filtered.length).toBe(2);
          return filtered;
        },
      },

      id: cache.identify({
        __typename: "Thread",
        tid: 123,
      }),
    });

    expect(cache.gc()).toEqual(['Comment:{"id":"c1"}']);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        thread: {
          __ref: 'Thread:{"tid":123}',
        },
      },
      'Thread:{"tid":123}': {
        __typename: "Thread",
        tid: 123,
        comments: [
          { __ref: 'Comment:{"id":"c2"}' },
          { __ref: 'Comment:{"id":"c3"}' },
        ],
      },
      'Comment:{"id":"c2"}': {
        __typename: "Comment",
        id: "c2",
        text: "I have thoughts",
      },
      'Comment:{"id":"c3"}': {
        __typename: "Comment",
        id: "c3",
        text: "friendly ping",
      },
    });
  });

  it("should not revisit deleted fields", () => {
    const cache = new InMemoryCache;
    const query = gql`query { a b c }`;

    cache.recordOptimisticTransaction(cache => {
      cache.writeQuery({
        query,
        data: {
          a: 1,
          b: 2,
          c: 3,
        },
      })
    }, "transaction");

    cache.modify({
      fields: {
        b(value, { DELETE }) {
          expect(value).toBe(2);
          return DELETE;
        },
      },
      optimistic: true,
    });

    expect(cache.extract(true)).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        a: 1,
        c: 3,
      },
    });

    cache.modify({
      fields(value, { fieldName }) {
        expect(fieldName).not.toBe("b");
        if (fieldName === "a") expect(value).toBe(1);
        if (fieldName === "c") expect(value).toBe(3);
      },
      optimistic: true,
    });

    cache.removeOptimistic("transaction");

    expect(cache.extract(true)).toEqual({});
  });

  it("should broadcast watches for queries with changed fields", () => {
    const cache = new InMemoryCache;
    const queryA = gql`{ a { value } }`;
    const queryB = gql`{ b { value } }`;

    cache.writeQuery({
      query: queryA,
      data: {
        a: {
          __typename: "A",
          id: 1,
          value: 123,
        },
      }
    });

    cache.writeQuery({
      query: queryB,
      data: {
        b: {
          __typename: "B",
          id: 1,
          value: 321,
        },
      }
    });

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        a: { __ref: "A:1" },
        b: { __ref: "B:1" },
      },
      "A:1": {
        __typename: "A",
        id: 1,
        value: 123,
      },
      "B:1": {
        __typename: "B",
        id: 1,
        value: 321,
      },
    });

    let aResults: any[] = [];
    cache.watch({
      query: queryA,
      optimistic: true,
      immediate: true,
      callback(data) {
        aResults.push(data);
      },
    });

    let bResults: any[] = [];
    cache.watch({
      query: queryB,
      optimistic: true,
      immediate: true,
      callback(data) {
        bResults.push(data);
      },
    });

    function makeResult(
      __typename: string,
      value: number,
      complete: boolean = true,
    ) {
      return {
        complete,
        result: {
          [__typename.toLowerCase()]: {
            __typename,
            value,
          },
        },
      };
    }

    const a123 = makeResult("A", 123);
    const b321 = makeResult("B", 321);

    expect(aResults).toEqual([a123]);
    expect(bResults).toEqual([b321]);

    const aId = cache.identify({ __typename: "A", id: 1 });
    const bId = cache.identify({ __typename: "B", id: 1 });

    cache.modify({
      id: aId,
      fields: {
        value(x: number) {
          return x + 1;
        },
      },
    });

    const a124 = makeResult("A", 124);

    expect(aResults).toEqual([a123, a124]);
    expect(bResults).toEqual([b321]);

    cache.modify({
      id: bId,
      fields: {
        value(x: number) {
          return x + 1;
        },
      },
    });

    const b322 = makeResult("B", 322);

    expect(aResults).toEqual([a123, a124]);
    expect(bResults).toEqual([b321, b322]);
  });

  it("should handle argument-determined field identities", () => {
    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            book: {
              keyArgs: ["isbn"],
            },
          },
        },
        Book: {
          keyFields: ["isbn"],
        },
      },
    });

    function addBook(isbn: string, title: string) {
      cache.writeQuery({
        query: gql`
          query {
            book(isbn: $isbn) {
              isbn
              title
            }
          }
        `,
        data: {
          book: {
            __typename: "Book",
            isbn,
            title,
          },
        },
        variables: {
          isbn,
        },
      });
    }

    addBook("147670032X", "Why We're Polarized");
    addBook("1760641790", "How To Do Nothing");
    addBook("0735211280", "Spineless");

    const fullSnapshot = {
      ROOT_QUERY: {
        __typename: "Query",
        'book:{"isbn":"0735211280"}': {
          __ref: 'Book:{"isbn":"0735211280"}',
        },
        'book:{"isbn":"147670032X"}': {
          __ref: 'Book:{"isbn":"147670032X"}',
        },
        'book:{"isbn":"1760641790"}': {
          __ref: 'Book:{"isbn":"1760641790"}',
        },
      },
      'Book:{"isbn":"147670032X"}': {
        __typename: "Book",
        isbn: "147670032X",
        title: "Why We're Polarized",
      },
      'Book:{"isbn":"1760641790"}': {
        __typename: "Book",
        isbn: "1760641790",
        title: "How To Do Nothing",
      },
      'Book:{"isbn":"0735211280"}': {
        __typename: "Book",
        isbn: "0735211280",
        title: "Spineless",
      },
    };

    expect(cache.extract()).toEqual(fullSnapshot);

    function check(isbnToDelete?: string) {
      let bookCount = 0;

      cache.modify({
        fields: {
          book(book: Reference, {
            fieldName,
            storeFieldName,
            isReference,
            readField,
            DELETE,
          }) {
            expect(fieldName).toBe("book");
            expect(isReference(book)).toBe(true);
            expect(typeof readField("title", book)).toBe("string");
            expect(readField("__typename", book)).toBe("Book");
            expect(readField({
              fieldName: "__typename",
              from: book,
            })).toBe("Book");

            const parts = storeFieldName.split(":");
            expect(parts.shift()).toBe("book");
            const keyArgs = JSON.parse(parts.join(":"));
            expect(typeof keyArgs.isbn).toBe("string");
            expect(Object.keys(keyArgs)).toEqual(["isbn"]);

            expect(readField("isbn", book)).toBe(keyArgs.isbn);

            if (isbnToDelete === keyArgs.isbn) {
              return DELETE;
            }

            ++bookCount;

            return book;
          },
        },
      });

      return bookCount;
    }

    // No change from repeatedly calling check().
    expect(check()).toBe(3);
    expect(check()).toBe(3);

    expect(check("0735211280")).toBe(2);
    expect(check("147670032X")).toBe(1);

    // No change from re-deleting already-deleted ISBNs.
    expect(check("0735211280")).toBe(1);
    expect(check("147670032X")).toBe(1);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        'book:{"isbn":"1760641790"}': {
          __ref: 'Book:{"isbn":"1760641790"}',
        },
      },
      'Book:{"isbn":"147670032X"}': {
        __typename: "Book",
        isbn: "147670032X",
        title: "Why We're Polarized",
      },
      'Book:{"isbn":"1760641790"}': {
        __typename: "Book",
        isbn: "1760641790",
        title: "How To Do Nothing",
      },
      'Book:{"isbn":"0735211280"}': {
        __typename: "Book",
        isbn: "0735211280",
        title: "Spineless",
      },
    });

    expect(cache.gc().sort()).toEqual([
      'Book:{"isbn":"0735211280"}',
      'Book:{"isbn":"147670032X"}',
    ]);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
        'book:{"isbn":"1760641790"}': {
          __ref: 'Book:{"isbn":"1760641790"}',
        },
      },
      'Book:{"isbn":"1760641790"}': {
        __typename: "Book",
        isbn: "1760641790",
        title: "How To Do Nothing",
      },
    });

    expect(check("1760641790")).toBe(0);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
      },
      'Book:{"isbn":"1760641790"}': {
        __typename: "Book",
        isbn: "1760641790",
        title: "How To Do Nothing",
      },
    });

    expect(cache.gc()).toEqual([
      'Book:{"isbn":"1760641790"}',
    ]);

    expect(cache.extract()).toEqual({
      ROOT_QUERY: {
        __typename: "Query",
      },
    });
  });

  it("should modify ROOT_QUERY only when options.id absent", function () {
    const cache = new InMemoryCache();

    cache.writeQuery({
      query: gql`query { field }`,
      data: {
        field: "oyez",
      },
    });

    const snapshot = {
      ROOT_QUERY: {
        __typename: "Query",
        field: "oyez",
      },
    };

    expect(cache.extract()).toEqual(snapshot);

    function check(id: any) {
      expect(cache.modify({
        id,
        fields(value) {
          throw new Error(`unexpected value: ${value}`);
        },
      })).toBe(false);
    }

    check(void 0);
    check(false);
    check(null);
    check("");
    check("bogus:id");

    expect(cache.extract()).toEqual(snapshot);
  });
});

describe("ReactiveVar and makeVar", () => {
  function makeCacheAndVar(resultCaching: boolean) {
    const nameVar = makeVar("Ben");
    const cache: InMemoryCache = new InMemoryCache({
      resultCaching,
      typePolicies: {
        Person: {
          fields: {
            name() {
              return nameVar();
            },
          },
        },
      },
    });

    const query = gql`
      query {
        onCall {
          name
        }
      }
    `;

    cache.writeQuery({
      query,
      data: {
        onCall: {
          __typename: "Person",
        },
      },
    });

    return {
      cache,
      nameVar,
      query,
    };
  }

  it("should work with resultCaching enabled (default)", () => {
    const { cache, nameVar, query } = makeCacheAndVar(true);

    const result1 = cache.readQuery({ query });
    expect(result1).toEqual({
      onCall: {
        __typename: "Person",
        name: "Ben",
      },
    });

    // No change before updating the nameVar.
    expect(cache.readQuery({ query })).toBe(result1);

    expect(nameVar()).toBe("Ben");
    expect(nameVar("Hugh")).toBe("Hugh");

    const result2 = cache.readQuery({ query });
    expect(result2).not.toBe(result1);
    expect(result2).toEqual({
      onCall: {
        __typename: "Person",
        name: "Hugh",
      },
    });

    expect(nameVar()).toBe("Hugh");
    expect(nameVar("James")).toBe("James");

    expect(cache.readQuery({ query })).toEqual({
      onCall: {
        __typename: "Person",
        name: "James",
      },
    });
  });

  it("should work with resultCaching disabled (unusual)", () => {
    const { cache, nameVar, query } = makeCacheAndVar(false);

    const result1 = cache.readQuery({ query });
    expect(result1).toEqual({
      onCall: {
        __typename: "Person",
        name: "Ben",
      },
    });

    const result2 = cache.readQuery({ query });
    // Without resultCaching, equivalent results will not be ===.
    expect(result2).not.toBe(result1);
    expect(result2).toEqual(result1);

    expect(nameVar()).toBe("Ben");
    expect(nameVar("Hugh")).toBe("Hugh");

    const result3 = cache.readQuery({ query });
    expect(result3).toEqual({
      onCall: {
        __typename: "Person",
        name: "Hugh",
      },
    });
  });

  it("should forget cache once all watches are cancelled", () => {
    const { cache, nameVar, query } = makeCacheAndVar(false);
    const spy = jest.spyOn(nameVar, "forgetCache");

    const diffs: Cache.DiffResult<any>[] = [];
    const watch = () => cache.watch({
      query,
      optimistic: true,
      immediate: true,
      callback(diff) {
        diffs.push(diff);
      },
    });

    const unwatchers = [
      watch(),
      watch(),
      watch(),
      watch(),
      watch(),
    ];

    expect(diffs.length).toBe(5);

    expect(cache["watches"].size).toBe(5);
    expect(spy).not.toBeCalled();

    unwatchers.pop()!();
    expect(cache["watches"].size).toBe(4);
    expect(spy).not.toBeCalled();

    unwatchers.shift()!();
    expect(cache["watches"].size).toBe(3);
    expect(spy).not.toBeCalled();

    unwatchers.pop()!();
    expect(cache["watches"].size).toBe(2);
    expect(spy).not.toBeCalled();

    expect(diffs.length).toBe(5);
    unwatchers.push(watch());
    expect(diffs.length).toBe(6);

    expect(unwatchers.length).toBe(3);
    unwatchers.forEach(unwatch => unwatch());

    expect(cache["watches"].size).toBe(0);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(cache);
  });

  it("should broadcast only once for multiple reads of same variable", () => {
    const nameVar = makeVar("Ben");
    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            name() {
              return nameVar();
            },
          },
        },
      },
    });

    // TODO This should not be necessary, but cache.readQuery currently
    // returns null if we read a query before writing any queries.
    cache.restore({
      ROOT_QUERY: {}
    });

    const broadcast = cache["broadcastWatches"];
    let broadcastCount = 0;
    cache["broadcastWatches"] = function () {
      ++broadcastCount;
      return broadcast.apply(this, arguments);
    };

    const query = gql`
      query {
        name1: name
        name2: name
      }
    `;

    const watchDiffs: Cache.DiffResult<any>[] = [];
    cache.watch({
      query,
      optimistic: true,
      callback(diff) {
        watchDiffs.push(diff);
      },
    });

    const benResult = cache.readQuery({ query });
    expect(benResult).toEqual({
      name1: "Ben",
      name2: "Ben",
    });

    expect(watchDiffs).toEqual([]);

    expect(broadcastCount).toBe(0);
    nameVar("Jenn");
    expect(broadcastCount).toBe(1);

    const jennResult = cache.readQuery({ query });
    expect(jennResult).toEqual({
      name1: "Jenn",
      name2: "Jenn",
    });

    expect(watchDiffs).toEqual([
      {
        complete: true,
        result: {
          name1: "Jenn",
          name2: "Jenn",
        },
      },
    ]);

    expect(broadcastCount).toBe(1);
    nameVar("Hugh");
    expect(broadcastCount).toBe(2);

    const hughResult = cache.readQuery({ query });
    expect(hughResult).toEqual({
      name1: "Hugh",
      name2: "Hugh",
    });

    expect(watchDiffs).toEqual([
      {
        complete: true,
        result: {
          name1: "Jenn",
          name2: "Jenn",
        },
      },
      {
        complete: true,
        result: {
          name1: "Hugh",
          name2: "Hugh",
        },
      },
    ]);
  });

  it('should broadcast to manually added caches', () => {
    const rv = makeVar(0);
    const cache = new InMemoryCache;
    const query = gql`query { value }`;
    const diffs: Cache.DiffResult<any>[] = [];
    const watch: Cache.WatchOptions = {
      query,
      optimistic: true,
      callback(diff) {
        diffs.push(diff);
      },
    };

    cache.writeQuery({
      query,
      data: {
        value: "oyez",
      },
    });

    const cancel = cache.watch(watch);

    // This should not trigger a broadcast, since we haven't associated
    // this cache with rv yet.
    rv(rv() + 1);
    expect(diffs).toEqual([]);

    // The rv.attachCache method returns rv, for chaining.
    rv.attachCache(cache)(rv() + 1);

    expect(diffs).toEqual([
      {
        complete: true,
        result: {
          value: "oyez",
        },
      },
    ]);

    cache.writeQuery({
      query,
      broadcast: false,
      data: {
        value: "oyez, oyez",
      },
    });

    expect(diffs).toEqual([
      {
        complete: true,
        result: {
          value: "oyez",
        },
      },
    ]);

    rv(rv() + 1);
    expect(diffs).toEqual([
      {
        complete: true,
        result: {
          value: "oyez",
        },
      },
      {
        complete: true,
        result: {
          value: "oyez, oyez",
        },
      },
    ]);

    expect(rv.forgetCache(cache)).toBe(true);

    cache.writeQuery({
      query,
      broadcast: false,
      data: {
        value: "oyez, oyez, oyez",
      },
    });

    // Since we called rv.forgetCache(cache) above, updating rv here
    // should not trigger a broadcast.
    rv(rv() + 1);
    expect(diffs).toEqual([
      {
        complete: true,
        result: {
          value: "oyez",
        },
      },
      {
        complete: true,
        result: {
          value: "oyez, oyez",
        },
      },
    ]);

    cache["broadcastWatches"]();
    expect(diffs).toEqual([
      {
        complete: true,
        result: {
          value: "oyez",
        },
      },
      {
        complete: true,
        result: {
          value: "oyez, oyez",
        },
      },
      {
        complete: true,
        result: {
          value: "oyez, oyez, oyez",
        },
      },
    ]);

    cancel();

    expect(rv()).toBe(4);
  });
});

describe('TypedDocumentNode<Data, Variables>', () => {
  type Book = {
    isbn?: string;
    title: string;
    author: {
      name: string;
    };
  };

  const query: TypedDocumentNode<
    { book: Book },
    { isbn: string }
  > = gql`query GetBook($isbn: String!) {
    book(isbn: $isbn) {
      title
      author {
        name
      }
    }
  }`;

  const fragment: TypedDocumentNode<Book> = gql`
    fragment TitleAndAuthor on Book {
      title
      isbn
      author {
        name
      }
    }
  `;

  it('should determine Data and Variables types of {write,read}{Query,Fragment}', () => {
    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            book(existing, { args, toReference }) {
              return existing ?? (args && toReference({
                __typename: "Book",
                isbn: args.isbn,
              }));
            }
          }
        },

        Book: {
          keyFields: ["isbn"],
        },

        Author: {
          keyFields: ["name"],
        },
      },
    });

    // We need to define these objects separately from calling writeQuery,
    // because passing them directly to writeQuery will trigger excess property
    // warnings due to the extra __typename and isbn fields. Internally, we
    // almost never pass object literals to writeQuery or writeFragment, so
    // excess property checks should not be a problem in practice.
    const jcmAuthor = {
      __typename: "Author",
      name: "John C. Mitchell",
    };

    const ffplBook = {
      __typename: "Book",
      isbn: "0262133210",
      title: "Foundations for Programming Languages",
      author: jcmAuthor,
    };

    const ffplVariables = {
      isbn: "0262133210",
    };

    cache.writeQuery({
      query,
      variables: ffplVariables,
      data: {
        book: ffplBook,
      },
    });

    expect(cache.extract()).toMatchSnapshot();

    const ffplQueryResult = cache.readQuery({
      query,
      variables: ffplVariables,
    });

    if (ffplQueryResult === null) throw new Error("null result");
    expect(ffplQueryResult.book.isbn).toBeUndefined();
    expect(ffplQueryResult.book.author.name).toBe(jcmAuthor.name);
    expect(ffplQueryResult).toEqual({
      book: {
        __typename: "Book",
        title: "Foundations for Programming Languages",
        author: {
          __typename: "Author",
          name: "John C. Mitchell",
        },
      },
    });

    const sicpBook = {
      __typename: "Book",
      isbn: "0262510871",
      title: "Structure and Interpretation of Computer Programs",
      author: {
        __typename: "Author",
        name: "Harold Abelson",
      },
    };

    const sicpRef = cache.writeFragment({
      fragment,
      data: sicpBook,
    });

    expect(isReference(sicpRef)).toBe(true);
    expect(cache.extract()).toMatchSnapshot();

    const ffplFragmentResult = cache.readFragment({
      fragment,
      id: cache.identify(ffplBook),
    });
    if (ffplFragmentResult === null) throw new Error("null result");
    expect(ffplFragmentResult.title).toBe(ffplBook.title);
    expect(ffplFragmentResult.author.name).toBe(ffplBook.author.name);
    expect(ffplFragmentResult).toEqual(ffplBook);

    // This uses the read function for the Query.book field.
    const sicpReadResult = cache.readQuery({
      query,
      variables: {
        isbn: sicpBook.isbn,
      },
    });
    if (sicpReadResult === null) throw new Error("null result");
    expect(sicpReadResult.book.isbn).toBeUndefined();
    expect(sicpReadResult.book.title).toBe(sicpBook.title);
    expect(sicpReadResult.book.author.name).toBe(sicpBook.author.name);
    expect(sicpReadResult).toEqual({
      book: {
        __typename: "Book",
        title: "Structure and Interpretation of Computer Programs",
        author: {
          __typename: "Author",
          name: "Harold Abelson",
        },
      },
    });
  });
});
