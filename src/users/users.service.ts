import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {

  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  async create(signupInput: SignupInput): Promise<User> {

    try {

      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      });

      return await this.usersRepository.save(newUser);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {

    if (roles.length === 0)
      return this.usersRepository.find({
        //TODO: No es necesario porque tenemos lazy la propiedad lastUpdateBy
        // relations: {
        //   lastUpdateBy: true
        // }
      });

    return this.usersRepository.createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();

  }

  async findOne(id: string): Promise<User> {
    try {

      throw new Error(`findOne method not implemented`)

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {

      return await this.usersRepository.findOneByOrFail({ email });

    } catch (error) {
      this.handleDBErrors({
        code: 'err-001',
        detail: `${email} not found`
      });
    }
  }

  async findOneById(id: string): Promise<User> {
    try {

      return await this.usersRepository.findOneByOrFail({ id });

    } catch (error) {
      this.handleDBErrors({
        code: 'err-001',
        detail: `${id} not found`
      });
    }
  }

  async update(
    id: string,
    updateBy: User,
    updateUserInput: UpdateUserInput
    //TODO: updateBy
  ): Promise<User> {

    try {

      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id
      });

      user.lastUpdateBy = updateBy;

      return await this.usersRepository.save(user);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;

    return await this.usersRepository.save(userToBlock);
  }


  private handleDBErrors(error: any): never {

    this.logger.error(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }

    if (error.code === 'err-001') {
      throw new NotFoundException(error.detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
