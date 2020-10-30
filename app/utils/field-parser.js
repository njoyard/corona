import peg from 'pegjs'

import {
  accumulate,
  change,
  coalesce,
  field,
  inverse,
  lag,
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
  = FunctionCall
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
