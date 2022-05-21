/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

import "../_version.mjs";

// Callbacks to be executed whenever there's a quota error.
const quotaErrorCallbacks = new Set();

export { quotaErrorCallbacks };
