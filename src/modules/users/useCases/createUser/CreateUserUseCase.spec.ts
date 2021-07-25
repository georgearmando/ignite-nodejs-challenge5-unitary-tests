import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should de able to crate a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    expect(user).toHaveProperty('id');
  });

  it('Should not be able to create a new user with an existing email', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '12345'
      });

      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '12345'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
