# StockPikr

Back-end for the MSCS SE Project

# Starting the server

Simply run `npm run startserver` or `npm run start` to start on development mode

# Running tests

Simply run `npm test`

## Tips: How to setup mocha w typescript: https://github.com/mochajs/mocha-examples/issues/47#issuecomment-952339528

## Notes:

If you receive this similar error: `Error: Cannot find module '/Users/ducphamle/seattle-u/StockPikr/config' imported from /Users/ducphamle/seattle-u/StockPikr/test/fmp.spec.ts` => specify the full filename when importing. Eg: change from `import { config } from "../config";` to `import { config } from "../config.ts";`
