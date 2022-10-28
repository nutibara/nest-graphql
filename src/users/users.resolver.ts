import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';

import { User } from './entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { List } from '../lists/entities/list.entity';

import { ValidRolesArgs } from './dto/args/roles.arg';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginationArgs, SearchArgs } from '../common/dto/args';


@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    ) { }

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User
  ): Promise<User[]> {

    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin, ValidRoles.superUser]) user: User
  ): Promise<User> {


    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
 async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.update(updateUserInput.id, user, updateUserInput);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User
  ): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField( () => Int, {name: 'itemCount'})
  async itemCount(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) admin: User
  ): Promise<number> {

    return  this.itemsService.itemCountByUser(user);
  }
  
  @ResolveField( () => [Item], {name: 'items'})
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) admin: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {

    return  this.itemsService.findAll(user, paginationArgs, searchArgs);
  }

  @ResolveField( () => Int, {name: 'listCount'})
  async listCount(
    @Parent() user: User,
    @CurrentUser([ValidRoles.admin]) admin: User
  ): Promise<number> {

    return  this.listsService.listCountByUser(user);
  }

  @ResolveField( () => [List], {name: 'lists'})
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) admin: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {

    return  this.listsService.findAll(user, paginationArgs, searchArgs);
  }
}
