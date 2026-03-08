const Token = {
  SEMICOLON: "SEMICOLON",
  IDENTIFIER: "IDENTIFIER", // Ability, aura, or attribute name.
  STRING: "STRING",
  NUMBER: "NUMBER",
  VARIABLE: "VARIABLE",
  AND: "AND",
  OR: "OR",
  EQ: "EQ",
  NEQ: "NEQ",
  LTE: "LTE",
  GTE: "GTE",
  LT: "LT",
  GT: "GT",
  ASSIGN: "ASSIGN",
  SEMICOLON: "SEMICOLON",
  EOF: "EOF",
  Keyword:  {
    WAIT: "WAIT",
    USE: "USE",
    IF: "IF",
    PLAYER: "PLAYER",
    TARGET: "TARGET",
    TIME: "TIME",
  },
};


const Expr = {
  STATEMENT: 'Statement',
  USE: 'UseAction',
  WAIT: 'WaitAction',
  LOGICAL: 'LogicalExpression',
  COMPARISON: 'ComparisonExpression',
  LITERAL: 'Literal',
  STR_LITERAL: 'StringLiteral',
  GLOBAL: 'GlobalAttribute',
  IDENTIFIER: 'Identifier',
  IDENTIFIER_ATTR: 'IdentifierAttribute',
  ACTOR_ATTR: 'ActorAttribute',
};


