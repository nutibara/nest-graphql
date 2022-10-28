import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Int } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ListsService } from './lists.service';
import { ListItemService } from '../list-item/list-item.service';

import { List } from './entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { User } from '../users/entities/user.entity';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateListInput, UpdateListInput } from './dto/inputs';
import { PaginationArgs, SearchArgs } from '../common/dto/args';


@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService,
    
    ) { }

  @Mutation(() => List, { name: 'createList' })
  createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User
  ): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  findOne(
   @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
   @CurrentUser() user: User
   ): Promise<List> {
   return this.listsService.findOne(id, user);
 }

 @Mutation(() => List)
 async updateList(
   @Args('updateListInput') updateListInput: UpdateListInput,
   @CurrentUser() user: User
 ):Promise<List> {
   return this.listsService.update( updateListInput.id, updateListInput, user);
 }

 @Mutation(() => List)
 async removeList(
   @Args('id', { type: () => ID }) id: string,
   @CurrentUser() user: User
   ): Promise<List> {
   return this.listsService.remove(id, user);
 }

 @ResolveField(() => [ListItem], {name: 'items'} )
 async getListItems(

  @Parent() list: List,
  @Args() paginationArgs: PaginationArgs,
  @Args() searchArgs: SearchArgs,
 ): Promise<ListItem[]> {

  return this.listItemsService.findAll(list, paginationArgs, searchArgs);
 }

 @ResolveField( () => Int, {name: 'totalItems'})
  async countListItemsByList(
    @Parent() list: List,
 
  ): Promise<number> {

    return this.listItemsService.listCountByItems(list);
  }
}
