import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { List } from './entities/list.entity';

import { CreateListInput, UpdateListInput } from './dto/inputs/';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,

  ) { }
  
  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listsRepository.create({ ...createListInput, user });
    return await this.listsRepository.save(newList);
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<List[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const qyb = this.listsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, {userId: user.id});

      if (search) {
        qyb.andWhere('LOWER(name) like :name', { name: `%${ search.toLocaleLowerCase() }%`})

      }

      return qyb.getMany();
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listsRepository.findOneBy({
      id,
      user: {
        id: user.id
      }
    });

    if (!list) throw new NotFoundException(`List with id: ${id} not found `);

    return list;
  }

  async update(id: string, updateListInput: UpdateListInput, user: User): Promise<List> {

    await this.findOne(id, user);
    const list = await this.listsRepository.preload(updateListInput);
    
    if (!list) throw new NotFoundException(`List with id: ${id} not found `);

    return this.listsRepository.save(list);

  }

  async remove(id: string, user: User): Promise<List> {
    // TODO: soft delete, integridad referencial
    const list = await this.findOne(id, user);
    await this.listsRepository.remove(list);
    return { ...list, id };
  }

  async listCountByUser(user: User): Promise<number> {

    return this.listsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }
}
