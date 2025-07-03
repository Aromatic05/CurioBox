import { Test, TestingModule } from '@nestjs/testing';
import { CurioBoxController } from './curio-box.controller';
import { CurioBoxService } from './curio-box.service';

describe('CurioBoxController', () => {
  let controller: CurioBoxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurioBoxController],
      providers: [CurioBoxService],
    }).compile();

    controller = module.get<CurioBoxController>(CurioBoxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