class Tokenizer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
    this.tokenize();
  }

  tokenize() {
    while (this.pos < this.input.length) {
      this.skipWhiteSpaceAndComments();

      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      // Literals
      if (char === '"') {
        this.readString();
      }
      else if (char >= '0' && char <= '9') {
        this.readNumber();
      }
      // Operators etc
      else if (char === ';') {
        this.tokens.push({ type: Token.SEMICOLON, value: ';' });
        this.pos++;
      }
      else if (char === '.') {
        this.tokens.push({ type: Token.DOT, value: '.' });
        this.pos++;
      }
      else if (char === '&') {
        this.tokens.push({ type: Token.AND, value: '&' });
        this.pos++;
      }
      else if (char === '|') {
        this.tokens.push({ type: Token.OR, value: '|' });
        this.pos++;
      }
      // Comparison operators
      else if (char === '=' && this.peek() === '=') {
        this.tokens.push({ type: Token.EQ, value: '==' });
        this.pos += 2;
      }
      else if (char === '!' && this.peek() === '=') {
        this.tokens.push({ type: Token.NEQ, value: '!=' });
        this.pos += 2;
      }
      else if (char === '<' && this.peek() === '=') {
        this.tokens.push({ type: Token.LTE, value: '<=' });
        this.pos += 2;
      }
      else if (char === '>' && this.peek() === '=') {
        this.tokens.push({ type: Token.GTE, value: '>=' });
        this.pos += 2;
      }
      else if (char === '<') {
        this.tokens.push({ type: Token.LT, value: '<' });
        this.pos++;
      }
      else if (char === '>') {
        this.tokens.push({ type: Token.GT, value: '>' });
        this.pos++;
      }
      else if (char === '=') {
        this.tokens.push({ type: Token.ASSIGN, value: '=' });
        this.pos++;
      }
      // Identifiers and keywords
      else if (this.isIdentifierStart(char)) {
        this.readIdentifier();
      }
      else {
        throw new Error(`Unexpected character: ${char} at position ${this.pos}`);
      }
    }
    this.tokens.push({ type: Token.EOF, value: null });
  }

  skipWhiteSpaceAndComments() {
    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      // Whitespace
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        this.pos++;
        continue;
      }

      // Single-line comment
      if (char === '/' && this.peek() === '/') {
        while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
          this.pos++;
        }
        continue;
      }

      // Multi-line comment
      if (char === '/' && this.peek() === '*') {
        this.pos += 2;
        while (this.pos < this.input.length - 1) {
          if (this.input[this.pos] === '*' && this.input[this.pos + 1] === '/') {
            this.pos += 2;
            break;
          }
          this.pos++;
        }
        continue;
      }
      break;
    }
  }

  peek() {
    return this.pos < this.input.length + 1 ? this.input[this.pos + 1] : null;
  }

  readString() {
    this.pos++; // Skip opening quote.
    let value = '';
    while (this.pos < this.input.length && this.input[this.pos] !== '"') {
      value += this.input[this.pos];
      this.pos++;
    }

    if (this.pos >= this.input.length) {
      throw new Error('Unterminated string.');
    }

    this.pos++; // Skip closing quote.
    this.tokens.push({ type: Token.STRING, value });
  }

  readNumber() {
    let value = '';
    while (
      this.pos < this.input.length && (this.input[this.pos] >= '0'
      && this.input[this.pos] <= '9' || this.input[this.pos] === '.')) {
      value += this.input[this.pos];
      this.pos++;
    }
    this.tokens.push({ type: Token.NUMBER, value: parseFloat(value) });
  }

  isIdentifierStart(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  isIdentifierChar(char) {
    return this.isIdentifierStart(char) || (char >= '0' && char <= '9');
  }

  readIdentifier() {
    let value = '';
    while (this.pos < this.input.length && this.isIdentifierChar(this.input[this.pos])) {
      value += this.input[this.pos];
      this.pos++;
    }

    // Check for keywords.
    const keywords = Object.keys(Token.Keyword);
    const type = keywords.includes(value.toUpperCase()) ? value.toUpperCase() : Token.IDENTIFIER;

    this.tokens.push({ type, value });
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos];
  }

  peek() {
    return this.tokens[this.pos + 1];
  }

  consume(type) {
    const token = this.current();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    this.pos++;
    return token;
  }

  match(...types) {
    return types.includes(this.current().type);
  }

  parse() {
    const statements = [];
    while (this.current().type !== Token.EOF) {
      statements.push(this.parseStatement());
    }
    return statements;
  }

  parseStatement() {
    const action = this.parseAction();

    let condition = null;
    if (this.match(Token.Keyword.IF)) {
      this.consume(Token.Keyword.IF);
      condition = this.parsePredicate();
    }

    this.consume(Token.SEMICOLON);

    return {
      type: Expr.STATEMENT,
      action,
      condition
    };
  }

  parseAction() {
    if (this.match(Token.Keyword.USE)) {
      this.consume(Token.Keyword.USE);
      const ability = this.consume(Token.IDENTIFIER).value;
      return {
        type: Expr.USE,
        ability
      };
    } else if (this.match(Token.Keyword.WAIT)) {
      this.consume(Token.Keyword.WAIT);
      return {
        type: Expr.WAIT,
      };
    } else {
      throw new Error(`Expected 'use' or 'wait' but got ${this.current().type}`);
    }
  }

  parsePredicate() {
    let left = this.parseComparison();

    while (this.match(Token.AND, Token.OR)) {
      const operator = this.current().type;
      this.pos++;
      const right = this.parseComparison();
      left = {
        type: Expr.LOGICAL,
        operator: operator === Token.AND ? '&&' : '||',
        left,
        right
      };
    }

    return left;
  }

  parseComparison() {
    const left = this.parseVariable();

    if (!this.match(Token.EQ, Token.NEQ, Token.LT, Token.GT, Token.LTE, Token.GTE)) {
      throw new Error(`Expected comparison operator but got ${this.current().type}`);
    }

    const operator = this.current().value;
    this.pos++;

    const right = this.parseVariable();

    return {
      type: Expr.COMPARISON,
      operator,
      left,
      right
    };
  }

  parseVariable() {
    // Literals
    if (this.match(Token.NUMBER)) {
      return {
        type: Expr.LITERAL,
        value: this.consume(Token.NUMBER).value
      };
    }
    if (this.match(Token.STRING)) {
      return {
        type: Expr.STR_LITERAL,
        value: this.consume(Token.STRING).value
      };
    }

    // Globals
    if (this.match(Token.Keyword.TIME)) {
      this.consume(Token.Keyword.TIME);
      return {
        type: Expr.GLOBAL,
        attribute: 'time'
      };
    }

    // Actor attributes
    if (this.match(Token.Keyword.PLAYER, Token.Keyword.TARGET)) {
      const actor = this.consume(this.current().type).value;
      this.consume(Token.DOT);
      const attribute = this.parseAttributePath();
      return {
        type: Expr.ACTOR_ATTR,
        actor,
        attribute
      };
    }

    // Aura/Ability attributes
    if (this.match(Token.IDENTIFIER)) {
      const name = this.consume(Token.IDENTIFIER).value;
      if (this.match(Token.Keyword.DOT)) {
        this.consume(Token.Keyword.DOT);
        const attribute = this.consume(Token.IDENTIFIER).value;
        return {
          type: Expr.IDENTIFIER_ATTR,
          name,
          attribute
        };
      }
      return {
        type: Expr.IDENTIFIER,
        value: name
      };
    }

    throw new Error(`Unexpected token in variable: ${this.current().type}`);
  }

  // TODO: Expand this to include eg player.ability.bloodthirst.cooldown.
  parseAttributePath() {
    const identifier = this.consume(Token.IDENTIFIER).value;
    return identifier;
  }
}

