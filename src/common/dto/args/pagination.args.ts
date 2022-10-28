import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsOptional, Min } from "class-validator";


@ArgsType()
export class PaginationArgs {
    
    //Saltar registros
    @Field(() => Int, {nullable: true})
    @IsOptional()
    @Min(0)
    offset: number = 0;

    //limite de pagina
    @Field(() => Int, {nullable: true})
    @IsOptional()
    @Min(1)
    limit: number = 10;

}