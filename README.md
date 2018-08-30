# parseqif
Parse Quicken Interchange Format (QIF) files commonly found as an export
option for transaction data in banking and accounting software.

# Usage
```js
const { parseQIF } = require('parseqif');
```
## Sample
Sample data from http://linuxfinances.info/info/financeformats.html
```js
const qif = `\
!Type:Bank
D6/12/95
T-1,000.00
N*****
PFranks Plumbing
AFranks Plumbing
A2567 Fresno Street
ASanta Barbara, CA 90111 Address
LHome Maint
^
D6/15/95
T-75.46
CX
N256
PWalts Drugs
LSupplies
SSupplies
EOffice supplies
$-36.00
SGarden
$-39.46
^`;

const output = parseQIF(qif);
output === {
  "type": "Type:Bank",
  "items": [
    {
      "payee": "Franks Plumbing",
      "date": "6/12/95",
      "amount": 1000,
      "address": [
        "Franks Plumbing",
        "2567 Fresno Street",
        "Santa Barbara, CA 90111 Address"
      ],
      "number": "*****",
      "category": "Home Maint"
    },
    {
      "payee": "Walts Drugs",
      "date": "6/15/95",
      "amount": 75.46,
      "number": "256",
      "category": "Supplies",
      "cleared": true,
      "reconciled": true,
      "splits": [
        {
          "category": "Supplies",
          "memo": "Office supplies",
          "amount": 36
        },
        {
          "category": "Garden",
          "amount": 39.46
        }
      ]
    }
  ]
}; // true
```

# Note
The output format has a lot of room for improvement, feel free to contribute.
Only `Type:Bank` files are supported right now.