class Compiler {
  compile(ast) {
    return ast.map(statement => this.compileStatement(statement));
  }

  compileStatement(statement) {
    const actionFn = this.compileAction(statement.action);
    const conditionFn = statement.condition
      ? this.compilePredicate(statement.condition)
      : () => true;

    return {
      action: statement.action,
      actionFn,
      conditionFn
    };
  }

  // TODO: Expand return object with type (onUse/ability etc) and name.
  compileAction(action) {
    if (action.type === Expr.USE) {
      return (state) => ({
        type: 'use',
        ability: action.ability
      });
    } else if (action.type === Expr.WAIT) {
      return (state) => ({
        type: 'wait',
      });
    }
  }

  compilePredicate(predicate) {
    if (predicate.type === Expr.COMPARISON) {
      const leftFn = this.compileVariable(predicate.left);
      const rightFn = this.compileVariable(predicate.right);
      const op = predicate.operator;

      return (state) => {
        const left = leftFn(state);
        const right = rightFn(state);

        switch (op) {
          case '==': return left == right;
          case '!=': return left != right;
          case '<': return left < right;
          case '>': return left > right;
          case '<=': return left <= right;
          case '>=': return left >= right;
          default: throw new Error(`Unknown operator: ${op}`);
        }
      };
    } else if (predicate.type === Expr.LOGICAL) {
      const leftFn = this.compilePredicate(predicate.left);
      const rightFn = this.compilePredicate(predicate.right);

      if (predicate.operator === '&&') {
        return (state) => leftFn(state) && rightFn(state);
      } else {
        return (state) => leftFn(state) || rightFn(state);
      }
    }
  }

  compileVariable(variable) {
    if (variable.type === Expr.LITERAL) {
      const value = variable.value;
      return () => value;
    }

    if (variable.type === Expr.STR_LITERAL) {
      const value = variable.value;
      return () => value;
    }

    if (variable.type === Expr.GLOBAL) {
      if (variable.attribute === Token.Keyword.TIME) {
        return (state) => state.time;
      }
    }

    if (variable.type === Expr.ACTOR_ATTR) {
      const attribute = variable.attribute;

      // const Actor = actorStr === 'PLAYER' ? state.Tank : state.Boss;

      const actorStr = variable.actor === Token.Keyword.PLAYER ? 'Tank' : 'Boss';
      return (state) => {

        // TODO: Create an enum for attributes.
        if (attribute === 'attackpower' || attribute === 'crit' ||
            attribute === 'swingtimer' || attribute === 'oh_swingtimer') {
          return state[actorStr].getAttribute(attribute);
        }

        // TODO: Handle chained attributes.
        return state[actorStr].getAttribute(attribute);
      };
    }

    // Prioritises player over target, ability over aura.
    if (variable.type === Expr.IDENTIFIER_ATTR) {
      const name = variable.name;
      const attribute = variable.attribute;

      return (state) => {
        const ability = state.Tank.abilities[name];
        if (ability) {
          return ability.getAttribute(state, attribute);
        }

        const aura = state.Tank.auras.find(a => a.name === name);
        if (aura) {
          return aura.getAttribute(state, attribute);
        }

        const targetAbility = state.Boss.abilities[name];
        if (targetAbility) {
          return targetAbility.getAttribute(state, name);
        }

        const targetAura = state.Boss.auras.find(a => a.name === name);
        if (targetAura) {
          return targetAura.getAttribute(state, attribute);
        }

        return undefined;
      };
    }

    throw new Error(`Unknown variable type: ${variable.type}`);
  }
}

export class APL {
  constructor(scriptString) {
    const tokenizer = new Tokenizer(scriptString);
    const parser = new Parser(tokenizer.tokens);
    const ast = parser.parse();
    const compiler = new Compiler();
    this.rules = compiler.compile(ast);
  }

  // TODO: Split APL in onGCD and offGCD for performance reasons.
  evaluate(State, actor) {
    for (const rule of this.rules) {
      try {
        if (rule.conditionFn(State)) {
          let action = rule.actionFn(State);
          if (action.type === 'use') {
            if (actor.actionUsable(State, action.ability))
              return action;
          } else if (action.type === 'wait') {
              return action;
          }
        }
      } catch (error) {
        console.error('Error evaluating rule:', rule, error);
        // Continue to next rule on error.
      }
    }
    return null;
  }
}
