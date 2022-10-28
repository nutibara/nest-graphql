import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Like, QueryBuilder, Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

  ) { }

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });

    return await this.itemsRepository.save(newItem);
    // return newItem;
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const qyb = this.itemsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, {userId: user.id});

      if (search) {
        qyb.andWhere('LOWER(name) like :name', { name: `%${ search.toLocaleLowerCase() }%`})

      }

      return qyb.getMany();

    // return await this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id
    //     },
    //     name: Like(`%${search.toLocaleLowerCase}%`)
    //   }
    // });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id,
      user: {
        id: user.id
      }
    });

    if (!item) throw new NotFoundException(`Item with id: ${id} not found `);

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {

    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);
    // const item = await this.itemsRepository.preload({...updateItemInput, user});

    if (!item) throw new NotFoundException(`Item with id: ${id} not found `);

    return this.itemsRepository.save(item);

  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {

    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }
}
