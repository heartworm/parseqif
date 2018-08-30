module.exports = function (qif) {
    const EOL = /[\r\n]/;
    const NONEMPTY = str => str.trim();
    const NEWITEM = /\n\^\n?/;

    const normalised = qif.split(EOL).filter(NONEMPTY);
    const [firstLine, ...rest] = normalised;
    const blocks = rest.join('\n').split(NEWITEM).filter(NONEMPTY);

    if (firstLine.charAt(0) !== '!') {
        throw Error("First line isn't of format '!<TYPE>'");
    }

    const type = firstLine.slice(1);

    const parsers = {
        "Type:Bank": parseBank
    };

    const parser = parsers[type]

    if (typeof parser !== "function") {
        throw new Error("Unknown QIF type: " + type);
    }

    const items = blocks.map(
        block => block.split(EOL).map(
            line => ({
                type: line.charAt(0),
                body: line.slice(1)
            })
        )
    );

    return {
        type: type,
        items: items.map(parser)
    };
}

function parseBank(lines) {

    const find = type => {
        const found = lines.find(line => line.type === type);
        return found ? found.body : null;
    }

    const memo = find("M");
    const payee = find("P");
    const date = find("D");
    const amount = find("T");
    const number = find("N");
    const category = find("L");
    const cleared = find("C");
    const address = lines.filter(line => line.type === "A").map(line => line.body);

    const output = {
        memo,
        payee,
        date,
        amount: amount ? parseAmount(amount) : null,
        address: address.length > 0 ? address : null,
        number,
        category,
        cleared: ["*", "C", "R", "X"].includes(cleared) ? true :
            cleared == "" ? false : null,
        reconciled:
            ["R", "X"].includes(cleared) ? true :
                cleared !== null ? false : null,
    };

    const splits = [];
    const splitKeys = {
        "E": ["memo", a => a],
        "S": ["category", a => a],
        "$": ["amount", parseAmount],
    };
    const splitLines = lines.filter(l => ["E", "S", "$"].includes(l.type));

    for (const line of splitLines) {
        const [key, parser] = splitKeys[line.type];
        const value = parser(line.body);
        if (splits.length > 0 && !splits[splits.length - 1].hasOwnProperty(key)) {
            splits[splits.length - 1][key] = value;
        } else {
            splits.push({
                [key]: value
            });
        }
    }

    output.splits = (splits.length > 0) ? splits : null;

    for (const [key, val] of Object.entries(output)) {
        if (val === null) {
            delete output[key];
        }
    }

    return output;
}

function parseAmount(amt) {
    return parseFloat(amt.replace(/[^0-9.]/g, ''))
}