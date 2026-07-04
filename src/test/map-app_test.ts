/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { MapApp } from '../map-app.js';
import { GameData } from '../entry-types.js';

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

  // Regression test for issue #1 (ROM Data & RAM):
  // data/ram entries may have a null type (plain labels) or a struct type whose
  // struct isn't loaded. Building them and computing length must not throw.
  test('GameData tolerates null-type and unknown-struct entries', () => {
    const structs = {};
    // Untyped label entry (type: null) — must not throw on construction.
    const untyped = new GameData(
      { label: 'Init', desc: 'Init', type: null, addr: '8000000' });
    assert.strictEqual(untyped.typeStr(), '');
    assert.isNaN(untyped.getLength(structs));
    // Struct-typed entry whose struct isn't loaded — length is NaN, no throw.
    const structVar = new GameData(
      { label: 'AnimVar', desc: 'x', type: 'BattleAnim', addr: '8000010' });
    assert.strictEqual(structVar.typeStr(), 'BattleAnim');
    assert.isNaN(structVar.getLength(structs));
    // Primitive entry still works.
    const prim = new GameData(
      { label: 'Prim', desc: 'y', type: 'u16', addr: '8000020', count: '4' });
    assert.strictEqual(prim.getLength(structs), 8);
  });

});
