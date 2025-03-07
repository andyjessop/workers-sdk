# miniflare

## 3.20240304.0

### Minor Changes

- [#5148](https://github.com/cloudflare/workers-sdk/pull/5148) [`11951f3`](https://github.com/cloudflare/workers-sdk/commit/11951f344ccac340be5d059bc4dd28ef674fb36f) Thanks [@dom96](https://github.com/dom96)! - chore: bump `workerd` to [`1.20240304.0`](https://github.com/cloudflare/workerd/releases/tag/v1.20240304.0)

- [#5148](https://github.com/cloudflare/workers-sdk/pull/5148) [`11951f3`](https://github.com/cloudflare/workers-sdk/commit/11951f344ccac340be5d059bc4dd28ef674fb36f) Thanks [@dom96](https://github.com/dom96)! - fix: use python_workers compat flag for Python

## 3.20240223.1

### Patch Changes

- [#5133](https://github.com/cloudflare/workers-sdk/pull/5133) [`42bcc72`](https://github.com/cloudflare/workers-sdk/commit/42bcc7216ab14455c1398d55bc552023726eb423) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure internals can access `workerd` when starting on non-local `host`

  Previously, if Miniflare was configured to start on a `host` that wasn't `127.0.0.1`, `::1`, `*`, `::`, or `0.0.0.0`, calls to `Miniflare` API methods relying on the magic proxy (e.g. `getKVNamespace()`, `getWorker()`, etc.) would fail. This change ensures `workerd` is always accessible to Miniflare's internals. This also fixes `wrangler dev` when using local network address such as `192.168.0.10` with the `--ip` flag.

- [#5133](https://github.com/cloudflare/workers-sdk/pull/5133) [`42bcc72`](https://github.com/cloudflare/workers-sdk/commit/42bcc7216ab14455c1398d55bc552023726eb423) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure IPv6 addresses can be used as `host`s

  Previously, if Miniflare was configured to start on an IPv6 `host`, it could crash. This change ensures IPv6 addresses are handled correctly. This also fixes `wrangler dev` when using IPv6 addresses such as `::1` with the `--ip` flag.

## 3.20240223.0

### Minor Changes

- [#5081](https://github.com/cloudflare/workers-sdk/pull/5081) [`0c0949d`](https://github.com/cloudflare/workers-sdk/commit/0c0949da60e3287c05a5884bb9f869ce5609a9a1) Thanks [@garrettgu10](https://github.com/garrettgu10)! - chore: bump `workerd` to [`1.20240223.1`](https://github.com/cloudflare/workerd/releases/tag/v1.20240223.0)

## 3.20240208.0

### Minor Changes

- [#5068](https://github.com/cloudflare/workers-sdk/pull/5068) [`b03db864`](https://github.com/cloudflare/workers-sdk/commit/b03db864a36924c31b8ddd82a027c83df4f68c43) Thanks [@mrbbot](https://github.com/mrbbot)! - chore: bump `workerd` to [`1.20240208.0`](https://github.com/cloudflare/workerd/releases/tag/v1.20240208.0)

## 3.20240129.3

### Minor Changes

- [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: pass `Miniflare` instance as argument to custom service binding handlers

  This change adds a new `Miniflare`-typed parameter to function-valued service binding handlers. This provides easy access to the correct bindings when re-using service functions across instances.

  <!--prettier-ignore-start-->

  ```js
  import assert from "node:assert";
  import { Miniflare, Response } from "miniflare";

  const mf = new Miniflare({
  	serviceBindings: {
  		SERVICE(request, instance) {
  			assert(instance === mf);
  			return new Response();
  		},
  	},
  });
  ```

  <!--prettier-ignore-end-->

* [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: allow `URL`s to be passed in `hyperdrives`

  Previously, the `hyperdrives` option only accepted `string`s as connection strings. This change allows `URL` objects to be passed too.

- [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: add support for custom root paths

  Miniflare has lots of file-path-valued options (e.g. `scriptPath`, `kvPersist`, `textBlobBindings`). Previously, these were always resolved relative to the current working directory before being used. This change adds a new `rootPath` shared, and per-worker option for customising this behaviour. Instead of resolving relative to the current working directory, Miniflare will now resolve path-valued options relative to the closest `rootPath` option. Paths are still resolved relative to the current working directory if no `rootPath`s are defined. Worker-level `rootPath`s are themselves resolved relative to the shared `rootPath` if defined.

  <!--prettier-ignore-start-->

  ```js
  import { Miniflare } from "miniflare";

  const mf1 = new Miniflare({
  	scriptPath: "index.mjs",
  });

  const mf2 = new Miniflare({
  	rootPath: "a/b",
  	scriptPath: "c/index.mjs",
  });

  const mf3 = new Miniflare({
  	rootPath: "/a/b",
  	workers: [
  		{
  			name: "1",
  			rootPath: "c",
  			scriptPath: "index.mjs",
  		},
  		{
  			name: "2",
  			scriptPath: "index.mjs",
  		},
  	],
  });
  ```

  <!--prettier-ignore-end-->

* [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: allow easy binding to current worker

  Previously, if you wanted to create a service binding to the current Worker, you'd need to know the Worker's name. This is usually possible, but can get tricky when dealing with many Workers. This change adds a new `kCurrentWorker` symbol that can be used instead of a Worker name in `serviceBindings`. `kCurrentWorker` always points to the Worker with the binding.

  <!--prettier-ignore-start-->

  ```js
  import { kCurrentWorker, Miniflare } from "miniflare";

  const mf = new Miniflare({
  	serviceBindings: {
  		SELF: kCurrentWorker,
  	},
  	modules: true,
  	script: `export default {
      fetch(request, env, ctx) {
        const { pathname } = new URL(request.url);
        if (pathname === "/recurse") {
          return env.SELF.fetch("http://placeholder");
        }
        return new Response("body");
      }
    }`,
  });

  const response = await mf.dispatchFetch("http://placeholder/recurse");
  console.log(await response.text()); // body
  ```

  <!--prettier-ignore-end-->

### Patch Changes

- [#4954](https://github.com/cloudflare/workers-sdk/pull/4954) [`7723ac17`](https://github.com/cloudflare/workers-sdk/commit/7723ac17906f894afe9af2152437726ac09a6290) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: allow relative `scriptPath`/`modulesRoot`s to break out of current working directory

  Previously, Miniflare would resolve relative `scriptPath`s against `moduleRoot` multiple times resulting in incorrect paths and module names. This would lead to `can't use ".." to break out of starting directory` `workerd` errors. This change ensures Miniflare uses `scriptPath` as is, and only resolves it relative to `modulesRoot` when computing module names. Note this bug didn't affect service workers. This allows you to reference a modules `scriptPath` outside the working directory with something like:

  ```js
  const mf = new Miniflare({
  	modules: true,
  	modulesRoot: "..",
  	scriptPath: "../worker.mjs",
  });
  ```

  Fixes #4721

* [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: return non-WebSocket responses for failed WebSocket upgrading `fetch()`es

  Previously, Miniflare's `fetch()` would throw an error if the `Upgrade: websocket` header was set, and a non-WebSocket response was returned from the origin. This change ensures the non-WebSocket response is returned from `fetch()` instead, with `webSocket` set to `null`. This allows the caller to handle the response as they see fit.

- [#4795](https://github.com/cloudflare/workers-sdk/pull/4795) [`027f9719`](https://github.com/cloudflare/workers-sdk/commit/027f971975a48a564603275f3583d21e9d053229) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure `MiniflareOptions`, `WorkerOptions`, and `SharedOptions` types are correct

  Miniflare uses Zod for validating options. Previously, Miniflare inferred `*Options` from the _output_ types of its Zod schemas, rather than the _input_ types. In most cases, these were the same. However, the `hyperdrives` option has different input/output types, preventing these from being type checked correctly.

## 3.20240129.2

### Patch Changes

- [#4950](https://github.com/cloudflare/workers-sdk/pull/4950) [`05360e43`](https://github.com/cloudflare/workers-sdk/commit/05360e432bff922def960e86690232c762fad284) Thanks [@petebacondarwin](https://github.com/petebacondarwin)! - fix: ensure we do not rewrite external Origin headers in wrangler dev

  In https://github.com/cloudflare/workers-sdk/pull/4812 we tried to fix the Origin headers to match the Host header but were overzealous and rewrote Origin headers for external origins (outside of the proxy server's origin).

  This is now fixed, and moreover we rewrite any headers that refer to the proxy server on the request with the configured host and vice versa on the response.

  This should ensure that CORS is not broken in browsers when a different host is being simulated based on routes in the Wrangler configuration.

## 3.20240129.1

### Minor Changes

- [#4905](https://github.com/cloudflare/workers-sdk/pull/4905) [`148feff6`](https://github.com/cloudflare/workers-sdk/commit/148feff60c9bf3886c0e0fd1ea98049955c27659) Thanks [@dario-piotrowicz](https://github.com/dario-piotrowicz)! - feature: add a `getCf` method to Miniflare instances

  add a new `getCf` method attached to instances of `Miniflare`, this `getCf` returns
  the `cf` object that the Miniflare instance provides to the actual workers and it
  depends of the core option of the same name

  Example:

  ```ts
  import { Miniflare } from "miniflare";

  const mf = new Miniflare({ ... });

  const cf = await mf.getCf();

  console.log(`country = ${cf.country} ; colo = ${cf.colo}`); // logs 'country = GB ; colo = LHR'
  ```

## 3.20240129.0

### Minor Changes

- [#4873](https://github.com/cloudflare/workers-sdk/pull/4873) [`1e424ff2`](https://github.com/cloudflare/workers-sdk/commit/1e424ff280610657e997df8290d0b39b0393c845) Thanks [@dom96](https://github.com/dom96)! - feature: implemented basic Python support

  Here is an example showing how to construct a MiniFlare instance with a Python module:

  ```js
  const mf = new Miniflare({
  	modules: [
  		{
  			type: "PythonModule",
  			path: "index",
  			contents:
  				"from js import Response;\ndef fetch(request):\n  return Response.new('hello')",
  		},
  	],
  	compatibilityFlags: ["experimental"],
  });
  ```

### Patch Changes

- [#4874](https://github.com/cloudflare/workers-sdk/pull/4874) [`749fa3c0`](https://github.com/cloudflare/workers-sdk/commit/749fa3c05e6b9fcaa59a72f60f7936b7beaed5ad) Thanks [@mrbbot](https://github.com/mrbbot)! - chore: bump `workerd` to [`1.20240129.0`](https://github.com/cloudflare/workerd/releases/tag/v1.20240129.0)

## 3.20231218.4

### Patch Changes

- [#4812](https://github.com/cloudflare/workers-sdk/pull/4812) [`8166eefc`](https://github.com/cloudflare/workers-sdk/commit/8166eefc11ff3b5ce6ede41fe9d6224d945a2cde) Thanks [@petebacondarwin](https://github.com/petebacondarwin)! - fix: ensure that Origin header is rewritten as necessary

  The `wrangler dev` command puts the Worker under test behind a proxy server.
  This proxy server should be transparent to the client and the Worker, which
  means that the `Request` arriving at the Worker with the correct `url` property,
  and `Host` and `Origin` headers.
  Previously we fixed the `Host` header but missed the `Origin` header which is
  only added to a request under certain circumstances, such as cross-origin requests.

  This change fixes the `Origin` header as well, so that it is rewritten, when it exists,
  to use the `origin` of the `url` property.

  Fixes #4761

## 3.20231218.3

### Patch Changes

- [#4768](https://github.com/cloudflare/workers-sdk/pull/4768) [`c3e410c2`](https://github.com/cloudflare/workers-sdk/commit/c3e410c2797f5c59b9ea0f63c20feef643366df2) Thanks [@petebacondarwin](https://github.com/petebacondarwin)! - ci: bump undici versions to 5.28.2

## 3.20231218.2

### Minor Changes

- [#4686](https://github.com/cloudflare/workers-sdk/pull/4686) [`4f6999ea`](https://github.com/cloudflare/workers-sdk/commit/4f6999eacd591d0d65180f805f2abc3c8a2c06c4) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: expose `rows_read` and `rows_written` in D1 result `meta`

  `rows_read`/`rows_written` contain the number of rows read from/written to the database engine when executing a query respectively. These numbers may be greater than the number of rows returned from/inserted by a query. These numbers form billing metrics when your Worker is deployed. See https://developers.cloudflare.com/d1/platform/pricing/#billing-metrics for more details.

### Patch Changes

- [#4719](https://github.com/cloudflare/workers-sdk/pull/4719) [`c37d94b5`](https://github.com/cloudflare/workers-sdk/commit/c37d94b51f4d5517c244f8a4178be6a266d2362e) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure `miniflare` and `wrangler` can source map in the same process

  Previously, if in a `wrangler dev` session you called `console.log()` and threw an unhandled error you'd see an error like `[ERR_ASSERTION]: The expression evaluated to a falsy value`. This change ensures you can do both of these things in the same session.

## 3.20231218.1

### Patch Changes

- [#4630](https://github.com/cloudflare/workers-sdk/pull/4630) [`037de5ec`](https://github.com/cloudflare/workers-sdk/commit/037de5ec77efc8261860c6d625bc90cd1f2fdd41) Thanks [@petebacondarwin](https://github.com/petebacondarwin)! - fix: ensure User Worker gets the correct Host header in wrangler dev local mode

  Some full-stack frameworks, such as Next.js, check that the Host header for a server
  side action request matches the host where the application is expected to run.

  In `wrangler dev` we have a Proxy Worker in between the browser and the actual User Worker.
  This Proxy Worker is forwarding on the request from the browser, but then the actual User
  Worker is running on a different host:port combination than that which the browser thinks
  it should be on. This was causing the framework to think the request is malicious and blocking
  it.

  Now we update the request's Host header to that passed from the Proxy Worker in a custom `MF-Original-Url`
  header, but only do this if the request also contains a shared secret between the Proxy Worker
  and User Worker, which is passed via the `MF-Proxy-Shared-Secret` header. This last feature is to
  prevent a malicious website from faking the Host header in a request directly to the User Worker.

  Fixes https://github.com/cloudflare/next-on-pages/issues/588

## 3.20231218.0

### Minor Changes

- [#4684](https://github.com/cloudflare/workers-sdk/pull/4684) [`c410ea14`](https://github.com/cloudflare/workers-sdk/commit/c410ea141f02f808ff3dddfa9ee21ccbb530acec) Thanks [@mrbbot](https://github.com/mrbbot)! - chore: bump `workerd` to [`1.20231218.0`](https://github.com/cloudflare/workerd/releases/tag/v1.20231218.0)

## 3.20231030.4

### Patch Changes

- [#4448](https://github.com/cloudflare/workers-sdk/pull/4448) [`eb08e2dc`](https://github.com/cloudflare/workers-sdk/commit/eb08e2dc3c0f09d16883f85201fbeb892e6f5a5b) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: include request url and headers in pretty error page

  This change ensures Miniflare's pretty error page includes the URL and headers of the incoming request, rather than Miniflare's internal request for the page.

## 3.20231030.3

### Patch Changes

- [#4466](https://github.com/cloudflare/workers-sdk/pull/4466) [`71fb0b86`](https://github.com/cloudflare/workers-sdk/commit/71fb0b86cf0ed81cc29ad71792edbba3a79ba87c) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure unused KV and Cache blobs cleaned up

  When storing data in KV, Cache and R2, Miniflare uses both an SQL database and separate blob store. When writing a key/value pair, a blob is created for the new value and the old blob for the previous value (if any) is deleted. A few months ago, we introduced a change that prevented old blobs being deleted for KV and Cache. R2 was unaffected. This shouldn't have caused any problems, but could lead to persistence directories growing unnecessarily as they filled up with garbage blobs. This change ensures garbage blobs are deleted.

  Note existing garbage will not be cleaned up. If you'd like to do this, download this Node script (https://gist.github.com/mrbbot/68787e19dcde511bd99aa94997b39076). If you're using the default Wrangler persistence directory, run `node gc.mjs kv .wrangler/state/v3/kv <namespace_id_1> <namespace_id_2> ...` and `node gc.mjs cache .wrangler/state/v3/cache default named:<cache_name_1> named:<cache_name_2> ...` with each of your KV namespace IDs (not binding names) and named caches.

* [#4550](https://github.com/cloudflare/workers-sdk/pull/4550) [`63708a94`](https://github.com/cloudflare/workers-sdk/commit/63708a94fb7a055bf15fa963f2d598b47b11d3c0) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: validate `Host` and `Orgin` headers where appropriate

  `Host` and `Origin` headers are now checked when connecting to the inspector and Miniflare's magic proxy. If these don't match what's expected, the request will fail.

## 3.20231030.2

### Patch Changes

- [#4505](https://github.com/cloudflare/workers-sdk/pull/4505) [`1b348782`](https://github.com/cloudflare/workers-sdk/commit/1b34878287e3c98e8743e0a9c30b860107d4fcbe) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: remove `__STATIC_CONTENT_MANIFEST` from module worker `env`

  When using Workers Sites with a module worker, the asset manifest must be imported from the `__STATIC_CONTENT_MANIFEST` virtual module. Miniflare provided this module, but also erroneously added `__STATIC_CONTENT_MANIFEST` to the `env` object too. Whilst this didn't break anything locally, it could cause users to develop Workers that ran locally, but not when deployed. This change ensures `env` doesn't contain `__STATIC_CONTENT_MANIFEST`.

## 3.20231030.1

### Minor Changes

- [#4348](https://github.com/cloudflare/workers-sdk/pull/4348) [`be2b9cf5`](https://github.com/cloudflare/workers-sdk/commit/be2b9cf5a9395cf7385f59d2e1ec3131dae3d87f) Thanks [@mrbbot](https://github.com/mrbbot)! - feat: add support for wrapped bindings

  This change adds a new `wrappedBindings` worker option for configuring
  `workerd`'s [wrapped bindings](https://github.com/cloudflare/workerd/blob/bfcef2d850514c569c039cb84c43bc046af4ffb9/src/workerd/server/workerd.capnp#L469-L487).
  These allow custom bindings to be written as JavaScript functions accepting an
  `env` parameter of "inner bindings" and returning the value to bind. For more
  details, refer to the [API docs](https://github.com/cloudflare/workers-sdk/blob/main/packages/miniflare/README.md#core).

* [#4341](https://github.com/cloudflare/workers-sdk/pull/4341) [`d9908743`](https://github.com/cloudflare/workers-sdk/commit/d99087433814e4f1fb98cd61b03b6e2f606b1a15) Thanks [@RamIdeas](https://github.com/RamIdeas)! - Added a `handleRuntimeStdio` which enables wrangler (or any other direct use of Miniflare) to handle the `stdout` and `stderr` streams from the workerd child process. By default, if this option is not provided, the previous behaviour is retained which splits the streams into lines and calls `console.log`/`console.error`.

## 3.20231030.0

### Minor Changes

- [#4324](https://github.com/cloudflare/workers-sdk/pull/4324) [`16cc2e92`](https://github.com/cloudflare/workers-sdk/commit/16cc2e923733b3c583b5bf6c40384c52fea04991) Thanks [@penalosa](https://github.com/penalosa)! - Update to [latest `workerd@1.20231030.0`](https://github.com/cloudflare/workerd/releases/tag/v1.20231030.0)

* [#4322](https://github.com/cloudflare/workers-sdk/pull/4322) [`8a25b7fb`](https://github.com/cloudflare/workers-sdk/commit/8a25b7fba94c8e9989412bc266ada307975f182d) Thanks [@dario-piotrowicz](https://github.com/dario-piotrowicz)! - add `unsafeEvalBinding` option

  Add option to leverage the newly introduced [`UnsafeEval`](https://github.com/cloudflare/workerd/pull/1338) workerd binding API,
  such API is used to evaluate javascript code at runtime via the provided `eval` and `newFunction` methods.

  The API, for security reasons (as per the [workers docs](https://developers.cloudflare.com/workers/runtime-apis/web-standards/#javascript-standards)), is not to be use in production but it is intended for local purposes only such as local testing.

  To use the binding you need to specify a string value for the `unsafeEvalBinding`, such will be the name of the `UnsafeEval` bindings that will be made available in the workerd runtime.

  For example the following code shows how to set the binding with the `UNSAFE_EVAL` name and evaluate the `1+1` string:

  ```ts
  const mf = new Miniflare({
  	log,
  	modules: true,
  	script: `
        export default {
            fetch(req, env, ctx) {
                const two = env.UNSAFE_EVAL.eval('1+1');
                return new Response('two = ' + two); // returns 'two = 2'
            }
        }
    `,
  	unsafeEvalBinding: "UNSAFE_EVAL",
  });
  ```

### Patch Changes

- [#4397](https://github.com/cloudflare/workers-sdk/pull/4397) [`4f8b3420`](https://github.com/cloudflare/workers-sdk/commit/4f8b3420f93197d331491f012ff6f4626411bfc5) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: reject `Miniflare#ready` promise if `Miniflare#dispose()` called while waiting

* [#4428](https://github.com/cloudflare/workers-sdk/pull/4428) [`3637d97a`](https://github.com/cloudflare/workers-sdk/commit/3637d97a99c9d5e8d0d2b5f3adaf4bd9993265f0) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: add `miniflare` `bin` entry

  Miniflare 3 doesn't include a CLI anymore, but should log a useful error stating this when running `npx miniflare`. We had a script for this, but it wasn't correctly hooked up. :facepalm: This change makes sure the required `bin` entry exists.

- [#4321](https://github.com/cloudflare/workers-sdk/pull/4321) [`29a59d4e`](https://github.com/cloudflare/workers-sdk/commit/29a59d4e72e3ae849474325c5c93252a3f84af0d) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: ensure `Mutex` doesn't report itself as drained if locked

  Previously, Miniflare's `Mutex` implementation would report itself as drained
  if there were no waiters, regardless of the locked state. This bug meant that
  if you called but didn't `await` `Miniflare#setOptions()`, future calls to
  `Miniflare#dispatchFetch()` (or any other asynchronous `Miniflare` method)
  wouldn't wait for the options update to apply and the runtime to restart before
  sending requests. This change ensures we wait until the mutex is unlocked before
  reporting it as drained.

* [#4307](https://github.com/cloudflare/workers-sdk/pull/4307) [`7fbe1937`](https://github.com/cloudflare/workers-sdk/commit/7fbe1937b311f36077c92814207bbb15ef3878d6) Thanks [@jspspike](https://github.com/jspspike)! - Only output ipv4 addresses when starting

- [#4400](https://github.com/cloudflare/workers-sdk/pull/4400) [`76787861`](https://github.com/cloudflare/workers-sdk/commit/767878613eda535d125539a478d488d1a42feaa1) Thanks [@mrbbot](https://github.com/mrbbot)! - fix: cleanup temporary directory after shutting down `workerd`

  Previously on exit, Miniflare would attempt to remove its temporary directory
  before shutting down `workerd`. This could lead to `EBUSY` errors on Windows.
  This change ensures we shutdown `workerd` before removing the directory.
  Since we can only clean up on a best effort basis when exiting, it also catches
  any errors thrown when removing the directory, in case the runtime doesn't
  shutdown fast enough.

## Previous Releases

For previous Miniflare 3 releases, refer to this GitHub releases page: https://github.com/cloudflare/miniflare/releases.

For previous Miniflare 1 and 2 releases, refer to this `CHANGELOG`: https://github.com/cloudflare/miniflare/blob/master/docs/CHANGELOG.md
