import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';

import { IUsersRepository } from '../../../accounts/repositories/IUsersRepository';
import { IChatsRepository } from '../../repositories/IChatsRepository';

interface IRequest {
  title: string;
  user_id: string;
}

@Injectable()
export class CreateChatService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject('ChatsRepository')
    private readonly chatsRepository: IChatsRepository
  ) { }

  async execute({ title, user_id }: IRequest): Promise<Chat> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new HttpException('User does not exists!', 400);
    }

    const chatAlreadyExists = await this.chatsRepository.findByUserId(user_id);

    if (chatAlreadyExists) {
      return chatAlreadyExists;
    } else {
      const data = {
        title,
        user: {
          connect: {
            id: user.id
          }
        },
      };

      const response = await this.chatsRepository.create(data);

      return response;
    }
  }
}