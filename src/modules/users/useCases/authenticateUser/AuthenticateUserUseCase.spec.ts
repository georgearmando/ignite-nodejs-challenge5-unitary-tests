import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to authenticate an user', async () => {
    await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: 'johndoe@example.com',
      password: '12345'
    });

    expect(userAuthenticated).toHaveProperty('token');
  });

  it('Should not be able to authenticate a non exists user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'johndoe@example.com',
        password: '12345'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate with a incorrect password', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '12345'
      });

      await authenticateUserUseCase.execute({
        email: 'johndoe@example.com',
        password: 'incorrect-password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
