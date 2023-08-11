NODE_ENV=test npm run drop:database:schema
NODE_ENV=test ./node_modules/.bin/ts-node ./src/db/scripts/removeAssets.ts
NODE_ENV=test npm run migration:up
npx jest
