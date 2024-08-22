// using `js` instead of `json` because of https://github.com/trivago/prettier-plugin-sort-imports/issues/244
module.exports = { 
    "importOrder": ["^components/(.*)$", "^[./]" ],
    "importOrderSeparation": true,
    "importOrderSortSpecifiers": true,
    "plugins": [require.resolve("@trivago/prettier-plugin-sort-imports")],
}