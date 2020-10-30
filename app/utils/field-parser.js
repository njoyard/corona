import peg from 'pegjs'

import {
  accumulate,
  change,
  coalesce,
  field,
  inverse,
  lag,
  offset,
  ratio,
  reverse,
  scale,
  weekly
} from 'corona/utils/fields'

const functions = {
  accumulate: { f: accumulate, args: 1 },
  change: { f: change, args: 1 },
  coalesce: { f: coalesce, args: 2 },
  inverse: { f: inverse, args: 1 },
  lag: { f: lag, args: 2 },
  ratio: { f: ratio, args: 2 },
  reverse: { f: reverse, args: 1 },
  scale: { f: scale, args: 2 },
  offset: { f: offset, args: 2 },
  weekly: { f: weekly, args: 1 }
}

function call(func, ...args) {
  if (!(func in functions)) {
    throw { type: 'unknown-function', func }
  }

  if (functions[func].args !== args.length) {
    throw {
      type: 'invalid-arg-count',
      func,
      expected: functions[func].args,
      actual: args.length
    }
  }

  return functions[func].f(...args)
}

const grammar = `
{ const { field, call, fields } = options }

Expression
  = head:Term tail:(("+" / "-") Term)* {
      return tail.reduce(function(result, [op, term]) {
        if (op === "+") { return call('offset', result, term) }
        if (op === "-") { return call('offset', result, call('reverse', term)) }
      }, head);
    }

Term
  = head:Factor tail:( ("*" / "/") Factor)* {
      return tail.reduce(function(result, [op, factor]) {
        if (op === "*") { return call('scale', result, factor) }
        if (op === "/") { return call('ratio', result, factor) }
      }, head);
    }

Factor
  = "(" expr:Expression ")" { return expr }
  / "-" expr:Expression { return call('reverse', expr) }
  / FunctionCall
  / FieldName
  / Number


FunctionCall
  = func:Identifier "(" head:Expression tail:("," Expression)* ")"
    {
      try {
        return call(func, ...tail.reduce((args, [, arg]) => [...args, arg], [head]))
      } catch(e) {
        error(e)
      }
    }

FieldName
  = ident:Identifier
    {
      if (fields && !fields.has(ident)) {
        error({ type: 'invalid-field', field: ident })
      } else {
        return field(ident)
      }
    }

Number
  = "-" num:Positive { return field(-num) }
  / "+"? num:Positive { return field(num) }

Positive
  = [0-9]+ "." [0-9]+ { return Number(text()) }
  / [0-9]+ "." { return Number(text()) }
  / "." [0-9]+ { return Number(text()) }
  / [0-9]+ { return Number(text()) }

Identifier
  = [a-z]+ { return text() }
`

const parser = peg.generate(grammar)

function parse(str, validFieldNames = null) {
  return parser.parse(str, { field, call, fields: validFieldNames })
}

export default parse
