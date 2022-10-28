import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateListInput {

  @Field( () => String )
  @IsNotEmpty()
  @IsString()
  name: string;

}