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
        this.tokens.push({ type: 'SEMICOLON', value: ';' });
        this.pos++;
      }
      else if (char === '.') {
        this.tokens.push({ type: 'DOT', value: '.' });
        this.pos++;
      }
      else if (char === '&') {
        this.tokens.push({ type: 'AND', value: '&' });
        this.pos++;
      }
      else if (char === '|') {
        this.tokens.push({ type: 'OR', value: '|' });
        this.pos++;
      }
      // Comparison operators
      else if (char === '=' && this.peek() === '=') {
        this.tokens.push({ type: 'EQ', value: '==' });
        this.pos += 2;
      }
      else if (char === '!' && this.peek() === '=') {
        this.tokens.push({ type: 'NEQ', value: '!=' });
        this.pos += 2;
      }
      else if (char === '<' && this.peek() === '=') {
        this.tokens.push({ type: 'LTE', value: '<=' });
        this.pos += 2;
      }
      else if (char === '>' && this.peek() === '=') {
        this.tokens.push({ type: 'GTE', value: '>=' });
        this.pos += 2;
      }
      else if (char === '<') {
        this.tokens.push({ type: 'LT', value: '<' });
        this.pos++;
      }
      else if (char === '>') {
        this.tokens.push({ type: 'GT', value: '>' });
        this.pos++;
      }
      else if (char === '=') {
        this.tokens.push({ type: 'ASSIGN', value: '=' });
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
    this.tokens.push({ type: 'EOF', value: null });
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
    this.tokens.push({ type: 'STRING', value });
  }

  readNumber() {
    let value = '';
    while (
      this.pos < this.input.length && (this.input[this.pos] >= '0'
      && this.input[this.pos] <= '9' || this.input[this.pos] === '.')) {
      value += this.input[this.pos];
      this.pos++;
    }
    this.tokens.push({ type: 'NUMBER', value: parseFloat(value) });
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
    const keywords = ['use', 'wait', 'if', 'player', 'target', 'time'];
    const type = keywords.includes(value) ? value.toUpperCase() : 'IDENTIFIER';

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
    while (this.current().type !== 'EOF') {
      statements.push(this.parseStatement());
    }
    return statements;
  }

  parseStatement() {
    const action = this.parseAction();

    let condition = null;
    if (this.match('IF')) {
      this.consume('IF');
      condition = this.parsePredicate();
    }

    this.consume('SEMICOLON');

    return {
      type: 'Statement',
      action,
      condition
    };
  }

  parseAction() {
    if (this.match('USE')) {
      this.consume('USE');
      const ability = this.consume('STRING').value;
      return {
        type: 'UseAction',
        ability
      };
    } else if (this.match('WAIT')) {
      this.consume('WAIT');
      const duration = this.parseVariable();
      return {
        type: 'WaitAction',
        duration
      };
    } else {
      throw new Error(`Expected 'use' or 'wait' but got ${this.current().type}`);
    }
  }

  parsePredicate() {
    let left = this.parseComparison();

    while (this.match('AND', 'OR')) {
      const operator = this.current().type;
      this.pos++;
      const right = this.parseComparison();
      left = {
        type: 'LogicalExpression',
        operator: operator === 'AND' ? '&&' : '||',
        left,
        right
      };
    }

    return left;
  }

  parseComparison() {
    const left = this.parseVariable();

    if (!this.match('EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE')) {
      throw new Error(`Expected comparison operator but got ${this.current().type}`);
    }

    const operator = this.current().value;
    this.pos++;

    const right = this.parseVariable();

    return {
      type: 'ComparisonExpression',
      operator,
      left,
      right
    };
  }

  parseVariable() {
    // Literals
    if (this.match('NUMBER')) {
      return {
        type: 'Literal',
        value: this.consume('NUMBER').value
      };
    }
    if (this.match('STRING')) {
      return {
        type: 'StringLiteral',
        value: this.consume('STRING').value
      };
    }

    // Globals
    if (this.match('TIME')) {
      this.consume('TIME');
      return {
        type: 'GlobalAttribute',
        attribute: 'time'
      };
    }

    // Actor attributes
    if (this.match('PLAYER', 'TARGET')) {
      const actor = this.consume(this.current().type).value;
      this.consume('DOT');
      const attribute = this.parseAttributePath();
      return {
        type: 'ActorAttribute',
        actor,
        attribute
      };
    }

    // Aura/Ability attributes
    if (this.match('STRING')) {
      const name = this.consume('STRING').value;
      if (this.match('DOT')) {
        this.consume('DOT');
        const attribute = this.consume('IDENTIFIER').value;
        return {
          type: 'AbilityAttribute',
          name,
          attribute
        };
      }
      return {
        type: 'StringLiteral',
        value: name
      };
    }

    throw new Error(`Unexpected token in variable: ${this.current().type}`);
  }

  parseAttributePath() {
    const identifier = this.consume('IDENTIFIER').value;
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
    if (action.type === 'UseAction') {
      return (state) => ({
        type: 'use',
        ability: action.ability
      });
    } else if (action.type === 'WaitAction') {
      const durationFn = this.compileVariable(action.duration);
      return (state) => ({
        type: 'wait',
        duration: durationFn(state)
      });
    }
  }

  compilePredicate(predicate) {
    if (predicate.type === 'ComparisonExpression') {
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
    } else if (predicate.type === 'LogicalExpression') {
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
    if (variable.type === 'Literal') {
      const value = variable.value;
      return () => value;
    }

    if (variable.type === 'StringLiteral') {
      const value = variable.value;
      return () => value;
    }

    if (variable.type === 'GlobalAttribute') {
      if (variable.attribute === 'time') {
        return (state) => state.time;
      }
    }

    if (variable.type === 'ActorAttribute') {
      const attribute = variable.attribute;

      // const Actor = actorStr === 'PLAYER' ? state.Tank : state.Boss;

      const actorStr = 'PLAYER' ? 'Tank' : 'Boss';
      return (state) => {

        if (attribute === 'attackpower' || attribute === 'crit' ||
            attribute === 'swingtimer' || attribute === 'oh_swingtimer') {
          return state[actorStr].getAttribute(attribute);
        }

        // TODO: Handle chained attributes.
        return state[actorStr].getAttribute(attribute);
      };
    }

    if (variable.type === 'AbilityAttribute') {
      const name = variable.name;
      const attribute = variable.attribute;

      return (state) => {
        const ability = state.Tank.abilities?.find(a => a.name === name);
        if (ability) {
          return ability[attribute];
        }

        const aura = state.Tank.auras?.find(a => a.name === name);
        if (aura) {
          return aura[attribute];
        }

        const targetAbility = state.Boss.abilities?.find(a => a.name === name);
        if (targetAbility) {
          return targetAbility[attribute];
        }

        const targetAura = state.Boss.auras?.find(a => a.name === name);
        if (targetAura) {
          return targetAura[attribute];
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
          if (actor.actionUsable(State, action.ability)) {
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
