import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationService } from '../authentication.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import mockedConfigService from 'src/utils/mocks/config.service';
import mockedJwtService from 'src/utils/mocks/jwt.service';

describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        UsersService,
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();
    authenticationService = await module.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const userId = 1;
      expect(
        typeof authenticationService.getCookieWithJwtAccessToken(userId),
      ).toEqual('string');
    });
  });
});
