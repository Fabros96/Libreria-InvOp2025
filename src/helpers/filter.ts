import { PrismaClient } from "@prisma/client";

export class Filter {
  public className: string;
  public classUpperCase: string;
  public prisma: PrismaClient;
  public queryPayload!: any;

  constructor(className: string, classUpperCase: string) {
    this.prisma = new PrismaClient();
    this.className = className;
    this.classUpperCase = classUpperCase;
  }

  public createQueryPayload(query?: string) {
    if(!query){
      return {
        skip: 0,
        take: 10
      };
    }
    this.queryPayload = { where: {}};
    const parts = query.split('&');
    if (!this.queryPayload['where']) this.queryPayload['where'] = {};
    for (const part of parts) {
        if (part.includes('skip')) {
          this.queryPayload['skip'] = parseInt(part.split('=')[1]);
        } else if (part.includes('take')) {
          if(part.split('=')[1]!=="Infinity")
            this.queryPayload['take'] = parseInt(part.split('=')[1]);
        } else if (part.includes('include')) {
          this.createOrQueryIncludePayload(part);
        } else if (part.includes('orderBy')) {
          const algo = part.replace('][', '-').replace(']', '').replace('[', '');
          this.queryPayload['orderBy'] = {[part.split('=')[1]]: algo.split('=')[0].split('-')[1]};
        } else {
          const filter = part.replace('filter', '');
          const value: any = filter.split('=')[1];
          let operation = (filter.split('=')[0]);
          operation = operation.replace('][', '-').replace(']', '').replace('[', '');
          if (!this.queryPayload['where']) this.queryPayload['where'] = {};
          if (operation?.includes('|')) {
            this.createOrQueryPayload(operation, value);
          } else {
            this.createAndQueryPayload(operation, value);
          }
        }
    }
    return this.queryPayload;
  }

  public getFieldValue(field: string, value: any): any {
    if(typeof value == 'string' && value.includes(',')) return value.split(',').map(v => Number(v));
    switch ((this.prisma as any)[this.className]?.fields[field]?.typeName) {
      case "Int":
        if (value == 'null') return null;
        return Number(value);
        break;
      case "DateTime":
        if (value == 'null') return null;
        return new Date(value);
        break;
      default:
        if (value == 'null') return null;
        return value;
        break;
    }
  }

  public createOrQueryIncludePayload(part: string) {
    if (!this.queryPayload['include']) this.queryPayload['include'] = {};
    let result: any = {};
    result = this.parseFilterString(part);
    this.queryPayload['include'] = result['include'];
  }

  public parseFilterString(filterString: any) {
    const match = filterString.match(/filter\[include\]=(.+)/);
    if (!match) return {};
    const parts = match[1].split(',');
    const result: any  ={ include: {} };
    parts.forEach((part: any) => {
      const keys = part.split('.');
      const lastKey = keys[keys.length - 1];
      let current = result.include;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // Si no existe la clave, inicializa el objeto
        if (!current[key]) {
          current[key] = i === keys.length - 1 ? true : { include: {} };
        }
        // Si no es el último nivel, baja al siguiente nivel
        if (i < keys.length - 1) {
          current = current[key].include;
        }
      }
      // Agregar a current el último key si no es el último nivel
      if (current[lastKey] !== true) {
        current[lastKey] = true;
      }
    });
    return result;
  }

  public createOrQueryPayload(operation: string, value: any) {
    const splitted = operation.split('-');
    const fields = splitted[0];
    if (!this.queryPayload['where']['OR']) this.queryPayload['where']['OR'] = [];
    for (const field of fields.split('|')) {
      const data: any = {};
      data[field] = this.getFieldValue(field, value);
      if (splitted[1] == 'like') data[field] = {contains: data[field]};
      this.queryPayload['where']['OR'].push(data);
    }
  }

  public createAndQueryPayload(operation: string, value: any) {
    const field = operation.split('-')[0];
    const operator = operation.split('-')[1];
    value = this.getFieldValue(field, value);
    const filter: any = this.getArrayObject(field, value, operator);
    if (!this.queryPayload['where']) this.queryPayload['where'] = {};
    for (const key in filter) {
      if (filter.hasOwnProperty(key)) {
        if (this.queryPayload['where'][key]) {
          if (typeof this.queryPayload['where'][key] === 'object' && typeof filter[key] === 'object') {
            this.queryPayload['where'][key] = { ...this.queryPayload['where'][key], ...filter[key] };
          } else {
            this.queryPayload['where'][key] = filter[key];
          }
        } else {
          this.queryPayload['where'][key] = filter[key];
        }
      }
    }
  }

  getArrayObject(field: any, value: any, operation: string) {
    let result: any = {};
    const keys: any[] = field.split('.');
    let lastKey: string = keys.pop(); // Obtener la última clave
    if (lastKey && lastKey.startsWith('id') && !(Array.isArray(value))) value = Number(value);
    if (operation === 'like') {
      result[lastKey] = { contains: value };
    } else if (operation === 'eq') {
      if (value === 'null') value = null; // Ajustar para que 'null' se convierta en null
      if (Array.isArray(value)) {
        result[lastKey] = {in: value};
      } else {
        result[lastKey] = value;
      }
    } else if (['gte','lte'].includes(operation)) {
      if (value === 'null') value = null; // Ajustar para que 'null' se convierta en null
      if (!result[lastKey]) {
        result[lastKey] = { [operation]: value }
      } else {
        result[lastKey][operation] = value;
      }
    }
    
    // Estructurar adecuadamente para campos anidados
    if (keys.length > 0) {
      const nestedResult = keys.reverse().reduce((acc: any, key: any) => {
        return { [key]: acc }; // Cambiar 'where' a 'some'
      }, result);
      return nestedResult;
    }
    return result; 
  }
}