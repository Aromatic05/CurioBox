import { Test, TestingModule } from '@nestjs/testing';
import { CurioBoxService } from './curio-box.service';

describe('CurioBoxService', () => {
  let service: CurioBoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurioBoxService],
    }).compile();

    service = module.get<CurioBoxService>(CurioBoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
