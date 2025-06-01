import { PrismaClient } from "@prisma/client";
import { Filter } from "../helpers/filter";

export class BaseRepository {

  public prisma: PrismaClient;
  public className: string;
  public classUpperCase!: string;
  public queryPayload: any = {};
  public filter: Filter;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ]
    });
    this.className = this.getClassName();
    this.classUpperCase = this.getClassNameUpperCase();
    this.filter = new Filter(this.className, this.classUpperCase);
  }

  getClassName() { 
    let name = this.constructor.name.replace('Repository', '');
    return name[0].toLowerCase() + name.slice(1);
  }
  getClassNameUpperCase() { return this.constructor.name.replace('Repository', ''); }

  public findUnique(query?: string) {
    return (this.prisma as any)[this.getClassName()].findUnique(this.filter.createQueryPayload(query));
  }

  public findFirst(query?: string) {
    return (this.prisma as any)[this.getClassName()].findFirst(this.filter.createQueryPayload(query));
  }

  public async findMany(query: string) {
    if (!query.includes('?')) query = `${query}?`;
    try {
      const urlPayload = query.split('?')[1] || '';
      const className = this.getClassName();
      const result = await (this.prisma as any)[className].findMany(this.filter.createQueryPayload(urlPayload));
      return result;
    } catch (error: any) {
      console.log(error);
    }
  }
  public async getPaginate(params: URLSearchParams,limit: number, page: number,route: string) {
    try {
        params.delete('skip');
        params.delete('take');
        params.set('take',"Infinity")
        const query = decodeURIComponent(params.toString())
        const  urlPayload = query || '';
        const className = this.getClassName();
        const payload = this.filter.createQueryPayload(urlPayload);
        const countResult = await (this.prisma as any)[className].count(payload);
        const totalPages = Math.ceil(countResult / limit);
        let links:any[] = [];
        if (totalPages > 1 && Number.isFinite(totalPages) && totalPages > 0) {
          links = Array.from({ length: totalPages }, (_, i) => {
          const pageIndex = i + 1;
          return {
            active: pageIndex === page,
            label: pageIndex.toString(),
            url:
              pageIndex === page
                ? null
                : `${route}?page=${pageIndex}`,
          };
        });
      }
      return links
    } catch (err) {
        return []
    }
}

  public async findById(id: number, query: string) {
    if (!query.includes('?')) query = `${query}?`;
    try {
      let urlPayload = `[id${this.classUpperCase}][eq]=${id}`;
      if (query.split('?')[1]) urlPayload += `&${query.split('?')[1]}`;
      return await (this.prisma as any)[this.getClassName()].findUnique(this.filter.createQueryPayload(urlPayload));
    } catch (error: any) {
      console.log(error);
    }
  }

  public async create(payload: any, includes?: string) {
    const includePayload: any = {};
    const data: any = {};
    data['data'] = payload; 
    if (includes){
      for (let i of includes.split(',')) {
        includePayload[i] = true;
      }
      data['include'] = includePayload;
    }
    try {
      return await (this.prisma as any)[this.className].create(data);
    } catch (error: any) {
      throw new Error(`Problemas al crear registro. ${error.meta?.details}`)
    }
  }

  public async updateById(id: number, payload: any) {
    try {
      const idPayload: any = {};
      idPayload[`id${this.classUpperCase}`] = id;
      return await (this.prisma as any)[this.className]?.update({
        where: idPayload,
        data: payload
      })
    } catch (error: any) {
      console.log(error);
    }
  }

  public async deleteById(id: number) {
    try {
      const payload: any = {};
      payload[`id${this.classUpperCase}`] = Number(id);
      return await (this.prisma as any)[this.className].delete({
        where: payload,
      });
    } catch (error: any) {
      console.log(error);
    }
  }
}