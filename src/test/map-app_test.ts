/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { MapApp } from '../map-app.js';

import { assert } from '@open-wc/testing';

suite('map-app', () => {
  test('is defined', () => {
    const el = document.createElement('map-app');
    assert.instanceOf(el, MapApp);
  });

  // Regression test for issue #1 ("Always loading..."):
  // enums.json/structs.json may be serialized as an empty object ({}) instead
  // of an array. fetchData must not throw "is not iterable" in that case.
  test('fetchData tolerates empty-object enums/structs', async () => {
    const originalFetch = window.fetch;
    window.fetch = ((input: RequestInfo | URL): Promise<Response> => {
      const url = String((input as Request).url ?? input);
      const body = /enums|structs/.test(url) ? {} : [];
      return Promise.resolve({
        json: () => Promise.resolve(body),
      } as Response);
    }) as typeof fetch;

    try {
      const el = document.createElement('map-app') as MapApp;
      el.game = 'fe8';
      el.version = 'U';
      el.map = 'code';
      await el.fetchData(true, false);
      assert.deepEqual(el.enums, {});
      assert.deepEqual(el.structs, {});
      assert.isFalse(el.fetchingData);
    } finally {
      window.fetch = originalFetch;
    }
  });

});
