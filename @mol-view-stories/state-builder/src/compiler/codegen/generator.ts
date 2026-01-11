import { MVSNode } from '../ast/node';
import { AST, ASTNode } from '../ast/types';
import { CodeGenContext } from './context';
import { NodeMethodMapper } from './mappings';
import { ParamFormatter } from './formatters';

export interface GeneratorOptions {
  /**
   * Whether to include section markers
   * @default true
   */
  includeSectionMarkers?: boolean;

  /**
   * Name of the builder variable (already exists in scope)
   * @default 'builder'
   */
  builderVar?: string;

  /**
   * Whether to include comments for structure
   * @default false
   */
  includeComments?: boolean;
}

export class CodeGenerator {
  private context: CodeGenContext;
  private output: string[] = [];
  private options: Required<GeneratorOptions>;

  constructor(options: GeneratorOptions = {}) {
    this.context = new CodeGenContext();
    this.options = {
      includeSectionMarkers: options.includeSectionMarkers ?? true,
      builderVar: options.builderVar ?? 'builder',
      includeComments: options.includeComments ?? false,
    };
  }

  generate(ast: AST): string {
    this.output = [];
    this.context.reset();

    // Start marker
    if (this.options.includeSectionMarkers) {
      this.emit('// ============================================');
      this.emit('// Start of generated section');
      this.emit('// ============================================');
      this.emit('');
    }

    // Generate code for root children
    this.generateNode(ast.root, this.options.builderVar);

    // End marker
    if (this.options.includeSectionMarkers) {
      this.emit('');
      this.emit('// ============================================');
      this.emit('// End of generated section');
      this.emit('// ============================================');
    }

    return this.output.join('\n');
  }

  /**
   * Generate code for a single node
   */
  private generateNode(node: ASTNode<any>, contextVar: string): string | void {
    // Skip root node itself, just process children
    if (node.kind === 'root') {
      const children = node.getChildren();

      if (this.options.includeComments && children.length > 0) {
        this.emit('// Root-level setup');
      }

      children.forEach(child => {
        this.generateNode(child, contextVar);
      });
      return;
    }

    const methodName = NodeMethodMapper.getMethodName(node);
    const params = ParamFormatter.formatParams(node);
    const isChainable = NodeMethodMapper.isChainable(node);
    const needsVar = NodeMethodMapper.needsVariable(node);

    // Add comment for major structural nodes
    if (this.options.includeComments && needsVar) {
      this.emit(`// ${this.getNodeDescription(node)}`);
    }

    if (isChainable) {
      // Chainable nodes return parent
      this.emit(`${contextVar}.${methodName}(${params});`);
      return;
    }

    if (needsVar) {
      // Nodes that create new scope
      const varName = this.context.nextVar(node.kind, node.ref);
      this.emit(`const ${varName} = ${contextVar}.${methodName}(${params});`);

      // Process children with new context
      const children = node.getChildren();
      if (children.length > 0) {
        if (this.options.includeComments) {
          this.emit('');
        }
        children.forEach(child => {
          this.generateNode(child, varName);
        });
      }

      return varName;
    }

    // Fallback: simple method call
    this.emit(`${contextVar}.${methodName}(${params});`);
  }

  /**
   * Get human-readable description for a node
   */
  private getNodeDescription(node: ASTNode): string {
    switch (node.kind) {
      case 'download': return `Download: ${node.getParam('url')}`;
      case 'parse': return `Parse as ${node.getParam('format')}`;
      case 'structure': return `Structure: ${node.getParam('type')}`;
      case 'component': return 'Component';
      case 'representation': return `Representation: ${node.getParam('type')}`;
      case 'volume': return 'Volume data';
      case 'primitives': return 'Primitives group';
      default: return node.kind;
    }
  }

  private emit(line: string): void {
    this.output.push(line);
  }

  public reset() {
    this.context.reset()
    this.output = []
  }
}