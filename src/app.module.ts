import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { ItemsModule } from './items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { async } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ListsModule } from './lists/lists.module';
import { ListItemModule } from './list-item/list-item.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      useFactory: async (jwt: JwtService) => ({
        playground: false,
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        plugins: [
          ApolloServerPluginLandingPageLocalDefault
        ],
        context({ req }) {
          //! Se debe separar el login en una API no GRAPHQL
          // const token = req.headers.authorization?.replace('Bearer ','');
          // if (!token) throw  Error ('Token needed');

          // const payload = jwt.decode(token);
          // if (!payload) throw  Error ('Token not valid');
        }
      })
    }),
    //! Configuracion basica
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   // debug: false,
    //   playground: false,
    //   plugins: [
    //   ApolloServerPluginLandingPageLocalDefault
    //   ],
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      ssl: (process.env.STATE === 'prod')
        ? {
          rejectUnauthorized: false,
          sslmode: 'require',
        } : false as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    ItemsModule,

    UsersModule,

    AuthModule,

    SeedModule,

    CommonModule,

    ListsModule,

    ListItemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {

  constructor() {

    console.log("STATE", process.env.STATE);
    console.log("host", process.env.DB_HOST);
    console.log("port", process.env.DB_PORT);
    console.log("username", process.env.DB_USERNAME);
    console.log("password", process.env.DB_PASSWORD);
    console.log("database", process.env.DB_NAME);

  }
}
