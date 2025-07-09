import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBoxesService } from './user-boxes.service';
import { UserBoxesController } from './user-boxes.controller';
import { UserBox } from './entities/user-box.entity';
import { CurioBox } from '../curio-box/entities/curio-box.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserBox, CurioBox, Item, User]),
    ],
    controllers: [UserBoxesController],
    providers: [UserBoxesService],
    exports: [UserBoxesService],
})
export class UserBoxesModule {}