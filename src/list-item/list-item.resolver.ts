import { Resolver, Query, Mutation, Args, Int, Parent, ID } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { List } from '../lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(private readonly listItemsService: ListItemService) {}

  @Mutation(() => ListItem)
  createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    //! pueden pedir el usuario para validarlo
    ): Promise<ListItem> {
    return this.listItemsService.create(createListItemInput);
  }

//   @Query(() => [ListItem], { name: 'listItem' })
//   findAll(  @Parent() list: List,
//   @Args() paginationArgs: PaginationArgs,
//   @Args() searchArgs: SearchArgs,
//  ): Promise<ListItem[]> {
//     return this.listItemsService.findAll(list, paginationArgs, searchArgs);
//   }

  @Query(() => ListItem, { name: 'listItem' })
  async findOne(
    @Args('id', { type: () => String}, ParseUUIDPipe ) id: string
    ): Promise<ListItem> {
    return this.listItemsService.findOne(id);
  }

  @Mutation(() => ListItem)
  updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
    ): Promise<ListItem> {
    return this.listItemsService.update(updateListItemInput.id, updateListItemInput);
  }

//   @Mutation(() => ListItem)
//   removeListItem(@Args('id', { type: () => Int }) id: number) {
//     return this.listItemService.remove(id);
//   }
}
