import { Module } from '@nestjs/common';
import { ENTRYDIR } from './constants';
import { join } from 'path';
import { CurioBoxModule } from './curio-box/curio-box.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CurioBox } from './curio-box/entities/curio-box.entity';
import { ItemsModule } from './items/items.module';
import { Item } from './items/entities/item.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { BlocklistedToken } from './auth/entities/blocklisted-token.entity';
import { ShowcaseModule } from './showcase/showcase.module';
import { ShowcasePost } from './showcase/entities/showcase-post.entity';
import { Comment } from './showcase/entities/comment.entity';
import { Tag } from './showcase/entities/tag.entity';
import { UserBoxesModule } from './user-boxes/user-boxes.module';
import { UserBox } from './user-boxes/entities/user-box.entity';
import { UserItem } from './items/entities/user-item.entity';
import { UsersModule } from './users/users.module';
import { PostLike } from './showcase/entities/post-like.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: join(ENTRYDIR, 'curiobox.db'),
            entities: [
                User,
                CurioBox,
                Item,
                Order,
                BlocklistedToken,
                ShowcasePost,
                Comment,
                Tag,
                UserBox,
                UserItem,
                PostLike,
            ],
            synchronize: true,
        }),
        CurioBoxModule,
        AuthModule,
        ItemsModule,
        OrdersModule,
        ShowcaseModule,
        UserBoxesModule,
        UsersModule,
    ],
    controllers: [],
    providers: [
        {
            provide: ENTRYDIR,
            useValue: ENTRYDIR,
        },
    ],
})
export class AppModule {}
